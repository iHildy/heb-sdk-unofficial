import type { SessionVerificationResource } from '@clerk/shared/types';
declare const useAfterVerification: () => {
    handleVerificationResponse: (sessionVerification: SessionVerificationResource) => Promise<unknown>;
};
export { useAfterVerification };
