import type { FieldId } from '@clerk/shared/types';
import React from 'react';
import type { useFormControl as useFormControlUtil } from '../../utils/useFormControl';
import { useFormControlFeedback } from '../../utils/useFormControl';
type FormFieldProviderProps = ReturnType<typeof useFormControlUtil<FieldId>>['props'] & {
    isDisabled: boolean;
};
type FormFieldContextValue = Omit<FormFieldProviderProps, 'id'> & {
    feedbackMessageId?: string;
    id?: string;
    fieldId?: FieldId;
    hasError: boolean;
    debouncedFeedback: ReturnType<typeof useFormControlFeedback>['debounced'];
};
/**
 * Extract the context hook without the guarantee in order to avoid throwing errors if our field/form primitives are not wrapped inside a Field.Root component.
 * In case our primitives need to always be wrapped with Field.Root, consider updating the following line to [FormFieldContext, useFormField]
 */
export declare const FormFieldContext: React.Context<{
    value: FormFieldContextValue;
} | undefined>, useFormField: () => FormFieldContextValue | Partial<FormFieldContextValue>;
export declare const FormFieldContextProvider: (props: React.PropsWithChildren<FormFieldProviderProps>) => import("@emotion/react/jsx-runtime").JSX.Element;
/**
 * Each of our Form primitives depend on different custom props
 * This utility filters out any props that will litter the DOM, but allows for exceptions when the `keep` param is used.
 * This allows for maintainers to opt-in and only allow for specific props to be passed for each primitive.
 */
export declare const sanitizeInputProps: (obj: ReturnType<typeof useFormField>, keep?: (keyof ReturnType<typeof useFormField>)[]) => {
    name: FieldId;
    value: string;
    options?: {
        value: string;
        label?: string;
    }[] | undefined;
    isDisabled: boolean;
    isRequired?: boolean | undefined;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: (string | import("../../localization").LocalizationKey) | undefined;
    buildErrorMessage?: ((err: import("@clerk/types").ClerkAPIError[]) => import("@clerk/types").ClerkAPIError | string | undefined) | ((err: import("@clerk/types").ClerkAPIError[]) => import("@clerk/types").ClerkAPIError | string | undefined) | undefined;
    type?: "number" | "button" | "checkbox" | "radio" | "password" | "reset" | "submit" | "search" | "hidden" | "url" | "time" | "color" | (string & {}) | "image" | "text" | "month" | "date" | "datetime-local" | "email" | "file" | "range" | "tel" | "week" | undefined;
    checked?: boolean | undefined;
    onBlur: React.FocusEventHandler<HTMLInputElement>;
    onFocus: React.FocusEventHandler<HTMLInputElement>;
    id?: string;
    hasError: boolean;
} | {
    name?: FieldId | undefined;
    value?: string | undefined;
    options?: {
        value: string;
        label?: string;
    }[] | undefined;
    isDisabled?: boolean | undefined;
    isRequired?: boolean | undefined;
    onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
    placeholder?: (string | import("../../localization").LocalizationKey) | undefined;
    buildErrorMessage?: ((err: import("@clerk/types").ClerkAPIError[]) => import("@clerk/types").ClerkAPIError | string | undefined) | ((err: import("@clerk/types").ClerkAPIError[]) => import("@clerk/types").ClerkAPIError | string | undefined) | undefined;
    type?: "number" | "button" | "checkbox" | "radio" | "password" | "reset" | "submit" | "search" | "hidden" | "url" | "time" | "color" | (string & {}) | "image" | "text" | "month" | "date" | "datetime-local" | "email" | "file" | "range" | "tel" | "week" | undefined;
    checked?: boolean | undefined;
    onBlur?: React.FocusEventHandler<HTMLInputElement> | undefined;
    onFocus?: React.FocusEventHandler<HTMLInputElement> | undefined;
    id?: string | undefined;
    hasError?: boolean | undefined;
};
export {};
