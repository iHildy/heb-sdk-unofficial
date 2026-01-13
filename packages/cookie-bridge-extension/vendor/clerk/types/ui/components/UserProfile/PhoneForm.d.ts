import type { PhoneNumberResource } from '@clerk/shared/types';
import React from 'react';
import type { FormProps } from '@/ui/elements/FormContainer';
import type { LocalizationKey } from '../../customizables';
type PhoneFormProps = FormProps & {
    phoneId?: string;
};
export declare const PhoneForm: (props: PhoneFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type AddPhoneProps = FormProps & {
    title: LocalizationKey;
    resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
    onUseExistingNumberClick?: React.MouseEventHandler;
};
export declare const AddPhone: (props: AddPhoneProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type VerifyPhoneProps = FormProps & {
    title: LocalizationKey;
    resourceRef: React.MutableRefObject<PhoneNumberResource | undefined>;
};
export declare const VerifyPhone: (props: VerifyPhoneProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
