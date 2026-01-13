import type { EnterpriseAccountConnectionJSON, EnterpriseAccountConnectionJSONSnapshot, EnterpriseAccountConnectionResource, EnterpriseAccountJSON, EnterpriseAccountJSONSnapshot, EnterpriseAccountResource, VerificationResource } from '@clerk/shared/types';
import { BaseResource } from './Base';
export declare class EnterpriseAccount extends BaseResource implements EnterpriseAccountResource {
    id: string;
    protocol: EnterpriseAccountResource['protocol'];
    provider: EnterpriseAccountResource['provider'];
    providerUserId: string | null;
    active: boolean;
    emailAddress: string;
    firstName: string | null;
    lastName: string | null;
    publicMetadata: {};
    verification: VerificationResource | null;
    enterpriseConnection: EnterpriseAccountConnectionResource | null;
    lastAuthenticatedAt: Date | null;
    enterpriseConnectionId: string | null;
    constructor(data: Partial<EnterpriseAccountJSON | EnterpriseAccountJSONSnapshot>, pathRoot: string);
    protected fromJSON(data: EnterpriseAccountJSON | EnterpriseAccountJSONSnapshot | null): this;
    __internal_toSnapshot(): EnterpriseAccountJSONSnapshot;
}
export declare class EnterpriseAccountConnection extends BaseResource implements EnterpriseAccountConnectionResource {
    id: string;
    active: boolean;
    allowIdpInitiated: boolean;
    allowSubdomains: boolean;
    disableAdditionalIdentifications: boolean;
    domain: string;
    logoPublicUrl: string | null;
    name: string;
    protocol: EnterpriseAccountResource['protocol'];
    provider: EnterpriseAccountResource['provider'];
    syncUserAttributes: boolean;
    createdAt: Date;
    updatedAt: Date;
    enterpriseConnectionId: string | null;
    constructor(data: EnterpriseAccountConnectionJSON | EnterpriseAccountConnectionJSONSnapshot | null);
    protected fromJSON(data: EnterpriseAccountConnectionJSON | EnterpriseAccountConnectionJSONSnapshot | null): this;
    __internal_toSnapshot(): EnterpriseAccountConnectionJSONSnapshot;
}
