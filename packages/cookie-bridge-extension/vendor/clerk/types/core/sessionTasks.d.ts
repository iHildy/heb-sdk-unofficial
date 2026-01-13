import type { SessionResource, SessionTask } from '@clerk/shared/types';
import { buildURL } from '../utils';
/**
 * @internal
 */
export declare const INTERNAL_SESSION_TASK_ROUTE_BY_KEY: Record<SessionTask['key'], string>;
/**
 * @internal
 */
export declare const getTaskEndpoint: (task: SessionTask) => string;
/**
 * @internal
 */
export declare function buildTaskUrl(task: SessionTask, opts: Pick<Parameters<typeof buildURL>[0], 'base'>): string;
/**
 * @internal
 */
export declare function navigateIfTaskExists(session: SessionResource, { navigate, baseUrl, }: {
    navigate: (to: string) => Promise<unknown>;
    baseUrl: string;
}): Promise<unknown> | undefined;
export declare function warnMissingPendingTaskHandlers(options: Record<string, unknown>): void;
