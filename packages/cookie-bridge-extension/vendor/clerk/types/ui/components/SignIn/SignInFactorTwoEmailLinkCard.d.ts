import type { EmailLinkFactor } from '@clerk/shared/types';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
type SignInFactorTwoEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
    factor: EmailLinkFactor;
    factorAlreadyPrepared: boolean;
    onFactorPrepare: () => void;
};
export declare const SignInFactorTwoEmailLinkCard: (props: SignInFactorTwoEmailLinkCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
