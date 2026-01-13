import type { SamlAccountConnectionJSON, SamlAccountConnectionJSONSnapshot, SamlAccountConnectionResource, SamlAccountJSON, SamlAccountJSONSnapshot, SamlAccountResource, SamlIdpSlug, VerificationResource } from '@clerk/shared/types';
import { BaseResource } from './Base';
export declare class SamlAccount extends BaseResource implements SamlAccountResource {
    id: string;
    provider: SamlIdpSlug;
    providerUserId: string | null;
    active: boolean;
    emailAddress: string;
    firstName: string;
    lastName: string;
    verification: VerificationResource | null;
    samlConnection: SamlAccountConnectionResource | null;
    lastAuthenticatedAt: Date | null;
    enterpriseConnectionId: string | null;
    constructor(data: Partial<SamlAccountJSON | SamlAccountJSONSnapshot>, pathRoot: string);
    protected fromJSON(data: SamlAccountJSON | SamlAccountJSONSnapshot | null): this;
    __internal_toSnapshot(): SamlAccountJSONSnapshot;
}
export declare class SamlAccountConnection extends BaseResource implements SamlAccountConnectionResource {
    id: string;
    name: string;
    domain: string;
    active: boolean;
    provider: string;
    syncUserAttributes: boolean;
    allowSubdomains: boolean;
    allowIdpInitiated: boolean;
    disableAdditionalIdentifications: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: SamlAccountConnectionJSON | SamlAccountConnectionJSONSnapshot | null);
    protected fromJSON(data: SamlAccountConnectionJSON | SamlAccountConnectionJSONSnapshot | null): this;
    __internal_toSnapshot(): SamlAccountConnectionJSONSnapshot;
}
