import React from 'react';
export type PasswordErrorCode = 'compromised' | 'pwned';
type SignInFactorOnePasswordProps = {
    onForgotPasswordMethodClick: React.MouseEventHandler | undefined;
    onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
    onPasswordError?: (errorCode: PasswordErrorCode) => void;
};
export declare const SignInFactorOnePasswordCard: (props: SignInFactorOnePasswordProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
