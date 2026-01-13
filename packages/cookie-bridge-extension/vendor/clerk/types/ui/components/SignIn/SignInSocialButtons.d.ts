import type { PhoneCodeChannel } from '@clerk/shared/types';
import React from 'react';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
export type SignInSocialButtonsProps = SocialButtonsProps & {
    onAlternativePhoneCodeProviderClick?: (channel: PhoneCodeChannel) => void;
};
export declare const SignInSocialButtons: React.MemoExoticComponent<(props: SignInSocialButtonsProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
