import type { SessionResource } from '@clerk/shared/types';
import type { ParsedQueryString } from '../../router';
import type { SignInCtx } from '../../types';
export type SignInContextType = Omit<SignInCtx, 'fallbackRedirectUrl' | 'forceRedirectUrl'> & {
    navigateAfterSignIn: () => any;
    queryParams: ParsedQueryString;
    signUpUrl: string;
    signInUrl: string;
    signUpContinueUrl: string;
    authQueryString: string | null;
    afterSignUpUrl: string;
    afterSignInUrl: string;
    transferable: boolean;
    waitlistUrl: string;
    emailLinkRedirectUrl: string;
    ssoCallbackUrl: string;
    isCombinedFlow: boolean;
    navigateOnSetActive: (opts: {
        session: SessionResource;
        redirectUrl: string;
    }) => Promise<unknown>;
    taskUrl: string | null;
};
export declare const SignInContext: import("react").Context<SignInCtx | null>;
export declare const useSignInContext: () => SignInContextType;
