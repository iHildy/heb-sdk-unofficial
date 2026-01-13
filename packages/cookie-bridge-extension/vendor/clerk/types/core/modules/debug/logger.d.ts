import type { DebugLogLevel, DebugTransport } from './types';
/**
 * Minimal debug logger interface for engineers.
 *
 * @public
 */
export declare class DebugLogger {
    private readonly logLevel;
    private readonly transport;
    /**
     * Creates a new debug logger.
     *
     * @param transport - Transport used to send log entries
     * @param logLevel - Minimum log level to record. Defaults to `'debug'`
     */
    constructor(transport: DebugTransport, logLevel?: DebugLogLevel);
    /**
     * Log a debug message.
     *
     * @param message - Text description of the event
     * @param context - Optional structured context to attach
     * @param source - Optional logical source identifier
     */
    debug(message: string, context?: Record<string, unknown>, source?: string): void;
    /**
     * Log an error message.
     *
     * @param message - Text description of the event
     * @param context - Optional structured context to attach
     * @param source - Optional logical source identifier
     */
    error(message: string, context?: Record<string, unknown>, source?: string): void;
    /**
     * Log an informational message.
     *
     * @param message - Text description of the event
     * @param context - Optional structured context to attach
     * @param source - Optional logical source identifier
     */
    info(message: string, context?: Record<string, unknown>, source?: string): void;
    /**
     * Log a warning message.
     *
     * @param message - Text description of the event
     * @param context - Optional structured context to attach
     * @param source - Optional logical source identifier
     */
    warn(message: string, context?: Record<string, unknown>, source?: string): void;
    private log;
    private shouldLogLevel;
}
