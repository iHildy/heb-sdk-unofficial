import type { EmailCodeFactor, PhoneCodeFactor, SignInResource, TOTPFactor } from '@clerk/shared/types';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import type { LocalizationKey } from '../../localization';
export type SignInFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
    factor: EmailCodeFactor | PhoneCodeFactor | TOTPFactor;
    factorAlreadyPrepared: boolean;
    onFactorPrepare: () => void;
    prepare?: () => Promise<SignInResource>;
};
type SignInFactorTwoCodeFormProps = SignInFactorTwoCodeCard & {
    cardTitle: LocalizationKey;
    cardSubtitle: LocalizationKey;
    inputLabel: LocalizationKey;
    resendButton?: LocalizationKey;
};
export declare const SignInFactorTwoCodeForm: (props: SignInFactorTwoCodeFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
