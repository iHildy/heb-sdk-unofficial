import type { TOTPFactor } from '@clerk/shared/types';
import type { UVFactorTwoCodeCard } from './UVFactorTwoCodeForm';
type UVFactorTwoTOTPCardProps = UVFactorTwoCodeCard & {
    factor: TOTPFactor;
};
export declare function UserVerificationFactorTwoTOTP(props: UVFactorTwoTOTPCardProps): JSX.Element;
export {};
