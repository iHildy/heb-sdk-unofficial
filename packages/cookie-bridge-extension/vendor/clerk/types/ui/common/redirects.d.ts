import type { SignInContextType, SignUpContextType, UserProfileContextType } from './../contexts';
export declare const SSO_CALLBACK_PATH_ROUTE = "/sso-callback";
export declare const MAGIC_LINK_VERIFY_PATH_ROUTE = "/verify";
export declare function buildVerificationRedirectUrl({ ctx, baseUrl, intent, }: {
    ctx: SignInContextType | SignUpContextType | UserProfileContextType;
    baseUrl?: string;
    intent?: 'sign-in' | 'sign-up' | 'profile';
}): string;
export declare function buildSSOCallbackURL(ctx: Partial<SignInContextType | SignUpContextType>, baseUrl?: string | undefined): string;
type AuthQueryString = string | null | undefined;
type BuildRedirectUrlParams = {
    routing: string | undefined;
    authQueryString: AuthQueryString;
    baseUrl: string;
    path: string | undefined;
    endpoint: string;
};
export declare const buildRedirectUrl: ({ routing, authQueryString, baseUrl, path, endpoint, }: BuildRedirectUrlParams) => string;
export {};
