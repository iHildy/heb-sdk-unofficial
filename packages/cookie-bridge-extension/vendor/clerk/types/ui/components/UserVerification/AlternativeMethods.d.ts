import type { SessionVerificationFirstFactor, SignInFactor } from '@clerk/shared/types';
import React from 'react';
import type { LocalizationKey } from '../../customizables';
export type AlternativeMethodsProps = {
    onBackLinkClick: React.MouseEventHandler | undefined;
    onFactorSelected: (factor: SignInFactor) => void;
    currentFactor: SignInFactor | undefined | null;
};
export type AlternativeMethodListProps = AlternativeMethodsProps & {
    onHavingTroubleClick: React.MouseEventHandler;
};
export declare const AlternativeMethods: (props: AlternativeMethodsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare function getButtonLabel(factor: SessionVerificationFirstFactor): LocalizationKey;
export declare function getButtonIcon(factor: SessionVerificationFirstFactor): React.FC<React.SVGAttributes<SVGElement>>;
