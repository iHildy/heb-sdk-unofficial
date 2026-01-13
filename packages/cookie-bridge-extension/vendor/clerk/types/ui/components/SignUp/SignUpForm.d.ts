import React from 'react';
import type { FormControlState } from '@/ui/utils/useFormControl';
import type { ActiveIdentifier, Fields } from './signUpFormHelpers';
type SignUpFormProps = {
    handleSubmit: React.FormEventHandler;
    fields: Fields;
    formState: Record<Exclude<keyof Fields, 'ticket'>, FormControlState<any>>;
    canToggleEmailPhone: boolean;
    handleEmailPhoneToggle: (type: ActiveIdentifier) => void;
    onlyLegalAcceptedMissing?: boolean;
};
export declare const SignUpForm: (props: SignUpFormProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
