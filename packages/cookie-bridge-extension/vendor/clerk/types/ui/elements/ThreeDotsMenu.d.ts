import type { MenuId } from '@clerk/shared/types';
import type { LocalizationKey } from '../customizables';
type Action = {
    label: LocalizationKey;
    isDestructive?: boolean;
    onClick: () => unknown;
    isDisabled?: boolean;
};
type ThreeDotsMenuProps = {
    variant?: 'bordered';
    actions: Action[];
    elementId?: MenuId;
};
export declare const ThreeDotsMenu: (props: ThreeDotsMenuProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
