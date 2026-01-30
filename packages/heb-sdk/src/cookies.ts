import { createSession } from './session.js';
import type { HEBCookies, HEBSession } from './types.js';

/**
 * Parse cookies from a Cookie header string or browser export.
 * 
 * Accepts:
 * - Cookie header string: "sat=xxx; reese84=yyy; ..."
 * - JSON array from browser DevTools: Copy as JSON from Application > Cookies
 */
export function parseCookies(input: string): HEBCookies {
  const cookies: HEBCookies = {
    sat: '',
    reese84: '',
    incap_ses: '',
  };
  
  // Try parsing as JSON first (browser export format)
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      for (const cookie of parsed) {
        const name = cookie.name || cookie.Name;
        const value = cookie.value || cookie.Value;
        if (!name || !value) continue;
        
        assignCookie(cookies, name, value);
      }
      return cookies;
    }
  } catch {
    // Not JSON, parse as cookie header string
  }
  
  // Parse "name=value; name2=value2" format
  const pairs = input.split(/;\s*/);
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    
    const name = pair.slice(0, eqIdx).trim();
    const value = pair.slice(eqIdx + 1).trim();
    assignCookie(cookies, name, value);
  }
  
  return cookies;
}

function assignCookie(cookies: HEBCookies, name: string, value: string): void {
  if (name === 'sat') {
    cookies.sat = value;
  } else if (name === 'reese84') {
    cookies.reese84 = value;
  } else if (name.startsWith('incap_ses')) {
    cookies.incap_ses = value;
    cookies[name] = value;
  } else if (name === 'CURR_SESSION_STORE') {
    cookies.CURR_SESSION_STORE = value;
  } else {
    cookies[name] = value;
  }
}

/**
 * Create a session from manually extracted cookies.
 * 
 * @example
 * // Option 1: From cookie header (copy from browser DevTools Network tab)
 * const session = createSessionFromCookies('sat=xxx; reese84=yyy; ...');
 * 
 * // Option 2: From JSON export (Chrome DevTools > Application > Cookies > right-click > Copy all)
 * const session = createSessionFromCookies('[{"name":"sat","value":"xxx"},...]');
 * 
 * // Then use for requests
 * fetch('https://www.heb.com/graphql', { headers: session.headers, ... });
 */
export function createSessionFromCookies(
  cookieInput: string
): HEBSession {
  const cookies = parseCookies(cookieInput);
  
  if (!cookies.sat) {
    throw new Error('No sat cookie found in input. Make sure you are logged in.');
  }
  
  return createSession(cookies);
}
