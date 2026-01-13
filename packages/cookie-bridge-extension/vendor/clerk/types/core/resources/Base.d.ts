import type { ClerkResourceJSON, ClerkResourceReloadParams, DeletedObjectJSON } from '@clerk/shared/types';
import type { FapiClient, FapiRequestInit, FapiResponseJSON, HTTPMethod } from '../fapiClient';
import type { Clerk } from './internal';
export type BaseFetchOptions = ClerkResourceReloadParams & {
    forceUpdateClient?: boolean;
    fetchMaxTries?: number;
};
export type BaseMutateParams = {
    action?: string;
    body?: any;
    method?: HTTPMethod;
    path?: string;
};
export declare abstract class BaseResource {
    static clerk: Clerk;
    id?: string;
    pathRoot: string;
    static get fapiClient(): FapiClient;
    reload(params?: ClerkResourceReloadParams): Promise<this>;
    isNew(): boolean;
    static _fetch<J extends ClerkResourceJSON | DeletedObjectJSON | null>(requestInit: FapiRequestInit, opts?: BaseFetchOptions): Promise<FapiResponseJSON<J> | null>;
    protected static _baseFetch<J extends ClerkResourceJSON | DeletedObjectJSON | null>(requestInit: FapiRequestInit, opts?: BaseFetchOptions): Promise<FapiResponseJSON<J> | null>;
    protected static _updateClient<J>(responseJSON: FapiResponseJSON<J> | null): void;
    protected path(action?: string): string;
    protected abstract fromJSON(data: ClerkResourceJSON | null): this;
    /**
     * Returns the provided value if it is not `undefined` or `null`, otherwise returns the default value.
     *
     * @template T - The type of the value.
     * @param value - The value to check.
     * @param defaultValue - The default value to return if the provided value is `undefined` or `null`.
     * @returns The provided value if it is not `undefined` or `null`, otherwise the default value.
     */
    protected withDefault<T>(value: T | undefined | null, defaultValue: T): T;
    protected _baseGet<J extends ClerkResourceJSON | null>(opts?: BaseFetchOptions): Promise<this>;
    protected _baseMutate<J extends ClerkResourceJSON | null>(params: BaseMutateParams): Promise<this>;
    protected _baseMutateBypass<J extends ClerkResourceJSON | null>(params: BaseMutateParams): Promise<this>;
    protected _basePost<J extends ClerkResourceJSON | null>(params?: BaseMutateParams): Promise<this>;
    protected _basePostBypass<J extends ClerkResourceJSON>(params?: BaseMutateParams): Promise<this>;
    protected _basePut<J extends ClerkResourceJSON | null>(params?: BaseMutateParams): Promise<this>;
    protected _basePatch<J extends ClerkResourceJSON>(params?: BaseMutateParams): Promise<this>;
    protected _baseDelete<J extends ClerkResourceJSON | null>(params?: BaseMutateParams): Promise<void>;
    private static shouldRethrowOfflineNetworkErrors;
}
