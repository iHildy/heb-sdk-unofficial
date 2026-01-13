import * as React from 'react';
import type { LocalizationKey } from '../customizables';
interface RootProps {
    children: React.ReactNode;
}
declare function Root({ children }: RootProps): import("@emotion/react/jsx-runtime").JSX.Element;
type GroupVariant = 'primary' | 'secondary' | 'tertiary';
interface GroupProps {
    children: React.ReactNode;
    /**
     * @default `false`
     */
    borderTop?: boolean;
    variant?: GroupVariant;
    expand?: boolean;
}
declare function Group({ children, borderTop, variant }: GroupProps): import("@emotion/react/jsx-runtime").JSX.Element;
interface TitleProps {
    title?: string | LocalizationKey;
    description?: string | LocalizationKey;
    icon?: React.ComponentType;
    badge?: React.ReactNode;
}
interface DescriptionProps {
    text: string | LocalizationKey;
    /**
     * When true, the text will be truncated with an ellipsis in the middle and the last 5 characters will be visible.
     * @default `false`
     */
    truncateText?: boolean;
    /**
     * When true, there will be a button to copy the providedtext.
     * @default `false`
     */
    copyText?: boolean;
    /**
     * The visually hidden label for the copy button.
     * @default `Copy`
     */
    copyLabel?: string;
    prefix?: string | LocalizationKey;
    suffix?: string | LocalizationKey;
}
declare function Description({ text, prefix, suffix, truncateText, copyText, copyLabel }: DescriptionProps): import("@emotion/react/jsx-runtime").JSX.Element;
export declare const LineItems: {
    Root: typeof Root;
    Group: typeof Group;
    Title: React.ForwardRefExoticComponent<TitleProps & React.RefAttributes<HTMLTableCellElement>>;
    Description: typeof Description;
};
export {};
