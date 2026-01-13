import type { PhoneCodeFactor } from '@clerk/shared/types';
import type { SignInFactorOneAlternativeChannelCodeCard } from './SignInFactorOneAlternativeChannelCodeForm';
type SignInFactorOneAlternativePhoneCodeCardProps = SignInFactorOneAlternativeChannelCodeCard & {
    factor: PhoneCodeFactor;
};
export declare const SignInFactorOneAlternativePhoneCodeCard: (props: SignInFactorOneAlternativePhoneCodeCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
