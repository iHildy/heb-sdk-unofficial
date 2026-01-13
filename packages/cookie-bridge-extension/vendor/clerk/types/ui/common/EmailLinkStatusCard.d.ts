import React from 'react';
import type { VerifyTokenStatus } from '../../utils/getClerkQueryParam';
import type { LocalizationKey } from '../customizables';
export type EmailLinkUIStatus = VerifyTokenStatus | 'verified_switch_tab' | 'loading';
type EmailLinkStatusCardProps = React.PropsWithChildren<{
    title: LocalizationKey;
    subtitle: LocalizationKey;
    status: EmailLinkUIStatus;
}>;
export declare const EmailLinkStatusCard: (props: EmailLinkStatusCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
