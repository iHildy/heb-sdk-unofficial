import type { TelemetryCollector } from '@clerk/shared/types';
import type { DebugLogEntry, DebugLogLevel, DebugTransport } from '../types';
/**
 * Options for configuring a telemetry-backed transport.
 *
 * @public
 */
export interface TelemetryLoggerOptions {
    endpoint?: string;
    logLevel?: DebugLogLevel;
}
/**
 * A transport that forwards debug logs to the shared telemetry collector
 * for aggregation and remote analysis.
 *
 * If no collector is provided, calls are no-ops.
 *
 * @public
 */
export declare class TelemetryTransport implements DebugTransport {
    private readonly collector?;
    /**
     * Create a telemetry transport.
     *
     * @param collector - Optional telemetry collector instance
     */
    constructor(collector?: TelemetryCollector);
    /**
     * Record a log entry with the telemetry collector.
     * If the collector is absent, the call is ignored.
     *
     * @param entry - The debug log entry to record
     */
    send(entry: DebugLogEntry): Promise<void>;
}
