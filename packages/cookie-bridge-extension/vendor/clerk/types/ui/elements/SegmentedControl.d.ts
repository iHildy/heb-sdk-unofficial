import React from 'react';
import type { LocalizationKey } from '../customizables';
import type { ThemableCssProp } from '../styledSystem';
type SegmentedControlSize = 'md' | 'lg';
interface RootProps {
    children: React.ReactNode;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    size?: SegmentedControlSize;
    fullWidth?: boolean;
    sx?: ThemableCssProp;
}
interface ButtonProps {
    text: string | LocalizationKey;
    value: string;
}
export declare const SegmentedControl: {
    Root: React.ForwardRefExoticComponent<RootProps & React.RefAttributes<HTMLDivElement>>;
    Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
};
export {};
