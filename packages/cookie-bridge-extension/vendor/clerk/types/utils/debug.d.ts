import type { TelemetryCollector } from '@clerk/shared/telemetry';
import type { DebugLogLevel } from '@/core/modules/debug/types';
/**
 * Lightweight logger surface that callers can import as a singleton.
 * Methods are no-ops until initialized via `initDebugLogger`.
 */
export interface DebugLogger {
    debug(message: string, context?: Record<string, unknown>, source?: string): void;
    error(message: string, context?: Record<string, unknown>, source?: string): void;
    info(message: string, context?: Record<string, unknown>, source?: string): void;
    warn(message: string, context?: Record<string, unknown>, source?: string): void;
}
type InitOptions = {
    enabled?: boolean;
    logLevel?: DebugLogLevel;
    telemetryCollector?: TelemetryCollector;
};
/**
 * @public
 * Initialize the global debug logger configuration once.
 *
 * @param options - Configuration options
 * @param options.enabled - Enables the logger; when false, logger is a no-op (default: false)
 * @param options.logLevel - Minimal level to log; lower-priority logs are ignored. Valid levels: 'error' | 'warn' | 'info' | 'debug'.
 * @param options.telemetryCollector - Collector used by the debug transport for emitting telemetry
 *
 * @example
 * ```ts
 * import { initDebugLogger, debugLogger } from '@/utils/debug';
 *
 * initDebugLogger({ enabled: true, logLevel: 'info' });
 * debugLogger.info('Widget rendered', { widgetId: 'w1' }, 'ui');
 * ```
 */
export declare function initDebugLogger(options?: InitOptions): void;
/**
 * Singleton debug logger surface.
 *
 * - No-op until `initDebugLogger` initializes the real logger
 * - Safe to import anywhere; all methods are guarded
 *
 * @example
 * ```ts
 * import { initDebugLogger, debugLogger } from '@/utils/debug';
 *
 * initDebugLogger({ enabled: true, logLevel: 'info' });
 * debugLogger.info('Loaded dashboard', { page: 'home' }, 'ui');
 * ```
 */
export declare const debugLogger: Readonly<DebugLogger>;
export {};
