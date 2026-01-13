import { EventEmitter } from 'events';
import { HEBClient, type HEBCookies, type HEBSession } from 'heb-client';
/**
 * SessionManager provides a live-reloadable session.
 *
 * Watches ~/.heb-client/cookies.json and auto-reloads when it changes.
 * Tools should use `getClient()` instead of holding a stale reference.
 */
export declare class SessionManager extends EventEmitter {
    private session;
    private client;
    private watcher;
    private debounceTimer;
    constructor();
    /**
     * Initialize and start watching for cookie changes.
     */
    initialize(): void;
    /**
     * Reload session from file/env and recreate client.
     */
    reload(): void;
    /**
     * Start watching the cookie file for changes.
     */
    private startWatching;
    /**
     * Get the current session (may be null).
     */
    getSession(): HEBSession | null;
    /**
     * Get an initialized HEBClient, or null if no valid session.
     */
    getClient(): HEBClient | null;
    /**
     * Check if we have a valid (non-expired) session.
     */
    hasValidSession(): boolean;
    /**
     * Clean up resources.
     */
    destroy(): void;
}
export declare const sessionManager: SessionManager;
/**
 * Load HEB session from environment variables or local file.
 *
 * Priority:
 * 1. Environment variables (HEB_SAT, HEB_REESE84)
 * 2. Local file (~/.heb-client/cookies.json)
 *
 * @returns HEBSession or null if no valid session found
 */
export declare function loadSession(): HEBSession | null;
/**
 * Load session from environment variables.
 */
export declare function loadSessionFromEnv(): HEBSession | null;
/**
 * Load session from local file.
 */
export declare function loadSessionFromFile(): HEBSession | null;
/**
 * Save new session cookies to local file.
 */
export declare function saveSessionToFile(cookies: HEBCookies): void;
/**
 * Check if a session is still valid (not expired).
 */
export declare function validateSession(session: HEBSession): boolean;
/**
 * Get session status message for debugging.
 */
export declare function getSessionStatus(session: HEBSession | null): string;
//# sourceMappingURL=session.d.ts.map