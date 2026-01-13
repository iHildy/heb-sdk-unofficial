import type { ClerkError } from '@clerk/shared/error';
import type { TokenResource } from '@clerk/shared/types';
import type { BaseResource } from './resources/Base';
export declare const events: {
    readonly TokenUpdate: "token:update";
    readonly UserSignOut: "user:signOut";
    readonly EnvironmentUpdate: "environment:update";
    readonly SessionTokenResolved: "session:tokenResolved";
    readonly ResourceUpdate: "resource:update";
    readonly ResourceError: "resource:error";
    readonly ResourceFetch: "resource:fetch";
};
type TokenUpdatePayload = {
    token: TokenResource | null;
};
export type ResourceUpdatePayload = {
    resource: BaseResource;
};
export type ResourceErrorPayload = {
    resource: BaseResource;
    error: ClerkError | null;
};
export type ResourceFetchPayload = {
    resource: BaseResource;
    status: 'idle' | 'fetching';
};
type InternalEvents = {
    [events.TokenUpdate]: TokenUpdatePayload;
    [events.UserSignOut]: null;
    [events.EnvironmentUpdate]: null;
    [events.SessionTokenResolved]: null;
    [events.ResourceUpdate]: ResourceUpdatePayload;
    [events.ResourceError]: ResourceErrorPayload;
    [events.ResourceFetch]: ResourceFetchPayload;
};
export declare const eventBus: {
    on: <Event extends keyof InternalEvents>(event: Event, handler: (payload: InternalEvents[Event]) => void, opts?: {
        notify?: boolean;
    }) => void;
    prioritizedOn: <Event extends keyof InternalEvents>(event: Event, handler: (payload: InternalEvents[Event]) => void) => void;
    emit: <Event extends keyof InternalEvents>(event: Event, payload: InternalEvents[Event]) => void;
    off: <Event extends keyof InternalEvents>(event: Event, handler?: ((payload: InternalEvents[Event]) => void) | undefined) => void;
    prioritizedOff: <Event extends keyof InternalEvents>(event: Event, handler?: ((payload: InternalEvents[Event]) => void) | undefined) => void;
    internal: {
        retrieveListeners: <Event extends keyof InternalEvents>(event: Event) => Array<(...args: any[]) => void>;
    };
};
export {};
