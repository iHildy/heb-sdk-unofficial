import type { ExternalAccountJSON, ExternalAccountJSONSnapshot, ExternalAccountResource, OAuthProvider, ReauthorizeExternalAccountParams, VerificationResource } from '@clerk/shared/types';
import { BaseResource } from './Base';
export declare class ExternalAccount extends BaseResource implements ExternalAccountResource {
    id: string;
    identificationId: string;
    provider: OAuthProvider;
    providerUserId: string;
    emailAddress: string;
    approvedScopes: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    username: string;
    phoneNumber: string;
    publicMetadata: {};
    label: string;
    verification: VerificationResource | null;
    constructor(data: Partial<ExternalAccountJSON | ExternalAccountJSONSnapshot>, pathRoot: string);
    reauthorize: (params: ReauthorizeExternalAccountParams) => Promise<ExternalAccountResource>;
    destroy: () => Promise<void>;
    protected fromJSON(data: ExternalAccountJSON | ExternalAccountJSONSnapshot | null): this;
    __internal_toSnapshot(): ExternalAccountJSONSnapshot;
    providerSlug(): OAuthProvider;
    providerTitle(): string;
    accountIdentifier(): string;
}
