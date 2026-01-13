declare const preloadSignUp: () => Promise<typeof import("../SignUp")>;
declare const LazySignUpVerifyPhone: import("react").LazyExoticComponent<() => import("@emotion/react/jsx-runtime").JSX.Element>;
declare const LazySignUpVerifyEmail: import("react").LazyExoticComponent<(props: unknown) => import("@emotion/react/jsx-runtime").JSX.Element>;
declare const LazySignUpStart: import("react").LazyExoticComponent<{
    (props: import("../../types").AvailableComponentProps): JSX.Element | null;
    displayName: string;
}>;
declare const LazySignUpSSOCallback: import("react").LazyExoticComponent<{
    (props: import("@clerk/types").HandleOAuthCallbackParams): JSX.Element | null;
    displayName: string;
}>;
declare const LazySignUpContinue: import("react").LazyExoticComponent<(props: unknown) => import("@emotion/react/jsx-runtime").JSX.Element>;
declare const lazyCompleteSignUpFlow: () => Promise<({ signUp, verifyEmailPath, verifyPhonePath, continuePath, navigate, handleComplete, redirectUrl, redirectUrlComplete, oidcPrompt, }: {
    signUp: import("@clerk/types").SignUpResource;
    verifyEmailPath?: string;
    verifyPhonePath?: string;
    continuePath?: string;
    navigate: (to: string, options?: {
        searchParams?: URLSearchParams;
    }) => Promise<unknown>;
    handleComplete?: () => Promise<void>;
    redirectUrl?: string;
    redirectUrlComplete?: string;
    oidcPrompt?: string;
}) => Promise<unknown> | undefined>;
export { preloadSignUp, LazySignUpVerifyPhone, LazySignUpVerifyEmail, LazySignUpStart, LazySignUpSSOCallback, LazySignUpContinue, lazyCompleteSignUpFlow, };
