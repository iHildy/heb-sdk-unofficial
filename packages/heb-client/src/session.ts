import type { HEBCookies, HEBHeaders, HEBSession } from './types.js';
import { ENDPOINTS } from './types.js';

const CLIENT_NAME = 'WebPlatform-Solar (Production)';

/**
 * Format cookies object into a Cookie header string.
 */
export function formatCookieHeader(cookies: HEBCookies): string {
  return Object.entries(cookies)
    .filter(([_, value]) => value !== undefined)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

/**
 * Build required headers for HEB GraphQL API requests.
 */
export function buildHeaders(cookies: HEBCookies, buildId?: string): HEBHeaders {
  return {
    'apollographql-client-name': CLIENT_NAME,
    'apollographql-client-version': buildId ?? 'unknown',
    cookie: formatCookieHeader(cookies),
    'content-type': 'application/json',
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

/**
 * Check if a session is still valid (not expired).
 */
export function isSessionValid(session: HEBSession): boolean {
  if (!session.expiresAt) {
    // No expiry info - check if sat exists
    return Boolean(session.cookies.sat);
  }
  
  // Add 60-second buffer for safety
  const bufferMs = 60 * 1000;
  return new Date().getTime() < session.expiresAt.getTime() - bufferMs;
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
  };
}

/**
 * Fetch the current Next.js build ID from the homepage.
 * 
 * This is required for data requests (x-nextjs-data).
 */
export async function fetchBuildId(cookies: HEBCookies): Promise<string> {
  // We need to fetch a page to get the build ID
  // The homepage is a safe bet
  const response = await fetch(ENDPOINTS.home, {
    method: 'GET',
    headers: {
      ...buildHeaders(cookies),
      'accept': 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch homepage for buildId: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  
  // Extract buildId from __NEXT_DATA__ script tag
  // <script id="__NEXT_DATA__" type="application/json">{"props":{...},"buildId":"production-..."}</script>
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([^<]+)<\/script>/);
  
  if (!match || !match[1]) {
    throw new Error('Could not find __NEXT_DATA__ in homepage HTML');
  }

  try {
    const data = JSON.parse(match[1]);
    if (typeof data.buildId === 'string') {
      return data.buildId;
    }
    throw new Error('buildId not found in __NEXT_DATA__');
  } catch (e) {
    throw new Error(`Failed to parse __NEXT_DATA__ JSON: ${e instanceof Error ? e.message : String(e)}`);
  }
}
