import type { PhoneCodeFactor, SignInFactor } from '@clerk/shared/types';
import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { type LocalizationKey } from '../../localization';
export type SignInFactorOneAlternativeChannelCodeCard = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked' | 'showAlternativeMethods' | 'onBackLinkClicked'> & {
    factor: PhoneCodeFactor;
    factorAlreadyPrepared: boolean;
    onFactorPrepare: () => void;
    onChangePhoneCodeChannel: (factor: SignInFactor) => void;
};
export type SignInFactorOneAlternativeChannelCodeFormProps = SignInFactorOneAlternativeChannelCodeCard & {
    cardTitle: LocalizationKey;
    cardSubtitle: LocalizationKey;
    inputLabel: LocalizationKey;
    resendButton: LocalizationKey;
};
export declare const SignInFactorOneAlternativeChannelCodeForm: (props: SignInFactorOneAlternativeChannelCodeFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
