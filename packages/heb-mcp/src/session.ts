import { EventEmitter } from 'events';
import fs from 'fs';
import {
    createSession,
    HEBClient,
    isSessionValid,
    type HEBCookies,
    type HEBSession,
} from 'heb-sdk';
import os from 'os';
import path from 'path';

const CONFIG_DIR = path.join(os.homedir(), '.heb-sdk');
const COOKIE_FILE = path.join(CONFIG_DIR, 'cookies.json');

export const LOCAL_COOKIE_FILE = COOKIE_FILE;

/**
 * SessionManager provides a live-reloadable session.
 * 
 * Watches ~/.heb-sdk/cookies.json and auto-reloads when it changes.
 * Tools should use `getClient()` instead of holding a stale reference.
 */
export class SessionManager extends EventEmitter {
  private session: HEBSession | null = null;
  private client: HEBClient | null = null;
  private watcher: fs.FSWatcher | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  /**
   * Initialize and start watching for cookie changes.
   */
  initialize(): void {
    this.reload();
    this.startWatching();
  }

  /**
   * Reload session from file/env and recreate client.
   */
  reload(): void {
    const oldValid = this.session ? isSessionValid(this.session) : false;
    
    this.session = loadSession();
    
    if (this.session) {
      this.client = new HEBClient(this.session);
      const newValid = isSessionValid(this.session);
      
      console.error(`[heb-mcp] Session reloaded: ${getSessionStatus(this.session)}`);

      // Emit event for tools that need to know
      this.emit('session-changed', { session: this.session, wasValid: oldValid, isValid: newValid });
    } else {
      this.client = null;
      console.error('[heb-mcp] Session reloaded: No valid session found.');
      this.emit('session-changed', { session: null, wasValid: oldValid, isValid: false });
    }
  }

  /**
   * Start watching the cookie file for changes.
   */
  private startWatching(): void {
    // Ensure config dir exists
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    try {
      this.watcher = fs.watch(CONFIG_DIR, (eventType, filename) => {
        if (filename === 'cookies.json') {
          // Debounce rapid changes
          if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
          }
          this.debounceTimer = setTimeout(() => {
            console.error('[heb-mcp] Cookie file changed, reloading session...');
            this.reload();
          }, 100);
        }
      });

      console.error(`[heb-mcp] Watching ${COOKIE_FILE} for changes`);
    } catch (err) {
      console.error('[heb-mcp] Failed to watch cookie file:', err);
    }
  }

  /**
   * Get the current session (may be null).
   */
  getSession(): HEBSession | null {
    return this.session;
  }

  /**
   * Get an initialized HEBClient, or null if no valid session.
   */
  getClient(): HEBClient | null {
    return this.client;
  }

  /**
   * Check if we have a valid (non-expired) session.
   */
  hasValidSession(): boolean {
    return this.session !== null && isSessionValid(this.session);
  }

  /**
   * Clean up resources.
   */
  destroy(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }
}

// Singleton instance
export const sessionManager = new SessionManager();

/**
 * Load HEB session from environment variables or local file.
 * 
 * Priority:
 * 1. Environment variables (HEB_SAT, HEB_REESE84)
 * 2. Local file (~/.heb-sdk/cookies.json)
 * 
 * @returns HEBSession or null if no valid session found
 */
export function loadSession(): HEBSession | null {
  // 1. Try environment variables
  const envSession = loadSessionFromEnv();
  if (envSession) {
    return envSession;
  }

  // 2. Try local file
  return loadSessionFromFile();
}

/**
 * Load session from environment variables.
 */
export function loadSessionFromEnv(): HEBSession | null {
  const sat = process.env.HEB_SAT;
  const reese84 = process.env.HEB_REESE84;

  if (!sat || !reese84) {
    return null;
  }

  const cookies: HEBCookies = {
    sat,
    reese84,
    incap_ses: process.env.HEB_INCAP_SES ?? '',
    CURR_SESSION_STORE: process.env.HEB_STORE_ID,
  };

  return createSession(cookies);
}

/**
 * Load session from local file.
 */
export function loadSessionFromFile(): HEBSession | null {
  try {
    if (!fs.existsSync(COOKIE_FILE)) {
      return null;
    }

    const data = fs.readFileSync(COOKIE_FILE, 'utf-8');
    const cookies = JSON.parse(data) as HEBCookies;

    // Validate structure (basic check)
    if (!cookies.sat) {
      console.error('[heb-mcp] Invalid cookie file: missing sat');
      return null;
    }

    // Default missing fields
    // if (!cookies.CURR_SESSION_STORE) cookies.CURR_SESSION_STORE = '790';

    return createSession(cookies);
  } catch (error) {
    console.error('[heb-mcp] Failed to load session from file:', error);
    return null;
  }
}

/**
 * Save new session cookies to local file.
 */
export function saveSessionToFile(cookies: HEBCookies): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }

    fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2), 'utf-8');
    console.error(`[heb-mcp] Saved cookies to ${COOKIE_FILE}`);
  } catch (error) {
    console.error('[heb-mcp] Failed to save session to file:', error);
  }
}

/**
 * Check if a session is still valid (not expired).
 */
export function validateSession(session: HEBSession): boolean {
  return isSessionValid(session);
}

/**
 * Format the remaining time until a date.
 */
function formatRemainingTime(expiresAt: Date): string {
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'expired';
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Get session status message for debugging.
 */
export function getSessionStatus(session: HEBSession | null, options?: { source?: string }): string {
  if (!session) {
    const fallbackSource = options?.source ?? `Local File (${COOKIE_FILE})`;
    return `No session loaded. Link HEB OAuth or set HEB_SAT/HEB_REESE84 env vars (${fallbackSource}).`;
  }

  const source = options?.source ?? (process.env.HEB_SAT ? 'Environment Variables' : 'Local File');
  const expiresAt = session.expiresAt;
  const storeId = session.cookies?.CURR_SESSION_STORE ?? 'not set';

  if (!validateSession(session)) {
    const expiresStr = expiresAt ? expiresAt.toLocaleString() : 'unknown';
    const modeLabel = session.authMode === 'bearer' ? 'OAuth' : 'Cookie';
    return `[${source}] ${modeLabel} session expired at ${expiresStr}. Re-authenticate to continue.`;
  }

  const timeRemains = expiresAt ? ` (${formatRemainingTime(expiresAt)} remaining)` : '';
  const expiresStr = expiresAt ? expiresAt.toLocaleString() : 'unknown';
  
  if (!storeId || storeId === 'not set') {
    const modeLabel = session.authMode === 'bearer' ? 'OAuth' : 'Cookie';
    return `[${source}] ${modeLabel} session valid until ${expiresStr}${timeRemains}. WARNING: No Store Selected. Use search_stores and set_store tools.`;
  }

  const modeLabel = session.authMode === 'bearer' ? 'OAuth' : 'Cookie';
  return `[${source}] ${modeLabel} session valid until ${expiresStr}${timeRemains}. Store: ${storeId}`;
}
