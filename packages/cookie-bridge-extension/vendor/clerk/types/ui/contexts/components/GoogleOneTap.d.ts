import type { HandleOAuthCallbackParams } from '@clerk/shared/types';
import type { GoogleOneTapCtx } from '../../types';
export declare const GoogleOneTapContext: import("react").Context<GoogleOneTapCtx | null>;
export declare const useGoogleOneTapContext: () => {
    componentName: "GoogleOneTap";
    generateCallbackUrls: (returnBackUrl: string) => HandleOAuthCallbackParams;
    signInForceRedirectUrl?: string | null;
    signUpForceRedirectUrl?: string | null;
    cancelOnTapOutside?: boolean;
    itpSupport?: boolean;
    fedCmSupport?: boolean;
    appearance?: import("@clerk/types").SignInTheme;
};
