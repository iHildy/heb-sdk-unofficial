import type { TOTPResource } from '@clerk/shared/types';
import React from 'react';
import type { FormProps } from '@/ui/elements/FormContainer';
type VerifyTOTPProps = FormProps & {
    resourceRef: React.MutableRefObject<TOTPResource | undefined>;
};
export declare const VerifyTOTP: (props: VerifyTOTPProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
