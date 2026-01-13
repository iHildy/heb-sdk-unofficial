import React from 'react';
import type { LocalizationKey } from '../customizables';
import { Button } from '../customizables';
import type { PropsOfComponent } from '../styledSystem';
type NavbarContextValue = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    contentRef?: React.RefObject<HTMLDivElement>;
};
export declare const NavbarContext: React.Context<{
    value: NavbarContextValue;
} | undefined>, useNavbarContext: () => NavbarContextValue, useUnsafeNavbarContext: () => NavbarContextValue | Partial<NavbarContextValue>;
export declare const NavbarContextProvider: ({ children, contentRef, }: React.PropsWithChildren<{
    contentRef?: React.RefObject<HTMLDivElement>;
}>) => import("@emotion/react/jsx-runtime").JSX.Element;
export type NavbarRoute = {
    name: LocalizationKey | string;
    id: string;
    icon: React.ComponentType;
    path: string;
    external?: boolean;
};
type NavBarProps = {
    title: LocalizationKey;
    description: LocalizationKey;
    contentRef: React.RefObject<HTMLDivElement>;
    routes: NavbarRoute[];
    header?: React.ReactNode;
};
export declare const NavBar: (props: NavBarProps) => import("@emotion/react/jsx-runtime").JSX.Element;
type NavbarMenuButtonRowProps = PropsOfComponent<typeof Button> & {
    navbarTitleLocalizationKey?: LocalizationKey;
};
export declare const NavbarMenuButtonRow: ({ navbarTitleLocalizationKey, ...props }: NavbarMenuButtonRowProps) => import("@emotion/react/jsx-runtime").JSX.Element | null;
export {};
