import type { UserVerificationCtx } from '../../types';
export type UserVerificationContextType = UserVerificationCtx;
export declare const UserVerificationContext: import("react").Context<UserVerificationCtx | null>;
export declare const useUserVerification: () => UserVerificationContextType;
