import type { TelemetryCollector } from '@clerk/shared/telemetry';
import { DebugLogger } from './logger';
import { CompositeTransport } from './transports/composite';
import { ConsoleTransport } from './transports/console';
import { TelemetryTransport } from './transports/telemetry';
import type { DebugLogLevel } from './types';
/**
 * Options for configuring the debug logger.
 */
export interface LoggerOptions {
    /** Optional URL to which telemetry logs will be sent. */
    endpoint?: string;
    /** Minimum log level to capture. */
    logLevel?: DebugLogLevel;
    /** Optional collector instance for custom telemetry handling. */
    telemetryCollector?: TelemetryCollector;
}
/**
 * Options for console-only logger configuration.
 */
export interface ConsoleLoggerOptions {
    /** Minimum log level to capture. */
    logLevel?: DebugLogLevel;
}
/**
 * Configuration options for a telemetry-based debug logger.
 */
export interface TelemetryLoggerOptions {
    /** Optional URL to which telemetry logs will be sent. */
    endpoint?: string;
    /** Minimum log level to capture. */
    logLevel?: DebugLogLevel;
    /** Optional collector instance for custom telemetry handling. */
    telemetryCollector?: TelemetryCollector;
}
/**
 * Options for composite logger configuration.
 */
export interface CompositeLoggerOptions {
    logLevel?: DebugLogLevel;
    transports: Array<{
        transport: ConsoleTransport | TelemetryTransport;
    }>;
}
/**
 * Gets or initializes the debug logger
 *
 * @param options - Configuration options for the logger
 * @returns Promise resolving to the debug logger instance
 */
export declare function getDebugLogger(options?: LoggerOptions): Promise<DebugLogger | null>;
/**
 * Creates a composite logger with both console and telemetry transports
 *
 * @param options - Configuration options for the logger
 * @returns Object containing the logger and composite transport
 */
export declare function createLogger(options: {
    endpoint?: string;
    logLevel?: DebugLogLevel;
    telemetryCollector?: TelemetryCollector;
}): {
    logger: DebugLogger;
    transport: CompositeTransport;
} | null;
/**
 * Creates a console-only logger
 *
 * @param options - Configuration options for the console logger
 * @returns Object containing the logger and console transport
 */
export declare function createConsoleLogger(options: ConsoleLoggerOptions): {
    logger: DebugLogger;
    transport: ConsoleTransport;
} | null;
/**
 * Creates a telemetry-only logger
 *
 * @param options - Configuration options for the telemetry logger
 * @returns Object containing the logger and telemetry transport
 */
export declare function createTelemetryLogger(options: TelemetryLoggerOptions): {
    logger: DebugLogger;
    transport: TelemetryTransport;
} | null;
/**
 * Creates a composite logger with multiple transports
 *
 * @param options - Configuration options for the composite logger
 * @returns Object containing the logger and composite transport
 */
export declare function createCompositeLogger(options: CompositeLoggerOptions): {
    logger: DebugLogger;
    transport: CompositeTransport;
} | null;
/**
 * Reset the debug logger
 *
 * @internal
 */
export declare function __internal_resetDebugLogger(): void;
