import type { ClerkAPIError, ClerkRuntimeError } from '@clerk/shared/types';
import React from 'react';
type Status = 'idle' | 'loading' | 'error';
type Metadata = string | undefined;
type State = {
    status: Status;
    metadata: Metadata;
    error: string | undefined;
};
export declare const CardStateProvider: (props: React.PropsWithChildren<any>) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const useCardState: () => {
    setIdle: (metadata?: Metadata) => void;
    setError: (metadata: ClerkRuntimeError | ClerkAPIError | Metadata | string) => void;
    setLoading: (metadata?: Metadata) => void;
    runAsync: <T = unknown>(cb: Promise<T> | (() => Promise<T>), metadata?: Metadata) => Promise<T>;
    loadingMetadata: Metadata;
    error: string | undefined;
    isLoading: boolean;
    isIdle: boolean;
    state: State;
};
export declare const withCardStateProvider: <T>(Component: React.ComponentType<T>) => (props: T) => import("@emotion/react/jsx-runtime").JSX.Element;
export type FlowMetadata = {
    flow: 'signIn' | 'signUp' | 'userButton' | 'userProfile' | 'userVerification' | 'organizationProfile' | 'createOrganization' | 'organizationSwitcher' | 'organizationList' | 'oneTap' | 'blankCaptcha' | 'waitlist' | 'checkout' | 'planDetails' | 'pricingTable' | 'apiKeys' | 'oauthConsent' | 'subscriptionDetails' | 'tasks' | 'taskChooseOrganization' | 'enableOrganizations' | 'taskResetPassword';
    part?: 'start' | 'emailCode' | 'emailCode2Fa' | 'phoneCode' | 'phoneCode2Fa' | 'totp2Fa' | 'backupCode2Fa' | 'password' | 'resetPassword' | 'emailLink' | 'emailLinkVerify' | 'emailLinkStatus' | 'alternativeMethods' | 'forgotPasswordMethods' | 'passwordPwnedMethods' | 'passwordCompromisedMethods' | 'havingTrouble' | 'ssoCallback' | 'popupCallback' | 'popover' | 'complete' | 'accountSwitcher' | 'chooseOrganization' | 'organizationCreationDisabled' | 'enterpriseConnections' | 'chooseWallet';
};
declare const useFlowMetadata: () => FlowMetadata;
export declare const FlowMetadataProvider: (props: React.PropsWithChildren<FlowMetadata>) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare const withFloatingTree: <T>(Component: React.ComponentType<T>) => React.ComponentType<T>;
export { useFlowMetadata };
