import type { ClerkError } from '@clerk/shared/error';
import type { BaseResource } from '../core/resources/internal';
/**
 * Wrap an async task with handling for emitting error and fetch events, which reduces boilerplate. Used in our Custom
 * Flow APIs.
 */
export declare function runAsyncResourceTask<T>(resource: BaseResource, task: () => Promise<T>): Promise<{
    result?: T;
    error: ClerkError | null;
}>;
