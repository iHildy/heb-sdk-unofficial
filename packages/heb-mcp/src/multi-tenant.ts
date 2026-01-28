import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  createSession,
  createTokenSession,
  HEBClient,
  isSessionValid,
  updateTokenSession,
  type HEBAuthTokens,
  type HEBCookies,
  type HEBSession,
} from 'heb-client';
import { refreshHebTokens, resolveHebOAuthConfig } from './heb-oauth.js';

const DEFAULT_STORE_DIR = path.join(process.cwd(), 'data', 'sessions');
const DEFAULT_SESSION_CACHE_TTL_MS = 15000;

function resolveSessionCacheTtlMs(): number {
  const raw = process.env.HEB_SESSION_CACHE_TTL_MS;
  if (!raw) return DEFAULT_SESSION_CACHE_TTL_MS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return DEFAULT_SESSION_CACHE_TTL_MS;
  return parsed;
}

function areCookiesEqual(a?: HEBCookies, b?: HEBCookies): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

type StoredSessionRecord = {
  cookies?: HEBCookies;
  tokens?: HEBAuthTokensSerialized;
  authMode?: 'cookie' | 'bearer';
  updatedAt: string;
};

type HEBAuthTokensSerialized = Omit<HEBAuthTokens, 'expiresAt'> & { expiresAt?: string };

type EncryptedRecord = {
  v: 1;
  alg: 'aes-256-gcm';
  iv: string;
  tag: string;
  data: string;
};

function sanitizeUserId(userId: string): string {
  return userId.replace(/[^a-zA-Z0-9_-]/g, '_');
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

function encryptRecord(record: StoredSessionRecord, key: Buffer): EncryptedRecord {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(record), 'utf8');
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

function decryptRecord(record: EncryptedRecord, key: Buffer): StoredSessionRecord {
  const iv = Buffer.from(record.iv, 'base64');
  const tag = Buffer.from(record.tag, 'base64');
  const data = Buffer.from(record.data, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8')) as StoredSessionRecord;
}

function serializeTokens(tokens: HEBAuthTokens): HEBAuthTokensSerialized {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    idToken: tokens.idToken,
    tokenType: tokens.tokenType,
    scope: tokens.scope,
    expiresIn: tokens.expiresIn,
    expiresAt: tokens.expiresAt ? tokens.expiresAt.toISOString() : undefined,
  };
}

function deserializeTokens(tokens?: HEBAuthTokensSerialized): HEBAuthTokens | undefined {
  if (!tokens) return undefined;
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    idToken: tokens.idToken,
    tokenType: tokens.tokenType,
    scope: tokens.scope,
    expiresIn: tokens.expiresIn,
    expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : undefined,
  };
}

export class SessionStore {
  private baseDir: string;
  private encryptionKey: Buffer | null;

  constructor(options?: { baseDir?: string; encryptionKey?: Buffer | null }) {
    this.baseDir = options?.baseDir ?? DEFAULT_STORE_DIR;
    this.encryptionKey = options?.encryptionKey ?? null;

    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private filePathForUser(userId: string): string {
    return path.join(this.baseDir, `${sanitizeUserId(userId)}.json`);
  }

  async load(userId: string): Promise<StoredSessionRecord | null> {
    const filePath = this.filePathForUser(userId);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const raw = await fs.promises.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as StoredSessionRecord | EncryptedRecord;

    if ('alg' in parsed && parsed.alg === 'aes-256-gcm') {
      if (!this.encryptionKey) {
        throw new Error('Encrypted session store found but HEB_SESSION_ENCRYPTION_KEY is not set.');
      }
      return decryptRecord(parsed as EncryptedRecord, this.encryptionKey);
    }

    return parsed as StoredSessionRecord;
  }

  async save(userId: string, record: StoredSessionRecord): Promise<void> {
    const filePath = this.filePathForUser(userId);
    const payload = this.encryptionKey ? encryptRecord(record, this.encryptionKey) : record;
    await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8');
  }
}

export class MultiTenantSessionManager {
  private store: SessionStore;
  private cache = new Map<string, { session: HEBSession; client: HEBClient; updatedAt: number }>();
  private cacheTtlMs: number;

