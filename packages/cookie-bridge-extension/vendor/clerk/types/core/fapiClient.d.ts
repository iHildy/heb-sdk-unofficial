import type { ClerkAPIErrorJSON, ClientJSON, InstanceType } from '@clerk/shared/types';
export type HTTPMethod = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';
export type FapiRequestInit = RequestInit & {
    path?: string;
    search?: ConstructorParameters<typeof URLSearchParams>[0];
    sessionId?: string;
    rotatingTokenNonce?: string;
    pathPrefix?: string;
    url?: URL;
};
type FapiRequestOptions = {
    fetchMaxTries?: number;
};
export type FapiResponse<T> = Response & {
    payload: FapiResponseJSON<T> | null;
};
export type FapiRequestCallback<T> = (request: FapiRequestInit, response?: FapiResponse<T>) => unknown;
export interface FapiResponseJSON<T> {
    response: T;
    client?: ClientJSON;
    errors?: ClerkAPIErrorJSON[];
    meta?: {
        client?: ClientJSON;
        session_id?: string;
    };
}
export interface FapiClient {
    buildUrl(requestInit: FapiRequestInit): URL;
    buildEmailAddress(localPart: string): string;
    onAfterResponse(callback: FapiRequestCallback<unknown>): void;
    onBeforeRequest(callback: FapiRequestCallback<unknown>): void;
    request<T>(requestInit: FapiRequestInit, options?: FapiRequestOptions): Promise<FapiResponse<T>>;
}
type FapiClientOptions = {
    frontendApi: string;
    domain?: string;
    proxyUrl?: string;
    instanceType: InstanceType;
    getSessionId: () => string | undefined;
    isSatellite?: boolean;
};
export declare function createFapiClient(options: FapiClientOptions): FapiClient;
export {};
