import { type ClerkError } from '@clerk/shared/error';
import type { AttemptFirstFactorParams, AttemptSecondFactorParams, AuthenticateWithPasskeyParams, AuthenticateWithPopupParams, AuthenticateWithRedirectParams, AuthenticateWithWeb3Params, ClientTrustState, CreateEmailLinkFlowReturn, PrepareFirstFactorParams, PrepareSecondFactorParams, ResetPasswordParams, SignInAuthenticateWithSolanaParams, SignInCreateParams, SignInFirstFactor, SignInFutureBackupCodeVerifyParams, SignInFutureCreateParams, SignInFutureEmailCodeSendParams, SignInFutureEmailCodeVerifyParams, SignInFutureEmailLinkSendParams, SignInFutureFinalizeParams, SignInFutureMFAPhoneCodeVerifyParams, SignInFuturePasskeyParams, SignInFuturePasswordParams, SignInFuturePhoneCodeSendParams, SignInFuturePhoneCodeVerifyParams, SignInFutureResetPasswordSubmitParams, SignInFutureResource, SignInFutureSSOParams, SignInFutureTicketParams, SignInFutureTOTPVerifyParams, SignInFutureWeb3Params, SignInIdentifier, SignInJSON, SignInJSONSnapshot, SignInResource, SignInSecondFactor, SignInStartEmailLinkFlowParams, SignInStatus, VerificationResource } from '@clerk/shared/types';
import { createValidatePassword } from '../../utils/passwords/password';
import { BaseResource, UserData } from './internal';
export declare class SignIn extends BaseResource implements SignInResource {
    pathRoot: string;
    id?: string;
    private _status;
    supportedIdentifiers: SignInIdentifier[];
    supportedFirstFactors: SignInFirstFactor[] | null;
    supportedSecondFactors: SignInSecondFactor[] | null;
    firstFactorVerification: VerificationResource;
    secondFactorVerification: VerificationResource;
    identifier: string | null;
    createdSessionId: string | null;
    userData: UserData;
    clientTrustState?: ClientTrustState;
    /**
     * The current status of the sign-in process.
     *
     * @returns The current sign-in status, or null if no status has been set
     */
    get status(): SignInStatus | null;
    /**
     * Sets the sign-in status and logs the transition at debug level.
     *
     * @param value - The new status to set. Can be null to clear the status.
     * @remarks When setting a new status that differs from the previous one,
     * a debug log entry is created showing the transition from the old to new status.
     */
    set status(value: SignInStatus | null);
    /**
     * @experimental This experimental API is subject to change.
     *
     * An instance of `SignInFuture`, which has a different API than `SignIn`, intended to be used in custom flows.
     */
    __internal_future: SignInFuture;
    /**
     * @internal Only used for internal purposes, and is not intended to be used directly.
     *
     * This property is used to provide access to underlying Client methods to `SignInFuture`, which wraps an instance
     * of `SignIn`.
     */
    __internal_basePost: <J extends import("@clerk/types").ClerkResourceJSON | null>(params?: import("./Base").BaseMutateParams) => Promise<this>;
    /**
     * @internal Only used for internal purposes, and is not intended to be used directly.
     *
     * This property is used to provide access to underlying Client methods to `SignInFuture`, which wraps an instance
     * of `SignIn`.
     */
    __internal_baseGet: <J extends import("@clerk/types").ClerkResourceJSON | null>(opts?: import("./Base").BaseFetchOptions) => Promise<this>;
    constructor(data?: SignInJSON | SignInJSONSnapshot | null);
    create: (params: SignInCreateParams) => Promise<SignInResource>;
    resetPassword: (params: ResetPasswordParams) => Promise<SignInResource>;
    prepareFirstFactor: (params: PrepareFirstFactorParams) => Promise<SignInResource>;
    attemptFirstFactor: (params: AttemptFirstFactorParams) => Promise<SignInResource>;
    createEmailLinkFlow: () => CreateEmailLinkFlowReturn<SignInStartEmailLinkFlowParams, SignInResource>;
    prepareSecondFactor: (params: PrepareSecondFactorParams) => Promise<SignInResource>;
    attemptSecondFactor: (params: AttemptSecondFactorParams) => Promise<SignInResource>;
    private authenticateWithRedirectOrPopup;
    authenticateWithRedirect: (params: AuthenticateWithRedirectParams) => Promise<void>;
    authenticateWithPopup: (params: AuthenticateWithPopupParams) => Promise<void>;
    authenticateWithWeb3: (params: AuthenticateWithWeb3Params) => Promise<SignInResource>;
    authenticateWithMetamask: () => Promise<SignInResource>;
    authenticateWithCoinbaseWallet: () => Promise<SignInResource>;
    authenticateWithBase: () => Promise<SignInResource>;
    authenticateWithOKXWallet: () => Promise<SignInResource>;
    /**
     * Authenticates a user using a Solana Web3 wallet during sign-in.
     *
     * @param params - Configuration for Solana authentication
     * @param params.walletName - The name of the Solana wallet to use for authentication
     * @returns A promise that resolves to the updated SignIn resource
     * @throws {ClerkRuntimeError} If walletName is not provided or wallet connection fails
     *
     * @example
     * ```typescript
     * await signIn.authenticateWithSolana({ walletName: 'phantom' });
     * ```
     */
    authenticateWithSolana: ({ walletName, }: SignInAuthenticateWithSolanaParams) => Promise<SignInResource>;
    authenticateWithPasskey: (params?: AuthenticateWithPasskeyParams) => Promise<SignInResource>;
    validatePassword: ReturnType<typeof createValidatePassword>;
    protected fromJSON(data: SignInJSON | SignInJSONSnapshot | null): this;
    __internal_toSnapshot(): SignInJSONSnapshot;
}
declare class SignInFuture implements SignInFutureResource {
    #private;
    emailCode: {
        sendCode: (params?: SignInFutureEmailCodeSendParams) => Promise<{
            error: ClerkError | null;
        }>;
        verifyCode: (params: SignInFutureEmailCodeVerifyParams) => Promise<{
            error: ClerkError | null;
        }>;
    };
    emailLink: {
        sendLink: (params: SignInFutureEmailLinkSendParams) => Promise<{
            error: ClerkError | null;
        }>;
        waitForVerification: () => Promise<{
            error: ClerkError | null;
        }>;
        readonly verification: {
            status: "expired" | "failed" | "client_mismatch" | "verified";
            createdSessionId: string;
            verifiedFromTheSameClient: boolean;
        } | null;
    };
    resetPasswordEmailCode: {
        sendCode: () => Promise<{
            error: ClerkError | null;
        }>;
        verifyCode: (params: SignInFutureEmailCodeVerifyParams) => Promise<{
            error: ClerkError | null;
        }>;
        submitPassword: (params: SignInFutureResetPasswordSubmitParams) => Promise<{
            error: ClerkError | null;
        }>;
    };
    phoneCode: {
        sendCode: (params?: SignInFuturePhoneCodeSendParams) => Promise<{
            error: ClerkError | null;
        }>;
        verifyCode: (params: SignInFuturePhoneCodeVerifyParams) => Promise<{
            error: ClerkError | null;
        }>;
    };
    mfa: {
        sendPhoneCode: () => Promise<{
            error: ClerkError | null;
        }>;
        verifyPhoneCode: (params: SignInFutureMFAPhoneCodeVerifyParams) => Promise<{
            error: ClerkError | null;
        }>;
        verifyTOTP: (params: SignInFutureTOTPVerifyParams) => Promise<{
            error: ClerkError | null;
        }>;
        verifyBackupCode: (params: SignInFutureBackupCodeVerifyParams) => Promise<{
            error: ClerkError | null;
        }>;
    };
    constructor(resource: SignIn);
    get id(): string | undefined;
    get identifier(): string | null;
    get createdSessionId(): string | null;
    get userData(): UserData;
    get status(): SignInStatus;
    get supportedFirstFactors(): SignInFirstFactor[];
    get supportedSecondFactors(): SignInSecondFactor[];
    get isTransferable(): boolean;
    get existingSession(): {
        sessionId: string;
    } | undefined;
    get firstFactorVerification(): VerificationResource;
    get secondFactorVerification(): VerificationResource;
    sendResetPasswordEmailCode(): Promise<{
        error: ClerkError | null;
    }>;
    verifyResetPasswordEmailCode(params: SignInFutureEmailCodeVerifyParams): Promise<{
        error: ClerkError | null;
    }>;
    submitResetPassword(params: SignInFutureResetPasswordSubmitParams): Promise<{
        error: ClerkError | null;
    }>;
    private _create;
    create(params: SignInFutureCreateParams): Promise<{
        error: ClerkError | null;
    }>;
    password(params: SignInFuturePasswordParams): Promise<{
        error: ClerkError | null;
    }>;
    sendEmailCode(params?: SignInFutureEmailCodeSendParams): Promise<{
        error: ClerkError | null;
    }>;
    verifyEmailCode(params: SignInFutureEmailCodeVerifyParams): Promise<{
        error: ClerkError | null;
    }>;
    sendEmailLink(params: SignInFutureEmailLinkSendParams): Promise<{
        error: ClerkError | null;
    }>;
    waitForEmailLinkVerification(): Promise<{
        error: ClerkError | null;
    }>;
    sendPhoneCode(params?: SignInFuturePhoneCodeSendParams): Promise<{
        error: ClerkError | null;
    }>;
    verifyPhoneCode(params: SignInFuturePhoneCodeVerifyParams): Promise<{
        error: ClerkError | null;
    }>;
    sso(params: SignInFutureSSOParams): Promise<{
        error: ClerkError | null;
    }>;
    web3(params: SignInFutureWeb3Params): Promise<{
        error: ClerkError | null;
    }>;
    passkey(params?: SignInFuturePasskeyParams): Promise<{
        error: ClerkError | null;
    }>;
    sendMFAPhoneCode(): Promise<{
        error: ClerkError | null;
    }>;
    verifyMFAPhoneCode(params: SignInFutureMFAPhoneCodeVerifyParams): Promise<{
        error: ClerkError | null;
    }>;
    verifyTOTP(params: SignInFutureTOTPVerifyParams): Promise<{
        error: ClerkError | null;
    }>;
    verifyBackupCode(params: SignInFutureBackupCodeVerifyParams): Promise<{
        error: ClerkError | null;
    }>;
    ticket(params?: SignInFutureTicketParams): Promise<{
        error: ClerkError | null;
    }>;
    finalize(params?: SignInFutureFinalizeParams): Promise<{
        error: ClerkError | null;
    }>;
    private selectFirstFactor;
}
export {};
