import React from 'react';
import type { LocalizationKey } from '../customizables';
interface SwitchProps {
    isChecked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    isDisabled?: boolean;
    label: string | LocalizationKey;
}
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLDivElement>>;
export {};
