import type { AttemptEmailAddressVerificationParams, CreateEmailLinkFlowReturn, CreateEnterpriseSSOLinkFlowReturn, EmailAddressJSON, EmailAddressJSONSnapshot, EmailAddressResource, IdentificationLinkResource, PrepareEmailAddressVerificationParams, StartEmailLinkFlowParams, StartEnterpriseSSOLinkFlowParams, VerificationResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
export declare class EmailAddress extends BaseResource implements EmailAddressResource {
    id: string;
    emailAddress: string;
    matchesSsoConnection: boolean;
    linkedTo: IdentificationLinkResource[];
    verification: VerificationResource;
    constructor(data: Partial<EmailAddressJSON | EmailAddressJSONSnapshot>, pathRoot: string);
    create(): Promise<this>;
    prepareVerification: (params: PrepareEmailAddressVerificationParams) => Promise<this>;
    attemptVerification: (params: AttemptEmailAddressVerificationParams) => Promise<this>;
    createEmailLinkFlow: () => CreateEmailLinkFlowReturn<StartEmailLinkFlowParams, EmailAddressResource>;
    createEnterpriseSSOLinkFlow: () => CreateEnterpriseSSOLinkFlowReturn<StartEnterpriseSSOLinkFlowParams, EmailAddressResource>;
    destroy: () => Promise<void>;
    toString: () => string;
    protected fromJSON(data: EmailAddressJSON | EmailAddressJSONSnapshot | null): this;
    __internal_toSnapshot(): EmailAddressJSONSnapshot;
}
