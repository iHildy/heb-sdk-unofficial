import type { APIKeyResource, APIKeysNamespace, ClerkPaginatedResponse, CreateAPIKeyParams, GetAPIKeysParams, RevokeAPIKeyParams } from '@clerk/shared/types';
export declare class APIKeys implements APIKeysNamespace {
    /**
     * Returns the base options for the FAPI proxy requests.
     */
    private getBaseFapiProxyOptions;
    getAll(params?: GetAPIKeysParams): Promise<ClerkPaginatedResponse<APIKeyResource>>;
    create(params: CreateAPIKeyParams): Promise<APIKeyResource>;
    revoke(params: RevokeAPIKeyParams): Promise<APIKeyResource>;
}
