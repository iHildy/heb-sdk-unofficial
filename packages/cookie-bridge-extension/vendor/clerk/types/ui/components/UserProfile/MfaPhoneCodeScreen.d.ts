import type { PhoneNumberResource } from '@clerk/shared/types';
import React from 'react';
import type { FormProps } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '../../customizables';
export declare const MfaPhoneCodeScreen: (props: FormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type MFAVerifyPhoneProps = FormProps & {
    title: LocalizationKey;
    resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};
export declare const MFAVerifyPhone: (props: MFAVerifyPhoneProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
