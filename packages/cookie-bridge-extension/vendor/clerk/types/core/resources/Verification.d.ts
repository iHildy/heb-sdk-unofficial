import { ClerkAPIError } from '@clerk/shared/error';
import type { PasskeyVerificationResource, PhoneCodeChannel, PublicKeyCredentialCreationOptionsWithoutExtensions, SignUpVerificationJSON, SignUpVerificationJSONSnapshot, SignUpVerificationResource, SignUpVerificationsJSON, SignUpVerificationsJSONSnapshot, SignUpVerificationsResource, VerificationJSON, VerificationJSONSnapshot, VerificationResource, VerificationStatus } from '@clerk/shared/types';
import { BaseResource } from './internal';
export declare class Verification extends BaseResource implements VerificationResource {
    pathRoot: string;
    status: VerificationStatus | null;
    strategy: string | null;
    nonce: string | null;
    message: string | null;
    externalVerificationRedirectURL: URL | null;
    attempts: number | null;
    expireAt: Date | null;
    error: ClerkAPIError | null;
    verifiedAtClient: string | null;
    channel?: PhoneCodeChannel;
    constructor(data: VerificationJSON | VerificationJSONSnapshot | null);
    verifiedFromTheSameClient: () => boolean;
    protected fromJSON(data: VerificationJSON | VerificationJSONSnapshot | null): this;
    __internal_toSnapshot(): VerificationJSONSnapshot;
}
export declare class PasskeyVerification extends Verification implements PasskeyVerificationResource {
    publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions | null;
    constructor(data: VerificationJSON | VerificationJSONSnapshot | null);
    /**
     * Transform base64url encoded strings to ArrayBuffer
     */
    protected fromJSON(data: VerificationJSON | VerificationJSONSnapshot | null): this;
}
export declare class SignUpVerifications implements SignUpVerificationsResource {
    emailAddress: SignUpVerificationResource;
    phoneNumber: SignUpVerificationResource;
    web3Wallet: SignUpVerificationResource;
    externalAccount: VerificationResource;
    constructor(data: SignUpVerificationsJSON | SignUpVerificationsJSONSnapshot | null);
    __internal_toSnapshot(): SignUpVerificationsJSONSnapshot;
}
export declare class SignUpVerification extends Verification {
    nextAction: string;
    supportedStrategies: string[];
    constructor(data: SignUpVerificationJSON | SignUpVerificationJSONSnapshot | null);
    __internal_toSnapshot(): SignUpVerificationJSONSnapshot;
}
