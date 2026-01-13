import type { ApiKeyJSON, APIKeyResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
export declare class APIKey extends BaseResource implements APIKeyResource {
    pathRoot: string;
    id: string;
    type: string;
    name: string;
    subject: string;
    scopes: string[];
    claims: Record<string, any> | null;
    revoked: boolean;
    revocationReason: string | null;
    expired: boolean;
    expiration: Date | null;
    createdBy: string | null;
    description: string | null;
    secret?: string;
    lastUsedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: ApiKeyJSON);
    protected fromJSON(data: ApiKeyJSON | null): this;
    __internal_toSnapshot(): ApiKeyJSON;
}
