import type { SessionResource, SessionVerificationFirstFactor, SessionVerificationJSON, SessionVerificationLevel, SessionVerificationResource, SessionVerificationSecondFactor, SessionVerificationStatus, VerificationResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
export declare class SessionVerification extends BaseResource implements SessionVerificationResource {
    status: SessionVerificationStatus;
    level: SessionVerificationLevel;
    session: SessionResource;
    supportedFirstFactors: SessionVerificationFirstFactor[] | null;
    supportedSecondFactors: SessionVerificationSecondFactor[] | null;
    firstFactorVerification: VerificationResource;
    secondFactorVerification: VerificationResource;
    constructor(data?: SessionVerificationJSON | null);
    protected fromJSON(data: SessionVerificationJSON | null): this;
}
