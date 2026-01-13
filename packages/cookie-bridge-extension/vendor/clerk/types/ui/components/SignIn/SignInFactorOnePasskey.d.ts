import type { ResetPasswordCodeFactor } from '@clerk/shared/types';
import React from 'react';
type SignInFactorOnePasswordProps = {
    onShowAlternativeMethodsClick: React.MouseEventHandler | undefined;
    onFactorPrepare: (f: ResetPasswordCodeFactor) => void;
};
export declare const SignInFactorOnePasskey: (props: SignInFactorOnePasswordProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
