import type { OAuthStrategy, PhoneCodeChannel, Web3Strategy } from '@clerk/shared/types';
import React from 'react';
export type SocialButtonsProps = React.PropsWithChildren<{
    enableOAuthProviders: boolean;
    enableWeb3Providers: boolean;
    enableAlternativePhoneCodeProviders: boolean;
}>;
type SocialButtonsRootProps = SocialButtonsProps & {
    oauthCallback: (strategy: OAuthStrategy) => Promise<unknown>;
    web3Callback: (strategy: Web3Strategy) => Promise<unknown>;
    alternativePhoneCodeCallback: (channel: PhoneCodeChannel) => void;
    idleAfterDelay?: boolean;
    showLastAuthenticationStrategy?: boolean;
};
export declare const SocialButtons: React.MemoExoticComponent<(props: SocialButtonsRootProps) => import("@emotion/react/jsx-runtime").JSX.Element | null>;
export {};
