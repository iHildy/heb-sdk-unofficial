import type { PhoneCodeFactor } from '@clerk/shared/types';
import type { SignInFactorOneCodeCard } from './SignInFactorOneCodeForm';
type SignInFactorOnePhoneCodeCardProps = SignInFactorOneCodeCard & {
    factor: PhoneCodeFactor;
};
export declare const SignInFactorOnePhoneCodeCard: (props: SignInFactorOnePhoneCodeCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
