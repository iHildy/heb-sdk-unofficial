import { EventEmitter } from 'events';
import fs from 'fs';
import { createSession, HEBClient, isSessionValid, } from 'heb-client';
import os from 'os';
import path from 'path';
const CONFIG_DIR = path.join(os.homedir(), '.heb-client');
const COOKIE_FILE = path.join(CONFIG_DIR, 'cookies.json');
/**
 * SessionManager provides a live-reloadable session.
 *
 * Watches ~/.heb-client/cookies.json and auto-reloads when it changes.
 * Tools should use `getClient()` instead of holding a stale reference.
 */
export class SessionManager extends EventEmitter {
    session = null;
    client = null;
    watcher = null;
    debounceTimer = null;
    constructor() {
        super();
    }
    /**
     * Initialize and start watching for cookie changes.
     */
    initialize() {
        this.reload();
        this.startWatching();
    }
    /**
     * Reload session from file/env and recreate client.
     */
    reload() {
        const oldValid = this.session ? isSessionValid(this.session) : false;
        this.session = loadSession();
        if (this.session) {
            this.client = new HEBClient(this.session);
            const newValid = isSessionValid(this.session);
            console.error(`[heb-mcp] Session reloaded: ${getSessionStatus(this.session)}`);
            // Attempt to fetch buildId if missing (async, let it run in background)
            this.client.ensureBuildId().catch(err => {
                console.error('[heb-mcp] Failed to ensure buildId:', err);
            });
            // Emit event for tools that need to know
            this.emit('session-changed', { session: this.session, wasValid: oldValid, isValid: newValid });
        }
        else {
            this.client = null;
            console.error('[heb-mcp] Session reloaded: No valid session found.');
            this.emit('session-changed', { session: null, wasValid: oldValid, isValid: false });
        }
    }
    /**
     * Start watching the cookie file for changes.
     */
    startWatching() {
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
        }
        catch (err) {
            console.error('[heb-mcp] Failed to watch cookie file:', err);
        }
    }
    /**
     * Get the current session (may be null).
     */
    getSession() {
        return this.session;
    }
    /**
     * Get an initialized HEBClient, or null if no valid session.
     */
    getClient() {
        return this.client;
    }
    /**
     * Check if we have a valid (non-expired) session.
     */
    hasValidSession() {
        return this.session !== null && isSessionValid(this.session);
    }
    /**
     * Clean up resources.
     */
    destroy() {
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
 * 2. Local file (~/.heb-client/cookies.json)
 *
 * @returns HEBSession or null if no valid session found
 */
export function loadSession() {
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
export function loadSessionFromEnv() {
    const sat = process.env.HEB_SAT;
    const reese84 = process.env.HEB_REESE84;
    if (!sat || !reese84) {
        return null;
    }
    const cookies = {
        sat,
        reese84,
        incap_ses: process.env.HEB_INCAP_SES ?? '',
        CURR_SESSION_STORE: process.env.HEB_STORE_ID,
    };
    const buildId = process.env.HEB_BUILD_ID;
    return createSession(cookies, buildId);
}
/**
 * Load session from local file.
 */
export function loadSessionFromFile() {
    try {
        if (!fs.existsSync(COOKIE_FILE)) {
            return null;
        }
        const data = fs.readFileSync(COOKIE_FILE, 'utf-8');
        const cookies = JSON.parse(data);
        // Validate structure (basic check)
        if (!cookies.sat) {
            console.error('[heb-mcp] Invalid cookie file: missing sat');
            return null;
        }
        // Default missing fields
        // if (!cookies.CURR_SESSION_STORE) cookies.CURR_SESSION_STORE = '790';
        return createSession(cookies);
    }
    catch (error) {
        console.error('[heb-mcp] Failed to load session from file:', error);
        return null;
    }
}
/**
 * Save new session cookies to local file.
 */
export function saveSessionToFile(cookies) {
    try {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
        fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2), 'utf-8');
        console.error(`[heb-mcp] Saved cookies to ${COOKIE_FILE}`);
    }
    catch (error) {
        console.error('[heb-mcp] Failed to save session to file:', error);
    }
}
/**
 * Check if a session is still valid (not expired).
 */
export function validateSession(session) {
    return isSessionValid(session);
}
/**
 * Format the remaining time until a date.
 */
function formatRemainingTime(expiresAt) {
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    if (diffMs <= 0)
        return 'expired';
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
export function getSessionStatus(session) {
    if (!session) {
        return `No session loaded. Set HEB_SAT/HEB_REESE84 env vars or use Cookie Bridge extension (writing to ${COOKIE_FILE}).`;
    }
    const source = process.env.HEB_SAT ? 'Environment Variables' : 'Local File';
    const expiresAt = session.expiresAt;
    const storeId = session.cookies.CURR_SESSION_STORE ?? 'not set';
    if (!validateSession(session)) {
        const expiresStr = expiresAt ? expiresAt.toLocaleString() : 'unknown';
        return `[${source}] Session expired at ${expiresStr}. Re-authenticate to continue.`;
    }
    const timeRemains = expiresAt ? ` (${formatRemainingTime(expiresAt)} remaining)` : '';
    const expiresStr = expiresAt ? expiresAt.toLocaleString() : 'unknown';
    if (!storeId || storeId === 'not set') {
        return `[${source}] Session valid until ${expiresStr}${timeRemains}. WARNING: No Store Selected. Use search_stores and set_store tools.`;
    }
    return `[${source}] Session valid until ${expiresStr}${timeRemains}. Store: ${storeId}`;
}
//# sourceMappingURL=session.js.map