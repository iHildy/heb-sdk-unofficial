import { HEBSession } from './types.js';

/**
 * Log a debug message if debug mode is enabled in the session.
 * 
 * @param session - Current HEB session
 * @param label - Label for the log (e.g., operation name)
 * @param data - Data to log (will be stringified)
 */
export function logDebug(session: HEBSession, label: string, data: unknown): void {
  if (session.debug) {
    const output = typeof data === 'string' ? data : JSON.stringify(data);
    console.log(`DEBUG: ${label}: ${output}`);
  }
}
