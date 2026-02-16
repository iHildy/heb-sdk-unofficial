import type { HebOAuthConfig, HebTokenResponse } from 'heb-auth-unofficial';
import { DEFAULT_HEB_OAUTH_CONFIG, exchangeCode, refreshTokens, upsertUser } from 'heb-auth-unofficial';
import type { HEBAuthTokens } from 'heb-sdk-unofficial';

const DEFAULT_UPSERT_ENABLED = true;

export function resolveHebOAuthConfig(): HebOAuthConfig {
  return {
    clientId: process.env.HEB_OAUTH_CLIENT_ID ?? DEFAULT_HEB_OAUTH_CONFIG.clientId,
    redirectUri: process.env.HEB_OAUTH_REDIRECT_URI ?? DEFAULT_HEB_OAUTH_CONFIG.redirectUri,
    scope: process.env.HEB_OAUTH_SCOPE ?? DEFAULT_HEB_OAUTH_CONFIG.scope,
    authUrl: process.env.HEB_OAUTH_AUTH_URL ?? DEFAULT_HEB_OAUTH_CONFIG.authUrl,
    tokenUrl: process.env.HEB_OAUTH_TOKEN_URL ?? DEFAULT_HEB_OAUTH_CONFIG.tokenUrl,
    userAgent: process.env.HEB_OAUTH_USER_AGENT ?? DEFAULT_HEB_OAUTH_CONFIG.userAgent,
  };
}

export function normalizeTokenResponse(response: HebTokenResponse, previous?: HEBAuthTokens): HEBAuthTokens {
  const expiresAt = typeof response.expires_in === 'number'
    ? new Date(Date.now() + response.expires_in * 1000)
    : undefined;

  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token ?? previous?.refreshToken,
    idToken: response.id_token ?? previous?.idToken,
    tokenType: response.token_type ?? previous?.tokenType,
    scope: response.scope ?? previous?.scope,
    expiresIn: response.expires_in,
    expiresAt,
  };
}

export async function exchangeHebCode(options: {
  code: string;
  codeVerifier: string;
  config?: HebOAuthConfig;
}): Promise<HEBAuthTokens> {
  const response = await exchangeCode({
    code: options.code,
    codeVerifier: options.codeVerifier,
    config: options.config,
  });
  return normalizeTokenResponse(response);
}

export async function refreshHebTokens(options: {
  refreshToken: string;
  previous?: HEBAuthTokens;
  config?: HebOAuthConfig;
}): Promise<HEBAuthTokens> {
  const response = await refreshTokens({
    refreshToken: options.refreshToken,
    config: options.config,
  });
  return normalizeTokenResponse(response, options.previous);
}

export async function maybeUpsertHebUser(options: {
  accessToken: string;
  idToken?: string;
  enabled?: boolean;
  userAgent?: string;
}): Promise<{ ok: boolean; errors?: unknown } | null> {
  const enabled = options.enabled ?? DEFAULT_UPSERT_ENABLED;
  if (!enabled) return null;
  if (!options.idToken) return null;

  return upsertUser({
    accessToken: options.accessToken,
    idToken: options.idToken,
    userAgent: options.userAgent,
  });
}

export function isUpsertEnabled(): boolean {
  const raw = process.env.HEB_OAUTH_UPSERT_USER;
  if (raw === undefined) return DEFAULT_UPSERT_ENABLED;
  return raw.toLowerCase() !== 'false';
}
