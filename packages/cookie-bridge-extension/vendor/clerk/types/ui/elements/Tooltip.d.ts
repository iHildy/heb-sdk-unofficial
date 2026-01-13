import type { Placement } from '@floating-ui/react';
import * as React from 'react';
import { type LocalizationKey } from '../customizables';
import type { ThemableCssProp } from '../styledSystem';
interface TooltipOptions {
    initialOpen?: boolean;
    placement?: Placement;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}
export declare function useTooltip({ initialOpen, placement, open: controlledOpen, onOpenChange: setControlledOpen, }?: TooltipOptions): {
    transitionStyles: React.CSSProperties;
    placement: Placement;
    strategy: import("@floating-ui/react-dom").Strategy;
    middlewareData: import("@floating-ui/react-dom").MiddlewareData;
    x: number;
    y: number;
    isPositioned: boolean;
    update: () => void;
    floatingStyles: React.CSSProperties;
    refs: {
        reference: React.MutableRefObject<import("@floating-ui/react-dom").ReferenceType | null>;
        floating: React.MutableRefObject<HTMLElement | null>;
        setReference: (node: import("@floating-ui/react-dom").ReferenceType | null) => void;
        setFloating: (node: HTMLElement | null) => void;
    } & import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
    elements: {
        reference: import("@floating-ui/react-dom").ReferenceType | null;
        floating: HTMLElement | null;
    } & import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
    context: {
        x: number;
        strategy: import("@floating-ui/react-dom").Strategy;
        y: number;
        placement: Placement;
        middlewareData: import("@floating-ui/react-dom").MiddlewareData;
        isPositioned: boolean;
        update: () => void;
        floatingStyles: React.CSSProperties;
        open: boolean;
        onOpenChange: (open: boolean, event?: Event, reason?: import("@floating-ui/react").OpenChangeReason) => void;
        events: import("@floating-ui/react").FloatingEvents;
        dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
        nodeId: string | undefined;
        floatingId: string | undefined;
        refs: import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
        elements: import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
    };
    getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
    getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
    getItemProps: (userProps?: Omit<React.HTMLProps<HTMLElement>, "selected" | "active"> & {
        active?: boolean;
        selected?: boolean;
    }) => Record<string, unknown>;
    open: boolean;
    setOpen: (open: boolean) => void;
    isMounted: boolean;
};
export declare const useTooltipContext: () => {
    transitionStyles: React.CSSProperties;
    placement: Placement;
    strategy: import("@floating-ui/react-dom").Strategy;
    middlewareData: import("@floating-ui/react-dom").MiddlewareData;
    x: number;
    y: number;
    isPositioned: boolean;
    update: () => void;
    floatingStyles: React.CSSProperties;
    refs: {
        reference: React.MutableRefObject<import("@floating-ui/react-dom").ReferenceType | null>;
        floating: React.MutableRefObject<HTMLElement | null>;
        setReference: (node: import("@floating-ui/react-dom").ReferenceType | null) => void;
        setFloating: (node: HTMLElement | null) => void;
    } & import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
    elements: {
        reference: import("@floating-ui/react-dom").ReferenceType | null;
        floating: HTMLElement | null;
    } & import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
    context: {
        x: number;
        strategy: import("@floating-ui/react-dom").Strategy;
        y: number;
        placement: Placement;
        middlewareData: import("@floating-ui/react-dom").MiddlewareData;
        isPositioned: boolean;
        update: () => void;
        floatingStyles: React.CSSProperties;
        open: boolean;
        onOpenChange: (open: boolean, event?: Event, reason?: import("@floating-ui/react").OpenChangeReason) => void;
        events: import("@floating-ui/react").FloatingEvents;
        dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
        nodeId: string | undefined;
        floatingId: string | undefined;
        refs: import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
        elements: import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
    };
    getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
    getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
    getItemProps: (userProps?: Omit<React.HTMLProps<HTMLElement>, "selected" | "active"> & {
        active?: boolean;
        selected?: boolean;
    }) => Record<string, unknown>;
    open: boolean;
    setOpen: (open: boolean) => void;
    isMounted: boolean;
};
declare function Root({ children, ...options }: {
    children: React.ReactNode;
} & TooltipOptions): import("@emotion/react/jsx-runtime").JSX.Element;
type TriggerProps = React.HTMLProps<HTMLElement> & {
    sx?: ThemableCssProp;
};
export declare const Tooltip: {
    Root: typeof Root;
    Trigger: React.ForwardRefExoticComponent<Omit<TriggerProps, "ref"> & React.RefAttributes<HTMLElement>>;
    Content: React.ForwardRefExoticComponent<Omit<React.HTMLProps<HTMLDivElement> & {
        text: string | LocalizationKey;
        sx?: ThemableCssProp;
    }, "ref"> & React.RefAttributes<HTMLDivElement>>;
};
export {};
