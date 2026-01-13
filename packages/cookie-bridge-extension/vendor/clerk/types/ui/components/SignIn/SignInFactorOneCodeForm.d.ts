import type { EmailCodeFactor, PhoneCodeFactor, ResetPasswordCodeFactor } from '@clerk/shared/types';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { type LocalizationKey } from '../../localization';
export type SignInFactorOneCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'> & {
    factor: EmailCodeFactor | PhoneCodeFactor | ResetPasswordCodeFactor;
    factorAlreadyPrepared: boolean;
    onFactorPrepare: () => void;
};
export type SignInFactorOneCodeFormProps = SignInFactorOneCodeCard & {
    cardTitle: LocalizationKey;
    cardSubtitle: LocalizationKey;
    inputLabel: LocalizationKey;
    resendButton: LocalizationKey;
};
export declare const SignInFactorOneCodeForm: (props: SignInFactorOneCodeFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
