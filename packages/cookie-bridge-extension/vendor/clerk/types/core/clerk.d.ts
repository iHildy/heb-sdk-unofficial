import { TelemetryCollector } from '@clerk/shared/telemetry';
import type { __experimental_CheckoutInstance, __experimental_CheckoutOptions, __internal_AttemptToEnableEnvironmentSettingParams, __internal_AttemptToEnableEnvironmentSettingResult, __internal_CheckoutProps, __internal_EnableOrganizationsPromptProps, __internal_OAuthConsentProps, __internal_PlanDetailsProps, __internal_SubscriptionDetailsProps, __internal_UserVerificationModalProps, APIKeysNamespace, APIKeysProps, AuthenticateWithBaseParams, AuthenticateWithCoinbaseWalletParams, AuthenticateWithGoogleOneTapParams, AuthenticateWithMetamaskParams, AuthenticateWithOKXWalletParams, AuthenticateWithSolanaParams, BillingNamespace, Clerk as ClerkInterface, ClerkAPIError, ClerkAuthenticateWithWeb3Params, ClerkOptions, ClientJSONSnapshot, ClientResource, CreateOrganizationParams, CreateOrganizationProps, CredentialReturn, DomainOrProxyUrl, EnvironmentJSON, EnvironmentJSONSnapshot, EnvironmentResource, GoogleOneTapProps, HandleEmailLinkVerificationParams, HandleOAuthCallbackParams, InstanceType, JoinWaitlistParams, ListenerCallback, NavigateOptions, OrganizationListProps, OrganizationProfileProps, OrganizationResource, OrganizationSwitcherProps, PricingTableProps, PublicKeyCredentialCreationOptionsWithoutExtensions, PublicKeyCredentialRequestOptionsWithoutExtensions, PublicKeyCredentialWithAuthenticatorAssertionResponse, PublicKeyCredentialWithAuthenticatorAttestationResponse, SDKMetadata, SetActiveParams, SignedInSessionResource, SignInProps, SignInRedirectOptions, SignInResource, SignOut, SignUpProps, SignUpRedirectOptions, SignUpResource, TaskChooseOrganizationProps, TaskResetPasswordProps, TasksRedirectOptions, UnsubscribeCallback, UserAvatarProps, UserButtonProps, UserProfileProps, UserResource, WaitlistProps, WaitlistResource } from '@clerk/shared/types';
import type { QueryClient } from '@tanstack/query-core';
import type { MountComponentRenderer } from '../ui/Components';
import type { FapiClient, FapiRequestCallback } from './fapiClient';
import { State } from './state';
declare global {
    interface Window {
        Clerk?: Clerk;
        __clerk_publishable_key?: string;
        __clerk_proxy_url?: ClerkInterface['proxyUrl'];
        __clerk_domain?: ClerkInterface['domain'];
    }
}
export declare class Clerk implements ClerkInterface {
    #private;
    static mountComponentRenderer?: MountComponentRenderer;
    static version: string;
    static sdkMetadata: SDKMetadata;
    private static _billing;
    private static _apiKeys;
    private _checkout;
    client: ClientResource | undefined;
    session: SignedInSessionResource | null | undefined;
    organization: OrganizationResource | null | undefined;
    user: UserResource | null | undefined;
    __internal_country?: string | null;
    telemetry: TelemetryCollector | undefined;
    readonly __internal_state: State;
    protected internal_last_error: ClerkAPIError | null;
    protected environment?: EnvironmentResource | null;
    get __internal_queryClient(): {
        __tag: 'clerk-rq-client';
        client: QueryClient;
    } | undefined;
    __internal_getCachedResources: (() => Promise<{
        client: ClientJSONSnapshot | null;
        environment: EnvironmentJSONSnapshot | null;
    }>) | undefined;
    __internal_createPublicCredentials: ((publicKey: PublicKeyCredentialCreationOptionsWithoutExtensions) => Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAttestationResponse>>) | undefined;
    __internal_getPublicCredentials: (({ publicKeyOptions, }: {
        publicKeyOptions: PublicKeyCredentialRequestOptionsWithoutExtensions;
    }) => Promise<CredentialReturn<PublicKeyCredentialWithAuthenticatorAssertionResponse>>) | undefined;
    __internal_isWebAuthnSupported: (() => boolean) | undefined;
    __internal_isWebAuthnAutofillSupported: (() => Promise<boolean>) | undefined;
    __internal_isWebAuthnPlatformAuthenticatorSupported: (() => Promise<boolean>) | undefined;
    __internal_setActiveInProgress: boolean;
    get publishableKey(): string;
    get version(): string;
    set sdkMetadata(metadata: SDKMetadata);
    get sdkMetadata(): SDKMetadata;
    get loaded(): boolean;
    get status(): ClerkInterface['status'];
    get isSatellite(): boolean;
    get domain(): string;
    get proxyUrl(): string;
    get frontendApi(): string;
    get instanceType(): InstanceType | undefined;
    get isStandardBrowser(): boolean;
    get billing(): BillingNamespace;
    get apiKeys(): APIKeysNamespace;
    __experimental_checkout(options: __experimental_CheckoutOptions): __experimental_CheckoutInstance;
    __internal_getOption<K extends keyof ClerkOptions>(key: K): ClerkOptions[K];
    get isSignedIn(): boolean;
    constructor(key: string, options?: DomainOrProxyUrl);
    getFapiClient: () => FapiClient;
    load: (options?: ClerkOptions) => Promise<void>;
    signOut: SignOut;
    openGoogleOneTap: (props?: GoogleOneTapProps) => void;
    closeGoogleOneTap: () => void;
    openSignIn: (props?: SignInProps) => void;
    closeSignIn: () => void;
    __internal_openCheckout: (props?: __internal_CheckoutProps) => void;
    __internal_closeCheckout: () => void;
    __internal_openPlanDetails: (props: __internal_PlanDetailsProps) => void;
    __internal_closePlanDetails: () => void;
    __internal_openSubscriptionDetails: (props?: __internal_SubscriptionDetailsProps) => void;
    __internal_closeSubscriptionDetails: () => void;
    __internal_openReverification: (props?: __internal_UserVerificationModalProps) => void;
    __internal_closeReverification: () => void;
    __internal_attemptToEnableEnvironmentSetting: (params: __internal_AttemptToEnableEnvironmentSettingParams) => __internal_AttemptToEnableEnvironmentSettingResult;
    __internal_openEnableOrganizationsPrompt: (props: __internal_EnableOrganizationsPromptProps) => void;
    __internal_closeEnableOrganizationsPrompt: () => void;
    __internal_openBlankCaptchaModal: () => Promise<unknown>;
    __internal_closeBlankCaptchaModal: () => Promise<unknown>;
    __internal_loadStripeJs: () => Promise<((publishableKey: string, options?: import("@stripe/stripe-js").StripeConstructorOptions | undefined) => Promise<import("@stripe/stripe-js").Stripe | null>) | {
        loadStripe: () => Promise<null>;
    }>;
    openSignUp: (props?: SignUpProps) => void;
    closeSignUp: () => void;
    openUserProfile: (props?: UserProfileProps) => void;
    closeUserProfile: () => void;
    openOrganizationProfile: (props?: OrganizationProfileProps) => void;
    closeOrganizationProfile: () => void;
    openCreateOrganization: (props?: CreateOrganizationProps) => void;
    closeCreateOrganization: () => void;
    openWaitlist: (props?: WaitlistProps) => void;
    closeWaitlist: () => void;
    mountSignIn: (node: HTMLDivElement, props?: SignInProps) => void;
    unmountSignIn: (node: HTMLDivElement) => void;
    mountUserAvatar: (node: HTMLDivElement, props?: UserAvatarProps) => void;
    unmountUserAvatar: (node: HTMLDivElement) => void;
    mountSignUp: (node: HTMLDivElement, props?: SignUpProps) => void;
    unmountSignUp: (node: HTMLDivElement) => void;
    mountUserProfile: (node: HTMLDivElement, props?: UserProfileProps) => void;
    unmountUserProfile: (node: HTMLDivElement) => void;
    mountOrganizationProfile: (node: HTMLDivElement, props?: OrganizationProfileProps) => void;
    unmountOrganizationProfile: (node: HTMLDivElement) => void;
    mountCreateOrganization: (node: HTMLDivElement, props?: CreateOrganizationProps) => void;
    unmountCreateOrganization: (node: HTMLDivElement) => void;
    mountOrganizationSwitcher: (node: HTMLDivElement, props?: OrganizationSwitcherProps) => void;
    unmountOrganizationSwitcher: (node: HTMLDivElement) => void;
    __experimental_prefetchOrganizationSwitcher: () => void;
    mountOrganizationList: (node: HTMLDivElement, props?: OrganizationListProps) => void;
    unmountOrganizationList: (node: HTMLDivElement) => void;
    mountUserButton: (node: HTMLDivElement, props?: UserButtonProps) => void;
    unmountUserButton: (node: HTMLDivElement) => void;
    mountWaitlist: (node: HTMLDivElement, props?: WaitlistProps) => void;
    unmountWaitlist: (node: HTMLDivElement) => void;
    mountPricingTable: (node: HTMLDivElement, props?: PricingTableProps) => void;
    unmountPricingTable: (node: HTMLDivElement) => void;
    __internal_mountOAuthConsent: (node: HTMLDivElement, props?: __internal_OAuthConsentProps) => void;
    __internal_unmountOAuthConsent: (node: HTMLDivElement) => void;
    /**
     * @experimental This API is in early access and may change in future releases.
     *
     * Mount a API keys component at the target element.
     * @param targetNode Target to mount the APIKeys component.
     * @param props Configuration parameters.
     */
    mountAPIKeys: (node: HTMLDivElement, props?: APIKeysProps) => void;
    /**
     * @experimental This API is in early access and may change in future releases.
     *
     * Unmount a API keys component from the target element.
     * If there is no component mounted at the target node, results in a noop.
     *
     * @param targetNode Target node to unmount the APIKeys component from.
     */
    unmountAPIKeys: (node: HTMLDivElement) => void;
    mountTaskChooseOrganization: (node: HTMLDivElement, props?: TaskChooseOrganizationProps) => void;
    unmountTaskChooseOrganization: (node: HTMLDivElement) => void;
    mountTaskResetPassword: (node: HTMLDivElement, props?: TaskResetPasswordProps) => void;
    unmountTaskResetPassword: (node: HTMLDivElement) => void;
    /**
     * `setActive` can be used to set the active session and/or organization.
     */
    setActive: (params: SetActiveParams) => Promise<void>;
    addListener: (listener: ListenerCallback) => UnsubscribeCallback;
    on: ClerkInterface['on'];
    off: ClerkInterface['off'];
    __internal_addNavigationListener: (listener: () => void) => UnsubscribeCallback;
    navigate: (to: string | undefined, options?: NavigateOptions) => Promise<unknown>;
    buildUrlWithAuth(to: string): string;
    buildSignInUrl(options?: SignInRedirectOptions): string;
    buildSignUpUrl(options?: SignUpRedirectOptions): string;
    buildUserProfileUrl(): string;
    buildHomeUrl(): string;
    buildAfterSignInUrl({ params }?: {
        params?: URLSearchParams;
    }): string;
    buildAfterSignUpUrl({ params }?: {
        params?: URLSearchParams;
    }): string;
    buildAfterSignOutUrl(): string;
    buildNewSubscriptionRedirectUrl(): string;
    buildWaitlistUrl(options?: {
        initialValues?: Record<string, string>;
    }): string;
    buildAfterMultiSessionSingleSignOutUrl(): string;
    buildCreateOrganizationUrl(): string;
    buildOrganizationProfileUrl(): string;
    buildTasksUrl(options?: TasksRedirectOptions): string;
    redirectWithAuth: (to: string) => Promise<unknown>;
    redirectToSignIn: (options?: SignInRedirectOptions) => Promise<unknown>;
    redirectToSignUp: (options?: SignUpRedirectOptions) => Promise<unknown>;
    redirectToUserProfile: () => Promise<unknown>;
    redirectToCreateOrganization: () => Promise<unknown>;
    redirectToOrganizationProfile: () => Promise<unknown>;
    redirectToAfterSignIn: () => Promise<unknown>;
    redirectToAfterSignUp: () => Promise<unknown>;
    redirectToAfterSignOut: () => Promise<unknown>;
    redirectToWaitlist: () => Promise<unknown>;
    redirectToTasks: (options?: TasksRedirectOptions) => Promise<unknown>;
    handleEmailLinkVerification: (params: HandleEmailLinkVerificationParams, customNavigate?: (to: string) => Promise<unknown>) => Promise<unknown>;
    handleGoogleOneTapCallback: (signInOrUp: SignInResource | SignUpResource, params: HandleOAuthCallbackParams, customNavigate?: (to: string) => Promise<unknown>) => Promise<unknown>;
    private _handleRedirectCallback;
    handleRedirectCallback: (params?: HandleOAuthCallbackParams, customNavigate?: (to: string) => Promise<unknown>) => Promise<unknown>;
    handleUnauthenticated: (opts?: {
        broadcast: boolean;
    }) => Promise<unknown>;
    authenticateWithGoogleOneTap: (params: AuthenticateWithGoogleOneTapParams) => Promise<SignInResource | SignUpResource>;
    authenticateWithMetamask: (props?: AuthenticateWithMetamaskParams) => Promise<void>;
    authenticateWithCoinbaseWallet: (props?: AuthenticateWithCoinbaseWalletParams) => Promise<void>;
    authenticateWithBase: (props?: AuthenticateWithBaseParams) => Promise<void>;
    authenticateWithOKXWallet: (props?: AuthenticateWithOKXWalletParams) => Promise<void>;
    authenticateWithSolana: (props: AuthenticateWithSolanaParams) => Promise<void>;
    authenticateWithWeb3: ({ redirectUrl, signUpContinueUrl, customNavigate, unsafeMetadata, strategy, legalAccepted, secondFactorUrl, walletName, }: ClerkAuthenticateWithWeb3Params) => Promise<void>;
    createOrganization: ({ name, slug }: CreateOrganizationParams) => Promise<OrganizationResource>;
    getOrganization: (organizationId: string) => Promise<OrganizationResource>;
    joinWaitlist: ({ emailAddress }: JoinWaitlistParams) => Promise<WaitlistResource>;
    updateEnvironment(environment: EnvironmentResource): asserts this is {
        environment: EnvironmentResource;
    };
    __internal_setCountry: (country: string | null) => void;
    get __internal_last_error(): ClerkAPIError | null;
    set __internal_last_error(value: ClerkAPIError | null);
    updateClient: (newClient: ClientResource) => void;
    get __unstable__environment(): EnvironmentResource | null | undefined;
    __unstable__setEnvironment: (env: EnvironmentJSON) => Promise<void>;
    __unstable__onBeforeRequest: (callback: FapiRequestCallback<any>) => void;
    __unstable__onAfterResponse: (callback: FapiRequestCallback<any>) => void;
    __unstable__updateProps: (_props: any) => Promise<void> | undefined;
    __internal_navigateWithError(to: string, err: ClerkAPIError): Promise<unknown>;
    private shouldFallbackToCachedResources;
    __internal_reloadInitialResources: () => Promise<void>;
    assertComponentsReady(controls: unknown): asserts controls is ReturnType<MountComponentRenderer>;
}
