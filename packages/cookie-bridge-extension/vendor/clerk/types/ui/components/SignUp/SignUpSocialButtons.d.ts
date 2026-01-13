import type { PhoneCodeChannel } from '@clerk/shared/types';
import React from 'react';
import type { SocialButtonsProps } from '../../elements/SocialButtons';
export type SignUpSocialButtonsProps = SocialButtonsProps & {
    continueSignUp?: boolean;
    legalAccepted?: boolean;
    onAlternativePhoneCodeProviderClick?: (channel: PhoneCodeChannel) => void;
};
export declare const SignUpSocialButtons: React.MemoExoticComponent<(props: SignUpSocialButtonsProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
