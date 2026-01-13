import type { DebugLogEntry, DebugTransport } from '../types';
/**
 * Options for configuring a composite debug transport that fans out logs
 * to multiple underlying transports.
 *
 * @public
 */
export interface CompositeLoggerOptions {
    logLevel?: 'error' | 'warn' | 'info' | 'debug';
    transports: Array<{
        options?: Record<string, unknown>;
        transport: DebugTransport;
    }>;
}
/**
 * A transport that forwards each log entry to a list of child transports.
 * Failures in one transport do not block others.
 *
 * @public
 */
export declare class CompositeTransport implements DebugTransport {
    private readonly transports;
    /**
     * Create a composite transport.
     *
     * @param transports - Transports that will receive each log entry
     */
    constructor(transports: DebugTransport[]);
    /**
     * Send a log entry to all configured transports.
     * Errors from individual transports are caught and logged to the console.
     *
     * @param entry - The debug log entry to send
     */
    send(entry: DebugLogEntry): Promise<void>;
}
