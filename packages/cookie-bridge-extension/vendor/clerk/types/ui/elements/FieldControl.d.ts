import type { FieldId } from '@clerk/shared/types';
import type { PropsWithChildren } from 'react';
import React from 'react';
import type { LocalizationKey } from '../customizables';
import { Input } from '../customizables';
import type { ElementDescriptor, ElementId } from '../customizables/elementDescriptors';
import type { PropsOfComponent } from '../styledSystem';
import type { useFormControl as useFormControlUtil } from '../utils/useFormControl';
import type { FormFeedbackProps } from './FormControl';
type FormControlProps = Omit<PropsOfComponent<typeof Input>, 'label' | 'placeholder' | 'disabled' | 'required'> & ReturnType<typeof useFormControlUtil<FieldId>>['props'];
type CheckboxIndicatorProps = {
    elementDescriptor?: ElementDescriptor;
    elementId?: ElementId;
};
export declare const Field: {
    Root: (props: PropsWithChildren<FormControlProps>) => import("@emotion/react/jsx-runtime").JSX.Element;
    Label: (props: PropsWithChildren<{
        localizationKey?: LocalizationKey | string;
    }>) => import("@emotion/react/jsx-runtime").JSX.Element | null;
    LabelRow: (props: PropsWithChildren) => import("@emotion/react/jsx-runtime").JSX.Element;
    Input: React.ForwardRefExoticComponent<React.RefAttributes<HTMLInputElement>>;
    PasswordInput: React.ForwardRefExoticComponent<React.RefAttributes<HTMLInputElement>>;
    PhoneInput: React.ForwardRefExoticComponent<React.RefAttributes<HTMLInputElement>>;
    InputGroup: React.ForwardRefExoticComponent<{
        groupPrefix?: string;
        groupSuffix?: string;
    } & React.RefAttributes<HTMLInputElement>>;
    RadioItem: React.ForwardRefExoticComponent<{
        value: string;
        label: string | LocalizationKey;
        description?: string | LocalizationKey;
    } & React.RefAttributes<HTMLInputElement>>;
    CheckboxIndicator: React.ForwardRefExoticComponent<CheckboxIndicatorProps & React.RefAttributes<HTMLInputElement>>;
    CheckboxLabel: (props: {
        description?: string | LocalizationKey;
    }) => import("@emotion/react/jsx-runtime").JSX.Element | null;
    Action: (props: PropsWithChildren<{
        localizationKey?: LocalizationKey | string;
        onClick?: React.MouseEventHandler;
    }>) => import("@emotion/react/jsx-runtime").JSX.Element | null;
    AsOptional: () => import("@emotion/react/jsx-runtime").JSX.Element;
    LabelIcon: (props: {
        icon?: React.ComponentType;
    }) => import("@emotion/react/jsx-runtime").JSX.Element | null;
    Feedback: (props: Pick<FormFeedbackProps, "elementDescriptors" | "center">) => import("@emotion/react/jsx-runtime").JSX.Element;
    OTPRoot: ({ children, ...props }: PropsWithChildren<import("./CodeControl").OTPInputProps>) => import("@emotion/react/jsx-runtime").JSX.Element;
    OTPCodeControl: () => import("@emotion/react/jsx-runtime").JSX.Element;
    OTPResendButton: () => import("@emotion/react/jsx-runtime").JSX.Element | null;
};
export {};
