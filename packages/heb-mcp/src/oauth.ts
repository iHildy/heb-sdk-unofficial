import type { OAuthRegisteredClientsStore } from '@modelcontextprotocol/sdk/server/auth/clients.js';
import {
  InvalidGrantError,
  InvalidTargetError,
  InvalidTokenError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';
import type { AuthorizationParams, OAuthServerProvider } from '@modelcontextprotocol/sdk/server/auth/provider.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { checkResourceAllowed, resourceUrlFromServerUrl } from '@modelcontextprotocol/sdk/shared/auth-utils.js';
import type { OAuthClientInformationFull, OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';
import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import { extractBearerToken, verifyClerkToken, type AuthContext } from './auth.js';

type EncryptedPayload = {
  v: 1;
  alg: 'aes-256-gcm';
  iv: string;
  tag: string;
  data: string;
};

type AuthorizationCodeRecord = {
  clientId: string;
  userId: string;
  scopes: string[];
  codeChallenge: string;
  redirectUri: string;
  resource?: string;
  expiresAt: number;
};

type AccessTokenRecord = {
  token: string;
  clientId: string;
  userId: string;
  scopes: string[];
  resource?: string;
  expiresAt: number;
};

type RefreshTokenRecord = {
  token: string;
  clientId: string;
  userId: string;
  scopes: string[];
  resource?: string;
  expiresAt: number;
};

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour
const DEFAULT_REFRESH_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
const DEFAULT_CODE_TTL_SECONDS = 10 * 60; // 10 minutes

const DEFAULT_CLIENT_STORE_DIR = path.join(process.cwd(), 'data', 'oauth');
const DEFAULT_CLIENT_STORE_FILE = path.join(DEFAULT_CLIENT_STORE_DIR, 'clients.json');

function parseIntEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function loadEncryptionKey(): Buffer | null {
  const raw = process.env.HEB_SESSION_ENCRYPTION_KEY;
  if (!raw) return null;
  const trimmed = raw.startsWith('base64:') ? raw.slice('base64:'.length) : raw;
  const buf = Buffer.from(trimmed, 'base64');
  if (buf.length !== 32) {
    throw new Error('HEB_SESSION_ENCRYPTION_KEY must be 32 bytes (base64-encoded).');
  }
  return buf;
}

function encryptPayload(payload: unknown, key: Buffer): EncryptedPayload {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    v: 1,
    alg: 'aes-256-gcm',
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  };
}

function decryptPayload(payload: EncryptedPayload, key: Buffer): unknown {
  const iv = Buffer.from(payload.iv, 'base64');
  const tag = Buffer.from(payload.tag, 'base64');
  const data = Buffer.from(payload.data, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}

function isEncryptedPayload(payload: unknown): payload is EncryptedPayload {
  return Boolean(
    payload
      && typeof payload === 'object'
      && (payload as EncryptedPayload).alg === 'aes-256-gcm'
      && (payload as EncryptedPayload).v === 1
  );
}

function parseCookies(header?: string): Record<string, string> {
  if (!header) return {};
  const cookies: Record<string, string> = {};
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (!key) continue;
    cookies[key] = decodeURIComponent(rest.join('=').trim());
  }
  return cookies;
}

function resolveClerkToken(req: Request): string | null {
  const headerToken = extractBearerToken(req);
  if (headerToken) return headerToken;

  const queryToken = (req.query as Record<string, unknown> | undefined)?.clerk_token;
  if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
    return queryToken.trim();
  }

  const cookies = parseCookies(req.headers.cookie);
  const token = cookies.__session || cookies.__clerk_session || null;

  if (!token) {
    console.log('[heb-mcp] No token found in cookies. Available cookies:', Object.keys(cookies));
    if (req.query.clerk_token) {
      console.log('[heb-mcp] Found clerk_token in query:', req.query.clerk_token);
    }
  }

  return token;
}

export function resolvePublicUrl(port: number): URL {
  const raw = process.env.MCP_SERVER_URL ?? `http://localhost:${port}`;
  return new URL(raw);
}

export function resolveIssuerUrl(publicUrl: URL): URL {
  const raw = process.env.MCP_OAUTH_ISSUER_URL ?? publicUrl.href;
  return new URL(raw);
}

