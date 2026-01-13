import type { AttemptPhoneNumberVerificationParams, IdentificationLinkResource, PhoneNumberJSON, PhoneNumberJSONSnapshot, PhoneNumberResource, SetReservedForSecondFactorParams, VerificationResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
export declare class PhoneNumber extends BaseResource implements PhoneNumberResource {
    id: string;
    phoneNumber: string;
    reservedForSecondFactor: boolean;
    defaultSecondFactor: boolean;
    linkedTo: IdentificationLinkResource[];
    verification: VerificationResource;
    backupCodes?: string[];
    constructor(data: Partial<PhoneNumberJSON | PhoneNumberJSONSnapshot>, pathRoot: string);
    create: () => Promise<this>;
    prepareVerification: () => Promise<PhoneNumberResource>;
    attemptVerification: (params: AttemptPhoneNumberVerificationParams) => Promise<PhoneNumberResource>;
    setReservedForSecondFactor: (params: SetReservedForSecondFactorParams) => Promise<PhoneNumberResource>;
    makeDefaultSecondFactor: () => Promise<PhoneNumberResource>;
    destroy: () => Promise<void>;
    toString: () => string;
    protected fromJSON(data: PhoneNumberJSON | PhoneNumberJSONSnapshot | null): this;
    __internal_toSnapshot(): PhoneNumberJSONSnapshot;
}
