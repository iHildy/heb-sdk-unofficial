/**
 * Used to log a warning when a Clerk feature is used in an unsupported environment.
 * (Development Only)
 * This is a warning and not an error because the application will still work, but the feature will not be available.
 *
 * @param strategy The strategy that is not supported in the current environment.
 * @returns void
 */
export declare function clerkUnsupportedEnvironmentWarning(strategy: string): void;
export declare function clerkNetworkError(url: string, e: Error): never;
export declare function clerkErrorInitFailed(): never;
export declare function clerkErrorDevInitFailed(msg?: string): never;
export declare function clerkErrorPathRouterMissingPath(componentName: string): never;
export declare function clerkCoreErrorContextProviderNotFound(providerName: string): never;
export declare function clerkCoreErrorNoClerkSingleton(): never;
export declare function clerkUIErrorDOMElementNotFound(): never;
export declare function clerkMissingFapiClientInResources(): never;
export declare function clerkOAuthCallbackDidNotCompleteSignInSignUp(type: 'sign in' | 'sign up'): never;
export declare function clerkVerifyEmailAddressCalledBeforeCreate(type: 'SignIn' | 'SignUp'): never;
export declare function clerkInvalidStrategy(functionaName: string, strategy: string): never;
export declare function clerkVerifyWeb3WalletCalledBeforeCreate(type: 'SignIn' | 'SignUp'): never;
export declare function clerkVerifyPasskeyCalledBeforeCreate(): never;
export declare function clerkMissingOptionError(name?: string): never;
export declare function clerkInvalidFAPIResponse(status: string | null, supportEmail: string): never;
export declare function clerkMissingDevBrowserJwt(): never;
export declare function clerkMissingProxyUrlAndDomain(): never;
export declare function clerkInvalidSignInUrlOrigin(): never;
export declare function clerkInvalidSignInUrlFormat(): never;
export declare function clerkMissingSignInUrlAsSatellite(): never;
export declare function clerkRedirectUrlIsMissingScheme(): never;
export declare function clerkFailedToLoadThirdPartyScript(name?: string): never;
export declare function clerkInvalidRoutingStrategy(strategy?: string): never;
export declare function clerkUnsupportedReloadMethod(className: string): never;
export declare function clerkMissingWebAuthnPublicKeyOptions(name: 'create' | 'get'): never;
