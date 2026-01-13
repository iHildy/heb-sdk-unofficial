import type { EmailCodeFactor, PhoneCodeFactor } from '@clerk/shared/types';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import type { LocalizationKey } from '../../localization';
export type UVFactorOneCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'> & {
    factor: EmailCodeFactor | PhoneCodeFactor;
    factorAlreadyPrepared: boolean;
    onFactorPrepare: () => void;
};
export type UVFactorOneCodeFormProps = UVFactorOneCodeCard & {
    cardTitle: LocalizationKey;
    cardSubtitle: LocalizationKey;
    inputLabel: LocalizationKey;
    resendButton: LocalizationKey;
};
export declare const UVFactorOneCodeForm: (props: UVFactorOneCodeFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
