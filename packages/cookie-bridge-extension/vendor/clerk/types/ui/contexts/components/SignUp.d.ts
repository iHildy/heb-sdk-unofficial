import type { SessionResource } from '@clerk/shared/types';
import type { ParsedQueryString } from '../../router';
import type { SignUpCtx } from '../../types';
export type SignUpContextType = Omit<SignUpCtx, 'fallbackRedirectUrl' | 'forceRedirectUrl'> & {
    navigateAfterSignUp: () => any;
    queryParams: ParsedQueryString;
    signInUrl: string;
    signUpUrl: string;
    secondFactorUrl: string;
    authQueryString: string | null;
    afterSignUpUrl: string;
    afterSignInUrl: string;
    waitlistUrl: string;
    isCombinedFlow: boolean;
    emailLinkRedirectUrl: string;
    ssoCallbackUrl: string;
    navigateOnSetActive: (opts: {
        session: SessionResource;
        redirectUrl: string;
    }) => Promise<unknown>;
    taskUrl: string | null;
};
export declare const SignUpContext: import("react").Context<SignUpCtx | null>;
export declare const useSignUpContext: () => SignUpContextType;
