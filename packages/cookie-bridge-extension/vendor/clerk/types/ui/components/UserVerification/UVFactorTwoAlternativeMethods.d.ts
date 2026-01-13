import type { SessionVerificationSecondFactor } from '@clerk/shared/types';
import React from 'react';
import type { LocalizationKey } from '../../customizables';
export type AlternativeMethodsProps = {
    onBackLinkClick: React.MouseEventHandler | undefined;
    onFactorSelected: (factor: SessionVerificationSecondFactor) => void;
    supportedSecondFactors: SessionVerificationSecondFactor[] | null;
};
export declare const UVFactorTwoAlternativeMethods: (props: AlternativeMethodsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare function getButtonLabel(factor: SessionVerificationSecondFactor): LocalizationKey;
