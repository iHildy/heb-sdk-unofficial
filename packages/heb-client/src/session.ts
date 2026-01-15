import type { HEBAuthTokens, HEBCookies, HEBEndpoints, HEBHeaders, HEBSession, ShoppingContext } from './types.js';
import { ENDPOINTS } from './types.js';

const CLIENT_NAME = 'WebPlatform-Solar (Production)';
const MOBILE_USER_AGENT = 'MyHEB/5.9.0.60733 (iOS 18.7.2; iPhone16,2) CFNetwork/1.0 Darwin/24.6.0';

/**
 * Format cookies object into a Cookie header string.
 */
export function formatCookieHeader(cookies: HEBCookies): string {
  return Object.entries(cookies)
    .filter(([_, value]) => value !== undefined && value !== '')
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

/**
 * Build required headers for HEB GraphQL API requests.
 */
export function buildHeaders(cookies: HEBCookies): HEBHeaders {
  const headers: HEBHeaders = {
    'apollographql-client-name': CLIENT_NAME,
    'apollographql-client-version': 'unknown',
    'content-type': 'application/json',
  };
  const cookieHeader = formatCookieHeader(cookies);
  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }
  return headers;
}

export function buildBearerHeaders(
  tokens: HEBAuthTokens,
  options?: { userAgent?: string; clientName?: string; clientVersion?: string }
): HEBHeaders {
  const headers: HEBHeaders = {
    authorization: `${tokens.tokenType ?? 'Bearer'} ${tokens.accessToken}`,
    'content-type': 'application/json',
  };
  if (options?.clientName) {
    headers['apollographql-client-name'] = options.clientName;
  }
  if (options?.clientVersion) {
    headers['apollographql-client-version'] = options.clientVersion;
  }
  if (options?.userAgent) {
    headers['user-agent'] = options.userAgent;
  }
  return headers;
}

export function normalizeHeaders(headers: HEBHeaders): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string' && value.length > 0) {
      normalized[key] = value;
    }
  }
  return normalized;
}

/**
 * Parse JWT expiration from sat cookie.
 * Returns undefined if parsing fails.
 */
export function parseJwtExpiry(sat: string): Date | undefined {
  try {
    const [, payload] = sat.split('.');
    if (!payload) return undefined;
    
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    );
    
    if (typeof decoded.exp === 'number') {
      return new Date(decoded.exp * 1000);
    }
  } catch {
    // Invalid JWT format
  }
  return undefined;
}

function resolveTokenExpiry(tokens: HEBAuthTokens): Date | undefined {
  if (tokens.expiresAt instanceof Date) return tokens.expiresAt;
  if (typeof tokens.expiresIn === 'number' && tokens.expiresIn > 0) {
    return new Date(Date.now() + tokens.expiresIn * 1000);
  }
  return parseJwtExpiry(tokens.accessToken);
}

/**
 * Check if a session is still valid (not expired).
 */
export function isSessionValid(session: HEBSession): boolean {
  if (!session.expiresAt) {
    if (session.authMode === 'bearer') {
      return Boolean(session.tokens?.accessToken);
    }
    // No expiry info - check if sat exists
    return Boolean(session.cookies.sat);
  }
  
  // Add 60-second buffer for safety
  const bufferMs = 60 * 1000;
  return new Date().getTime() < session.expiresAt.getTime() - bufferMs;
}

export function isSessionAuthenticated(session: HEBSession): boolean {
  if (session.authMode === 'bearer') {
    return Boolean(session.tokens?.accessToken);
  }
  return Boolean(session.cookies.sat);
}

/**
 * Create a session object from cookies and optional metadata.
 */
export function createSession(
  cookies: HEBCookies
): HEBSession {
  return {
    cookies,
    headers: buildHeaders(cookies),
    expiresAt: parseJwtExpiry(cookies.sat),
    authMode: 'cookie',
  };
}

export function createTokenSession(
  tokens: HEBAuthTokens,
  options?: {
    cookies?: HEBCookies;
    endpoints?: Partial<HEBEndpoints>;
    userAgent?: string;
  }
): HEBSession {
  const cookies = options?.cookies ?? { sat: '', reese84: '', incap_ses: '' };
  const endpoints: Partial<HEBEndpoints> = {
    graphql: ENDPOINTS.graphqlMobile,
    home: ENDPOINTS.home,
    ...(options?.endpoints ?? {}),
  };
  const expiresAt = resolveTokenExpiry(tokens);

  return {
    cookies,
    tokens,
    headers: buildBearerHeaders(tokens, { userAgent: options?.userAgent ?? MOBILE_USER_AGENT }),
    expiresAt,
    authMode: 'bearer',
    endpoints,
  };
}

export function updateTokenSession(
  session: HEBSession,
  tokens: HEBAuthTokens,
  options?: { userAgent?: string }
): void {
  session.tokens = tokens;
  session.authMode = 'bearer';
  session.headers = buildBearerHeaders(tokens, { userAgent: options?.userAgent ?? MOBILE_USER_AGENT });
  session.expiresAt = resolveTokenExpiry(tokens);
  if (!session.endpoints) {
    session.endpoints = { graphql: ENDPOINTS.graphqlMobile, home: ENDPOINTS.home };
  } else {
    session.endpoints = { graphql: ENDPOINTS.graphqlMobile, home: ENDPOINTS.home, ...session.endpoints };
  }
}

export async function ensureFreshSession(session: HEBSession): Promise<void> {
  if (session.authMode !== 'bearer') return;
  if (!session.refresh) return;

  const now = Date.now();
  const expiresAt = session.expiresAt?.getTime();
  const bufferMs = 60 * 1000;
  if (expiresAt && now < expiresAt - bufferMs) return;

  await session.refresh();
}

export function resolveEndpoint(session: HEBSession, key: keyof HEBEndpoints): string {
  return session.endpoints?.[key] ?? ENDPOINTS[key];
}

/**
 * Resolve the shopping context for the current session.
 * Defaults to 'CURBSIDE_PICKUP' if not set.
 */
export function resolveShoppingContext(session: HEBSession): ShoppingContext {
  return session.shoppingContext ?? session.cookies?.shoppingContext ?? 'CURBSIDE_PICKUP';
}

/**
 * Get the simplified shopping mode ('CURBSIDE' or 'ONLINE') from the context string.
 */
export function getShoppingMode(context: string): 'CURBSIDE' | 'ONLINE' {
  return context.includes('CURBSIDE') ? 'CURBSIDE' : 'ONLINE';
}

/**
 * Get information about the current session.
 */
export function getSessionInfo(session: HEBSession): {
  storeId: string;
  isValid: boolean;
  expiresAt: Date | undefined;
  shoppingContext: string;
} {
  return {
    storeId: session.cookies?.CURR_SESSION_STORE ?? 'not set',
    isValid: isSessionValid(session),
    expiresAt: session.expiresAt,
    shoppingContext: resolveShoppingContext(session),
  };
}
