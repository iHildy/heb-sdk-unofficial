import type { SignUpResource } from '@clerk/shared/types';
import React from 'react';
import type { LocalizationKey } from '../../customizables';
type SignInFactorOneCodeFormProps = {
    cardTitle: LocalizationKey;
    cardSubtitle: LocalizationKey;
    inputLabel?: LocalizationKey;
    resendButton: LocalizationKey;
    prepare: () => Promise<SignUpResource | void> | undefined;
    attempt: (code: string) => Promise<SignUpResource>;
    safeIdentifier?: string | undefined | null;
    alternativeMethodsLabel?: LocalizationKey;
    onShowAlternativeMethodsClicked?: React.MouseEventHandler;
    showAlternativeMethods?: boolean;
};
export declare const SignUpVerificationCodeForm: (props: SignInFactorOneCodeFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
