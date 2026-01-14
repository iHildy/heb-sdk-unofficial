import type { Request, Response } from 'express';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export type AuthContext = {
  userId: string;
  sessionId?: string;
};

const CLERK_FRONTEND_URL = process.env.CLERK_FRONTEND_URL;
const CLERK_JWT_TEMPLATE_NAME = process.env.CLERK_JWT_TEMPLATE_NAME;
const CLERK_JWKS_URL = process.env.CLERK_JWKS_URL;

let cachedJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

async function getVerificationKey(): Promise<ReturnType<typeof createRemoteJWKSet>> {
  if (!CLERK_JWKS_URL) {
    throw new Error('Missing CLERK_JWKS_URL for Clerk token verification.');
  }

  if (!cachedJwks) {
    cachedJwks = createRemoteJWKSet(new URL(CLERK_JWKS_URL));
  }

  return cachedJwks;
}

export function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization ?? req.headers.Authorization;
  if (typeof header === 'string' && header.startsWith('Bearer ')) {
    return header.slice('Bearer '.length).trim();
  }

  return null;
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

export function resolveClerkToken(req: Request): string | null {
  const headerToken = extractBearerToken(req);
  if (headerToken) return headerToken;

  const queryToken = (req.query as Record<string, unknown> | undefined)?.clerk_token;
  if (typeof queryToken === 'string' && queryToken.trim().length > 0) {
    return queryToken.trim();
  }

  const cookies = parseCookies(req.headers.cookie);
  return cookies.__session || cookies.__clerk_session || null;
}

export async function verifyClerkToken(token: string): Promise<AuthContext | null> {
  try {
    if (!CLERK_FRONTEND_URL) {
      throw new Error('Missing CLERK_FRONTEND_URL for Clerk token verification.');
    }
    const key = await getVerificationKey();

    let payload;
    try {
      if (CLERK_JWT_TEMPLATE_NAME) {
        ({ payload } = await jwtVerify(token, key, {
          issuer: CLERK_FRONTEND_URL || undefined,
          audience: CLERK_JWT_TEMPLATE_NAME || undefined,
        }));
      } else {
        ({ payload } = await jwtVerify(token, key, {
          issuer: CLERK_FRONTEND_URL || undefined,
        }));
      }
    } catch (error) {
      ({ payload } = await jwtVerify(token, key, {
        issuer: CLERK_FRONTEND_URL || undefined,
      }));
    }

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

export async function requireClerkAuth(req: Request, res: Response): Promise<AuthContext | null> {
  const token = resolveClerkToken(req);
  if (!token) {
    res.status(401).json({ error: 'Missing Clerk session token' });
    return null;
  }

  const auth = await verifyClerkToken(token);
  if (!auth) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }

  return auth;
}
