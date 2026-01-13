import type { EmailLinkFactor } from '@clerk/shared/types';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
type SignInFactorOneEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
    factor: EmailLinkFactor;
    factorAlreadyPrepared: boolean;
    onFactorPrepare: () => void;
};
export declare const SignInFactorOneEmailLinkCard: (props: SignInFactorOneEmailLinkCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
