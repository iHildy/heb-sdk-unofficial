import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  createSession,
  HEBClient,
  type HEBCookies,
  type HEBSession,
} from 'heb-client';

const DEFAULT_STORE_DIR = path.join(process.cwd(), 'data', 'sessions');

type StoredSessionRecord = {
  cookies: HEBCookies;
  buildId?: string;
  updatedAt: string;
};

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

  constructor(store: SessionStore) {
    this.store = store;
  }

  async loadUser(userId: string): Promise<void> {
    const record = await this.store.load(userId);
    if (!record) {
      this.cache.delete(userId);
      return;
    }

    const session = createSession(record.cookies, record.buildId);
    const client = new HEBClient(session);
    this.cache.set(userId, { session, client, updatedAt: Date.now() });

    client.ensureBuildId().catch((err) => {
      console.error('[heb-mcp] Failed to ensure buildId:', err);
    });
  }

  getClient(userId: string): HEBClient | null {
    return this.cache.get(userId)?.client ?? null;
  }

  async saveCookies(userId: string, cookies: HEBCookies): Promise<void> {
    const session = createSession(cookies);
    const client = new HEBClient(session);
    this.cache.set(userId, { session, client, updatedAt: Date.now() });

    await this.store.save(userId, {
      cookies,
      buildId: session.buildId,
      updatedAt: new Date().toISOString(),
    });

    client.ensureBuildId().catch((err) => {
      console.error('[heb-mcp] Failed to ensure buildId:', err);
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
