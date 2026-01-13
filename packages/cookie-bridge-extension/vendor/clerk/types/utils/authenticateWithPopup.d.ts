import type { AuthenticateWithPopupParams, AuthenticateWithRedirectParams } from '@clerk/shared/types';
import type { Clerk } from '../core/clerk';
export declare function _authenticateWithPopup(client: Clerk, reloadResource: 'signIn' | 'signUp', authenticateMethod: (params: AuthenticateWithRedirectParams, navigateCallback: (url: URL | string) => void) => Promise<void>, params: AuthenticateWithPopupParams & {
    unsafeMetadata?: SignUpUnsafeMetadata;
}, navigateCallback: (url: URL | string) => void): Promise<void>;
/**
 * Creates new redirect and callback URLs that point to the `/popup-callback` route on Account Portal. These URLs will
 * be used by FAPI to redirect after the OAuth flow completes, and will result in a message being sent to the parent
 * window.
 */
export declare function wrapWithPopupRoutes(client: Clerk, { redirectCallbackUrl, redirectUrl, }: {
    /**
     * The route to navigate to if a session was not created.
     */
    redirectCallbackUrl: string;
    /**
     * The route to navigate to if a session was created.
     */
    redirectUrl: string;
}): {
    redirectCallbackUrl: string;
    redirectUrl: string;
};
export declare function _futureAuthenticateWithPopup(client: Clerk, params: {
    popup: {
        location: {
            href: string;
        };
    };
    externalVerificationRedirectURL: URL;
}): Promise<void>;
