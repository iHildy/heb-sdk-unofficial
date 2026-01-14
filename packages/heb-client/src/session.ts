import type { HEBAuthTokens, HEBCookies, HEBEndpoints, HEBHeaders, HEBSession } from './types.js';
import { ENDPOINTS } from './types.js';

const CLIENT_NAME = 'WebPlatform-Solar (Production)';
const MOBILE_USER_AGENT = 'MyHEB/5.9.0.60733 (iOS 18.7.2; iPhone16,2) CFNetwork/1.0 Darwin/24.6.0';
const WEB_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36';
const DEFAULT_ACCEPT_LANGUAGE = 'en-US,en;q=0.9';

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
export function buildHeaders(cookies: HEBCookies, buildId?: string): HEBHeaders {
  const headers: HEBHeaders = {
    'apollographql-client-name': CLIENT_NAME,
    'apollographql-client-version': buildId ?? 'unknown',
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

export function buildBrowserHeaders(base: Record<string, string> = {}): Record<string, string> {
  return {
    'user-agent': WEB_USER_AGENT,
    'accept-language': DEFAULT_ACCEPT_LANGUAGE,
    ...base,
  };
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
  cookies: HEBCookies,
  buildId?: string
): HEBSession {
  return {
    cookies,
    headers: buildHeaders(cookies, buildId),
    expiresAt: parseJwtExpiry(cookies.sat),
    buildId,
    authMode: 'cookie',
  };
}

export function createTokenSession(
  tokens: HEBAuthTokens,
  options?: {
    cookies?: HEBCookies;
    endpoints?: Partial<HEBEndpoints>;
    buildId?: string;
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
    buildId: options?.buildId,
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

function buildCookieHeaders(cookies: HEBCookies): Record<string, string> {
  const cookieHeader = formatCookieHeader(cookies);
  return cookieHeader ? { cookie: cookieHeader } : {};
}

function extractNextDataJson(html: string): unknown | undefined {
  const match = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>/i);
  if (!match || match.index === undefined) {
    return undefined;
  }
  const start = match.index + match[0].length;
  const end = html.indexOf('</script>', start);
  if (end === -1) {
    return undefined;
  }
  const jsonText = html.slice(start, end).trim();
  if (!jsonText) {
    return undefined;
  }
  try {
    return JSON.parse(jsonText);
  } catch {
    return undefined;
  }
}

function extractBuildIdFromHtml(html: string): string | undefined {
  const nextData = extractNextDataJson(html) as { buildId?: unknown } | undefined;
  if (typeof nextData?.buildId === 'string') {
    return nextData.buildId;
  }

  const staticMatch =
    html.match(/\/_next\/static\/([^/]+)\/_buildManifest\.js/) ??
    html.match(/\/_next\/static\/([^/]+)\/_ssgManifest\.js/) ??
    html.match(/\/_next\/data\/([^/]+)\//);

  return staticMatch?.[1];
}

/**
 * Fetch the current Next.js build ID from the homepage.
 * 
 * This is required for data requests (x-nextjs-data).
 */
export async function fetchBuildId(cookies: HEBCookies): Promise<string> {
  const attempts: Array<{ label: string; headers: Record<string, string> }> = [
    {
      label: 'with cookies',
      headers: buildBrowserHeaders({
        ...buildCookieHeaders(cookies),
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }),
    },
    {
      label: 'without cookies',
      headers: buildBrowserHeaders({
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }),
    },
  ];

  let lastError: Error | undefined;
  for (const attempt of attempts) {
    try {
      const response = await fetch(ENDPOINTS.home, {
        method: 'GET',
        headers: attempt.headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch homepage for buildId (${attempt.label}): ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const buildId = extractBuildIdFromHtml(html);
      if (buildId) {
        return buildId;
      }

      throw new Error(`Could not find buildId in homepage HTML (${attempt.label})`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error('Could not find buildId in homepage HTML');
}

/**
 * Ensure the session has a valid buildId.
 */
export async function ensureBuildId(session: HEBSession): Promise<void> {
  if (session.buildId) {
    return;
  }

  const buildId = await fetchBuildId(session.cookies);
  session.buildId = buildId;

  if (session.authMode !== 'bearer') {
    session.headers = buildHeaders(session.cookies, buildId);
  }
}
