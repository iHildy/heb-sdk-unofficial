import type { UseDismissProps, UseFloatingOptions, UseRoleProps } from '@floating-ui/react';
import { FloatingPortal, useFloating, useInteractions } from '@floating-ui/react';
import * as React from 'react';
import type { LocalizationKey } from '../customizables';
import { useDirection } from '../hooks';
import type { ThemableCssProp } from '../styledSystem';
type FloatingPortalProps = React.ComponentProps<typeof FloatingPortal>;
interface DrawerContext {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    strategy: UseFloatingOptions['strategy'];
    refs: ReturnType<typeof useFloating>['refs'];
    context: ReturnType<typeof useFloating>['context'];
    getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps'];
    portalProps: FloatingPortalProps;
    direction: ReturnType<typeof useDirection>;
}
declare const DrawerContext: React.Context<DrawerContext | null>;
export declare const useDrawerContext: () => DrawerContext;
interface RootProps {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /**
     * The strategy to use when positioning the floating element.
     * @default 'fixed'
     * @see https://floating-ui.com/docs/useFloating#strategy
     */
    strategy?: UseFloatingOptions['strategy'];
    /**
     * @see https://floating-ui.com/docs/useFloating
     */
    floatingProps?: Omit<UseFloatingOptions, 'open' | 'onOpenChange' | 'strategy' | 'transform'>;
    /**
     * @see https://floating-ui.com/docs/FloatingPortal
     */
    portalProps?: FloatingPortalProps;
    /**
     * @see https://floating-ui.com/docs/useDismiss
     */
    dismissProps?: UseDismissProps;
}
declare function Root({ children, open, onOpenChange, strategy, floatingProps, portalProps, dismissProps, }: RootProps): import("@emotion/react/jsx-runtime").JSX.Element;
export declare const FloatingOverlay: React.ForwardRefExoticComponent<Omit<Omit<import("../primitives").BoxProps, "ref"> & React.RefAttributes<HTMLDivElement> & {
    elementDescriptor?: import("../customizables/elementDescriptors").ElementDescriptor | Array<import("../customizables/elementDescriptors").ElementDescriptor | undefined>;
    elementId?: import("../customizables/elementDescriptors").ElementId;
    css?: never;
    sx?: ThemableCssProp;
}, "ref"> & React.RefAttributes<HTMLDivElement>>;
interface ContentProps {
    children: React.ReactNode;
}
interface HeaderProps {
    title?: string | LocalizationKey;
    children?: React.ReactNode;
    sx?: ThemableCssProp;
}
interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    sx?: ThemableCssProp;
}
interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode;
    sx?: ThemableCssProp;
}
interface ConfirmationProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
    actionsSlot: React.ReactNode;
    /**
     * @see https://floating-ui.com/docs/userole
     */
    roleProps?: UseRoleProps;
}
export declare const Drawer: {
    Root: typeof Root;
    Overlay: React.ForwardRefExoticComponent<React.RefAttributes<HTMLDivElement>>;
    Content: React.ForwardRefExoticComponent<ContentProps & React.RefAttributes<HTMLDivElement>>;
    Header: React.ForwardRefExoticComponent<HeaderProps & React.RefAttributes<HTMLDivElement>>;
    Body: React.ForwardRefExoticComponent<BodyProps & React.RefAttributes<HTMLDivElement>>;
    Footer: React.ForwardRefExoticComponent<FooterProps & React.RefAttributes<HTMLDivElement>>;
    Confirmation: React.ForwardRefExoticComponent<ConfirmationProps & React.RefAttributes<HTMLDivElement>>;
    Close: React.ForwardRefExoticComponent<React.RefAttributes<HTMLButtonElement>>;
};
export {};
