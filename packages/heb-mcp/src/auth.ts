import type { Request, Response } from 'express';
import { createRemoteJWKSet, importSPKI, jwtVerify, type KeyLike } from 'jose';

export type AuthContext = {
  userId: string;
  sessionId?: string;
};

const CLERK_FRONTEND_URL = process.env.CLERK_FRONTEND_URL;
const CLERK_AUDIENCE = process.env.CLERK_AUDIENCE;
const CLERK_JWKS_URL = process.env.CLERK_JWKS_URL;
const CLERK_JWT_PUBLIC_KEY = process.env.CLERK_JWT_PUBLIC_KEY;

let cachedKey: KeyLike | null = null;
let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

type VerificationKey =
  | { kind: 'key'; key: KeyLike }
  | { kind: 'jwks'; jwks: ReturnType<typeof createRemoteJWKSet> };

async function getVerificationKey(): Promise<VerificationKey> {
  if (CLERK_JWT_PUBLIC_KEY) {
    if (!cachedKey) {
      cachedKey = await importSPKI(CLERK_JWT_PUBLIC_KEY, 'RS256');
    }
    return { kind: 'key', key: cachedKey };
  }

  if (!CLERK_JWKS_URL) {
    throw new Error('Missing CLERK_JWT_PUBLIC_KEY or CLERK_JWKS_URL for Clerk token verification.');
  }

  if (!cachedJwks) {
    cachedJwks = createRemoteJWKSet(new URL(CLERK_JWKS_URL));
  }

  return { kind: 'jwks', jwks: cachedJwks };
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }

  return null;
}

export async function verifyClerkToken(token: string): Promise<AuthContext | null> {
  try {
    const key = await getVerificationKey();
    const { payload } = key.kind === 'key'
      ? await jwtVerify(token, key.key, {
          issuer: CLERK_FRONTEND_URL || undefined,
          audience: CLERK_AUDIENCE || undefined,
        })
      : await jwtVerify(token, key.jwks, {
          issuer: CLERK_FRONTEND_URL || undefined,
          audience: CLERK_AUDIENCE || undefined,
        });

    const userId = typeof payload.sub === 'string'
      ? payload.sub
      : typeof (payload as any).user_id === 'string'
        ? (payload as any).user_id
        : null;

    if (!userId) {
      return null;
    }

    const sessionId = typeof (payload as any).sid === 'string' ? (payload as any).sid : undefined;

    return { userId, sessionId };
  } catch (error) {
    console.error('[heb-mcp] Clerk token verification failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function requireAuth(req: Request, res: Response): Promise<AuthContext | null> {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Missing Authorization token' });
    return null;
  }

  const auth = await verifyClerkToken(token);
  if (!auth) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }

  return auth;
}
