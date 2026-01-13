import type { EmailCodeFactor } from '@clerk/shared/types';
import type { SignInFactorTwoCodeCard } from './SignInFactorTwoCodeForm';
type SignInFactorTwoEmailCodeCardProps = SignInFactorTwoCodeCard & {
    factor: EmailCodeFactor;
};
export declare const SignInFactorTwoEmailCodeCard: (props: SignInFactorTwoEmailCodeCardProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
