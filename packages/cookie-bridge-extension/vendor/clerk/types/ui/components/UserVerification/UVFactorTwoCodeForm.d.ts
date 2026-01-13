import type { PhoneCodeFactor, SessionVerificationResource, TOTPFactor } from '@clerk/shared/types';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import type { LocalizationKey } from '../../localization';
export type UVFactorTwoCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
    factor: PhoneCodeFactor | TOTPFactor;
    factorAlreadyPrepared: boolean;
    onFactorPrepare: () => void;
    prepare?: () => Promise<SessionVerificationResource>;
    showAlternativeMethods?: boolean;
};
type SignInFactorTwoCodeFormProps = UVFactorTwoCodeCard & {
    cardTitle: LocalizationKey;
    cardSubtitle: LocalizationKey;
    inputLabel: LocalizationKey;
    resendButton?: LocalizationKey;
};
export declare const UVFactorTwoCodeForm: (props: SignInFactorTwoCodeFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
