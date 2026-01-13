import type { __internal_CheckoutProps, __internal_EnableOrganizationsPromptProps, __internal_PlanDetailsProps, __internal_SubscriptionDetailsProps, __internal_UserVerificationProps, Appearance, Clerk, ClerkOptions, EnvironmentResource, SignInProps, SignUpProps, UserProfileProps, WaitlistProps } from '@clerk/shared/types';
import React from 'react';
import type { AppearanceCascade } from './customizables/parseAppearance';
import type { ClerkComponentName } from './lazyModules/components';
import type { AvailableComponentProps } from './types';
/**
 * Avoid importing from `@clerk/shared/react` to prevent extra dependencies being added to the bundle.
 */
export declare const useSafeLayoutEffect: typeof React.useLayoutEffect;
export type ComponentControls = {
    mountComponent: (params: {
        appearanceKey: Uncapitalize<AppearanceCascade['appearanceKey']>;
        name: ClerkComponentName;
        node: HTMLDivElement;
        props?: AvailableComponentProps;
    }) => void;
    unmountComponent: (params: {
        node: HTMLDivElement;
    }) => void;
    updateProps: (params: {
        appearance?: Appearance | undefined;
        options?: ClerkOptions | undefined;
        node?: HTMLDivElement;
        props?: unknown;
    }) => void;
    openModal: <T extends 'googleOneTap' | 'signIn' | 'signUp' | 'userProfile' | 'organizationProfile' | 'createOrganization' | 'userVerification' | 'waitlist' | 'blankCaptcha' | 'enableOrganizationsPrompt'>(modal: T, props: T extends 'signIn' ? SignInProps : T extends 'signUp' ? SignUpProps : T extends 'userVerification' ? __internal_UserVerificationProps : T extends 'waitlist' ? WaitlistProps : T extends 'enableOrganizationsPrompt' ? __internal_EnableOrganizationsPromptProps : UserProfileProps) => void;
    closeModal: (modal: 'googleOneTap' | 'signIn' | 'signUp' | 'userProfile' | 'organizationProfile' | 'createOrganization' | 'userVerification' | 'waitlist' | 'blankCaptcha' | 'enableOrganizationsPrompt', options?: {
        notify?: boolean;
    }) => void;
    openDrawer: <T extends 'checkout' | 'planDetails' | 'subscriptionDetails'>(drawer: T, props: T extends 'checkout' ? __internal_CheckoutProps : T extends 'planDetails' ? __internal_PlanDetailsProps : T extends 'subscriptionDetails' ? __internal_SubscriptionDetailsProps : never) => void;
    closeDrawer: (drawer: 'checkout' | 'planDetails' | 'subscriptionDetails', options?: {
        notify?: boolean;
    }) => void;
    prefetch: (component: 'organizationSwitcher') => void;
    mountImpersonationFab: () => void;
};
export declare const mountComponentRenderer: (clerk: Clerk, environment: EnvironmentResource, options: ClerkOptions) => {
    ensureMounted: (opts?: {
        preloadHint: ClerkComponentName;
    }) => Promise<ComponentControls>;
};
export type MountComponentRenderer = typeof mountComponentRenderer;
