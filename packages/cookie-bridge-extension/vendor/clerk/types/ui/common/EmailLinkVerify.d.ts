import type { LocalizationKey } from '../localization';
import type { EmailLinkUIStatus } from './EmailLinkStatusCard';
export type EmailLinkVerifyProps = {
    redirectUrlComplete?: string;
    redirectUrl?: string;
    verifyEmailPath?: string;
    verifyPhonePath?: string;
    continuePath?: string;
    texts: Record<EmailLinkUIStatus, {
        title: LocalizationKey;
        subtitle: LocalizationKey;
    }>;
};
export declare const EmailLinkVerify: (props: EmailLinkVerifyProps) => import("@emotion/react/jsx-runtime").JSX.Element;