  constructor(store: SessionStore, options?: { cacheTtlMs?: number }) {
    this.store = store;
    this.cacheTtlMs = options?.cacheTtlMs ?? resolveSessionCacheTtlMs();
  }

  private isCacheFresh(entry: { session: HEBSession; updatedAt: number }): boolean {
    if (this.cacheTtlMs <= 0) return false;
    const ageMs = Date.now() - entry.updatedAt;
    if (ageMs > this.cacheTtlMs) return false;
    return isSessionValid(entry.session);
  }

  async loadUser(userId: string): Promise<void> {
    const cached = this.cache.get(userId);
    if (cached && this.isCacheFresh(cached)) {
      return;
    }
    const record = await this.store.load(userId);
    if (!record) {
      this.cache.delete(userId);
      return;
    }

    const tokens = deserializeTokens(record.tokens);
    let session: HEBSession;
    if (record.authMode === 'bearer' || tokens?.accessToken) {
      if (!tokens?.accessToken) {
        this.cache.delete(userId);
        return;
      }
      session = createTokenSession(tokens, {
        cookies: record.cookies ?? { sat: '', reese84: '', incap_ses: '' },
      });
      session.refresh = async () => {
        await this.refreshUserTokens(userId, session);
      };
    } else {
      if (!record.cookies) {
        this.cache.delete(userId);
        return;
      }
      session = createSession(record.cookies);
    }

    const client = new HEBClient(session);
    this.cache.set(userId, { session, client, updatedAt: Date.now() });

  }

  getClient(userId: string): HEBClient | null {
    return this.cache.get(userId)?.client ?? null;
  }

  async saveCookies(userId: string, cookies: HEBCookies): Promise<void> {
    const cached = this.cache.get(userId);
    if (cached?.session.authMode === 'cookie' && areCookiesEqual(cached.session.cookies, cookies)) {
      cached.updatedAt = Date.now();
      return;
    }
    const session = createSession(cookies);
    const client = new HEBClient(session);
    this.cache.set(userId, { session, client, updatedAt: Date.now() });

    await this.store.save(userId, {
      cookies,
      authMode: 'cookie',
      updatedAt: new Date().toISOString(),
    });
  }

  async saveTokens(userId: string, tokens: HEBAuthTokens, cookies?: HEBCookies): Promise<void> {
    const session = createTokenSession(tokens, {
      cookies: cookies ?? this.cache.get(userId)?.session.cookies ?? { sat: '', reese84: '', incap_ses: '' },
    });
    session.refresh = async () => {
      await this.refreshUserTokens(userId, session);
    };

    const client = new HEBClient(session);
    this.cache.set(userId, { session, client, updatedAt: Date.now() });

    await this.store.save(userId, {
      cookies: session.cookies,
      tokens: serializeTokens(tokens),
      authMode: 'bearer',
      updatedAt: new Date().toISOString(),
    });
  }

  getSession(userId: string): HEBSession | null {
    return this.cache.get(userId)?.session ?? null;
  }

  private async refreshUserTokens(userId: string, session: HEBSession): Promise<void> {
    const refreshToken = session.tokens?.refreshToken;
    if (!refreshToken) return;

    const nextTokens = await refreshHebTokens({
      refreshToken,
      previous: session.tokens ?? undefined,
      config: resolveHebOAuthConfig(),
    });

    updateTokenSession(session, nextTokens);

    await this.store.save(userId, {
      cookies: session.cookies,
      tokens: serializeTokens(nextTokens),
      authMode: 'bearer',
      updatedAt: new Date().toISOString(),
    });
  }
}

export function createSessionStoreFromEnv(options?: { requireEncryption?: boolean }): SessionStore {
  const encryptionKey = loadEncryptionKey();

  if (!encryptionKey && options?.requireEncryption) {
    throw new Error('HEB_SESSION_ENCRYPTION_KEY is required for remote mode.');
  }

  return new SessionStore({
    baseDir: process.env.HEB_SESSION_STORE_DIR ?? DEFAULT_STORE_DIR,
    encryptionKey,
  });
}
