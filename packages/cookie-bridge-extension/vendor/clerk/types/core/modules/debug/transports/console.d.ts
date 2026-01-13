import type { DebugLogEntry, DebugTransport } from '../types';
/**
 * A transport that writes debug logs to the host environment's console
 * (e.g. browser devtools or Node.js stdout) with ANSI color accents.
 *
 * @public
 */
export declare class ConsoleTransport implements DebugTransport {
    /**
     * Write a single log entry to the console, choosing the appropriate
     * console method based on the entry level.
     *
     * @param entry - The debug log entry to print
     */
    send(entry: DebugLogEntry): Promise<void>;
}