export function resolveOAuthScopes(): string[] {
  const raw = process.env.MCP_OAUTH_SCOPES ?? 'mcp:tools';
  return raw
    .split(/[,\s]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export function createAuthorizeContextMiddleware(options: {
  publicUrl: URL;
  signInUrl?: string;
}): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (req, res, next) => {
    try {
      const token = resolveClerkToken(req);
      if (token) {
        const auth = await verifyClerkToken(token);
        if (auth) {
          res.locals.clerkAuth = auth;
          return next();
        }
      }

      const signInUrl = buildClerkSignInUrl(options.signInUrl, new URL(req.originalUrl, options.publicUrl));
      if (signInUrl) {
        res.locals.clerkSignInUrl = signInUrl;
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

function buildClerkSignInUrl(raw: string | undefined, returnTo: URL): string | null {
  if (!raw) return null;

  const encodedReturnTo = encodeURIComponent(returnTo.toString());
  const placeholders: Record<string, string> = {
    '{{redirect_url}}': encodedReturnTo,
    '{redirect_url}': encodedReturnTo,
    '{redirect}': encodedReturnTo,
    '{after_sign_in_url}': encodedReturnTo,
    '{after_sign_up_url}': encodedReturnTo,
  };
  const hasPlaceholder = Object.keys(placeholders).some((key) => raw.includes(key));
  if (hasPlaceholder) {
    let result = raw;
    for (const [key, value] of Object.entries(placeholders)) {
      result = result.replaceAll(key, value);
    }
    return result;
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  url.searchParams.set('redirect_url', returnTo.toString());
  url.searchParams.set('after_sign_in_url', returnTo.toString());

  return url.toString();
}

class FileOAuthClientsStore implements OAuthRegisteredClientsStore {
  private readonly filePath: string;
  private readonly encryptionKey: Buffer | null;
  private cache: Map<string, OAuthClientInformationFull> | null = null;

  constructor(options?: { filePath?: string }) {
    this.filePath = options?.filePath ?? DEFAULT_CLIENT_STORE_FILE;
    this.encryptionKey = loadEncryptionKey();
  }

  async getClient(clientId: string): Promise<OAuthClientInformationFull | undefined> {
    await this.load();
    return this.cache?.get(clientId);
  }

  async registerClient(
    client: OAuthClientInformationFull
  ): Promise<OAuthClientInformationFull> {
    await this.load();
    if (!this.cache) {
      this.cache = new Map();
    }
    this.cache.set(client.client_id, client);
    await this.persist();
    return client;
  }

  private async load(): Promise<void> {
    if (this.cache) return;

    this.cache = new Map();
    if (!fs.existsSync(this.filePath)) {
      return;
    }

    const raw = await fs.promises.readFile(this.filePath, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, OAuthClientInformationFull> | EncryptedPayload;
    if (isEncryptedPayload(parsed) && !this.encryptionKey) {
      throw new Error('Encrypted OAuth client store found but HEB_SESSION_ENCRYPTION_KEY is not set.');
    }
    const data = isEncryptedPayload(parsed)
      ? decryptPayload(parsed, this.encryptionKey as Buffer)
      : parsed;

    if (data && typeof data === 'object') {
      for (const [clientId, clientInfo] of Object.entries(data as Record<string, OAuthClientInformationFull>)) {
        if (clientInfo && typeof clientInfo === 'object') {
          this.cache.set(clientId, clientInfo);
        }
      }
    }
  }

  private async persist(): Promise<void> {
    if (!this.cache) return;

    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const payload = Object.fromEntries(this.cache.entries());
    const data = this.encryptionKey ? encryptPayload(payload, this.encryptionKey) : payload;
    await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }
}

export class ClerkOAuthProvider implements OAuthServerProvider {
  private readonly codes = new Map<string, AuthorizationCodeRecord>();
  private readonly accessTokens = new Map<string, AccessTokenRecord>();
  private readonly refreshTokens = new Map<string, RefreshTokenRecord>();

  private readonly accessTokenTtlMs: number;
  private readonly refreshTokenTtlMs: number;
  private readonly codeTtlMs: number;
  private readonly resourceUrl: URL;
  private readonly requireResource: boolean;
  private readonly supportedScopes: string[];

  readonly clientsStore: OAuthRegisteredClientsStore;

  constructor(options: {
    publicUrl: URL;
    clientsStore?: OAuthRegisteredClientsStore;
    tokenTtlSeconds?: number;
    refreshTtlSeconds?: number;
    codeTtlSeconds?: number;
    requireResource?: boolean;
    supportedScopes?: string[];
  }) {
    this.clientsStore = options.clientsStore ?? new FileOAuthClientsStore({
      filePath: process.env.MCP_OAUTH_CLIENTS_FILE,
    });

    this.accessTokenTtlMs = (options.tokenTtlSeconds ?? parseIntEnv(process.env.MCP_OAUTH_TOKEN_TTL_SECONDS, DEFAULT_TOKEN_TTL_SECONDS)) * 1000;
    this.refreshTokenTtlMs = (options.refreshTtlSeconds ?? parseIntEnv(process.env.MCP_OAUTH_REFRESH_TTL_SECONDS, DEFAULT_REFRESH_TTL_SECONDS)) * 1000;
    this.codeTtlMs = (options.codeTtlSeconds ?? parseIntEnv(process.env.MCP_OAUTH_CODE_TTL_SECONDS, DEFAULT_CODE_TTL_SECONDS)) * 1000;
    this.resourceUrl = resourceUrlFromServerUrl(options.publicUrl);
    this.requireResource = options.requireResource ?? true;
    this.supportedScopes = options.supportedScopes ?? resolveOAuthScopes();
  }

  async authorize(client: OAuthClientInformationFull, params: AuthorizationParams, res: Response): Promise<void> {
    const auth = res.locals.clerkAuth as AuthContext | undefined;
    if (!auth) {
      const signInUrl = res.locals.clerkSignInUrl as string | undefined;
      if (signInUrl) {
        res.redirect(signInUrl);
        return;
      }
      res.status(401).send('Authentication required. Configure CLERK_SIGN_IN_URL for OAuth logins.');
      return;
    }

    this.assertResourceAllowed(params.resource);

    const code = crypto.randomUUID();
    const requestedScopes = params.scopes && params.scopes.length > 0 ? params.scopes : this.supportedScopes;
    const scopes = requestedScopes.filter((scope) => this.supportedScopes.includes(scope));
    if (scopes.length !== requestedScopes.length) {
      throw new InvalidGrantError('Invalid scope');
    }
    this.codes.set(code, {
      clientId: client.client_id,
      userId: auth.userId,
      scopes,
      codeChallenge: params.codeChallenge,
      redirectUri: params.redirectUri,
      resource: params.resource?.href,
      expiresAt: Date.now() + this.codeTtlMs,
    });

    const redirectUrl = new URL(params.redirectUri);
    redirectUrl.searchParams.set('code', code);
    if (params.state) {
      redirectUrl.searchParams.set('state', params.state);
    }
    res.redirect(redirectUrl.toString());
  }

  async challengeForAuthorizationCode(client: OAuthClientInformationFull, authorizationCode: string): Promise<string> {
    const record = this.codes.get(authorizationCode);
    if (!record || record.clientId !== client.client_id) {
      throw new InvalidGrantError('Invalid authorization code');
    }
    return record.codeChallenge;
  }

  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
    _codeVerifier?: string,
    redirectUri?: string,
    resource?: URL
  ): Promise<OAuthTokens> {
    const record = this.codes.get(authorizationCode);
    if (!record) {
      throw new InvalidGrantError('Invalid authorization code');
    }
    if (record.clientId !== client.client_id) {
      throw new InvalidGrantError('Authorization code was not issued to this client');
    }
    if (record.expiresAt < Date.now()) {
      this.codes.delete(authorizationCode);
      throw new InvalidGrantError('Authorization code expired');
    }
    if (redirectUri && record.redirectUri !== redirectUri) {
      throw new InvalidGrantError('redirect_uri does not match');
    }

    const resolvedResource = resource ?? (record.resource ? new URL(record.resource) : undefined);
    if (record.resource && resolvedResource && record.resource !== resolvedResource.href) {
      throw new InvalidGrantError('resource does not match original authorization');
    }
    this.assertResourceAllowed(resolvedResource);

    this.codes.delete(authorizationCode);
    const accessToken = crypto.randomUUID();
    const refreshToken = crypto.randomUUID();
    const now = Date.now();
    const accessExpiresAt = now + this.accessTokenTtlMs;
    const refreshExpiresAt = now + this.refreshTokenTtlMs;

    this.accessTokens.set(accessToken, {
      token: accessToken,
      clientId: client.client_id,
      userId: record.userId,
      scopes: record.scopes,
      resource: resolvedResource?.href ?? record.resource,
      expiresAt: accessExpiresAt,
    });

    this.refreshTokens.set(refreshToken, {
      token: refreshToken,
      clientId: client.client_id,
      userId: record.userId,
      scopes: record.scopes,
      resource: resolvedResource?.href ?? record.resource,
      expiresAt: refreshExpiresAt,
    });

    return {
      access_token: accessToken,
      token_type: 'bearer',
      expires_in: Math.floor(this.accessTokenTtlMs / 1000),
      refresh_token: refreshToken,
      scope: record.scopes.join(' '),
    };
  }

  async exchangeRefreshToken(
    client: OAuthClientInformationFull,
    refreshToken: string,
    scopes?: string[],
    resource?: URL
  ): Promise<OAuthTokens> {
    const record = this.refreshTokens.get(refreshToken);
    if (!record) {
      throw new InvalidGrantError('Invalid refresh token');
    }
    if (record.clientId !== client.client_id) {
      throw new InvalidGrantError('Refresh token was not issued to this client');
    }
    if (record.expiresAt < Date.now()) {
      this.refreshTokens.delete(refreshToken);
      throw new InvalidGrantError('Refresh token expired');
    }

    const resolvedResource = resource ?? (record.resource ? new URL(record.resource) : undefined);
    if (record.resource && resolvedResource && record.resource !== resolvedResource.href) {
      throw new InvalidGrantError('resource does not match original authorization');
    }
    this.assertResourceAllowed(resolvedResource);

    const requestedScopes = scopes && scopes.length > 0 ? scopes : record.scopes;
    const allScopesValid = requestedScopes.every((scope) => record.scopes.includes(scope));
    if (!allScopesValid) {
      throw new InvalidGrantError('Invalid scope');
    }

    const newAccessToken = crypto.randomUUID();
    const newRefreshToken = crypto.randomUUID();
    const now = Date.now();
    const accessExpiresAt = now + this.accessTokenTtlMs;
    const refreshExpiresAt = now + this.refreshTokenTtlMs;

    this.accessTokens.set(newAccessToken, {
      token: newAccessToken,
      clientId: client.client_id,
      userId: record.userId,
      scopes: requestedScopes,
      resource: resolvedResource?.href ?? record.resource,
      expiresAt: accessExpiresAt,
    });

    this.refreshTokens.delete(refreshToken);
    this.refreshTokens.set(newRefreshToken, {
      token: newRefreshToken,
      clientId: client.client_id,
      userId: record.userId,
      scopes: requestedScopes,
      resource: resolvedResource?.href ?? record.resource,
      expiresAt: refreshExpiresAt,
    });

    return {
      access_token: newAccessToken,
      token_type: 'bearer',
      expires_in: Math.floor(this.accessTokenTtlMs / 1000),
      refresh_token: newRefreshToken,
      scope: requestedScopes.join(' '),
    };
  }

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const record = this.accessTokens.get(token);
    if (!record) {
      throw new InvalidTokenError('Invalid access token');
    }
    if (record.expiresAt < Date.now()) {
      this.accessTokens.delete(token);
      throw new InvalidTokenError('Access token expired');
    }
    if (this.requireResource) {
      if (!record.resource) {
        throw new InvalidTokenError('Access token missing resource');
      }
      const allowed = checkResourceAllowed({
        requestedResource: record.resource,
        configuredResource: this.resourceUrl,
      });
      if (!allowed) {
        throw new InvalidTokenError('Access token resource mismatch');
      }
    }

    return {
      token,
      clientId: record.clientId,
      scopes: record.scopes,
      expiresAt: Math.floor(record.expiresAt / 1000),
      resource: record.resource ? new URL(record.resource) : undefined,
      extra: {
        userId: record.userId,
      },
    };
  }

  async revokeToken(
    client: OAuthClientInformationFull,
    request: { token: string }
  ): Promise<void> {
    const access = this.accessTokens.get(request.token);
    if (access && access.clientId === client.client_id) {
      this.accessTokens.delete(request.token);
      return;
    }
    const refresh = this.refreshTokens.get(request.token);
    if (refresh && refresh.clientId === client.client_id) {
      this.refreshTokens.delete(request.token);
    }
  }

  private assertResourceAllowed(resource?: URL): void {
    if (!resource) {
      if (this.requireResource) {
        throw new InvalidTargetError('Missing resource parameter');
      }
      return;
    }
    const allowed = checkResourceAllowed({
      requestedResource: resource,
      configuredResource: this.resourceUrl,
    });
    if (!allowed) {
      throw new InvalidTargetError('Invalid resource');
    }
  }
}
