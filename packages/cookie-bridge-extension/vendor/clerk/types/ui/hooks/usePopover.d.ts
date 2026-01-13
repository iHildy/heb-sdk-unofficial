import type { UseFloatingOptions } from '@floating-ui/react';
import { offset } from '@floating-ui/react';
import React from 'react';
type UsePopoverProps = {
    defaultOpen?: boolean;
    placement?: UseFloatingOptions['placement'];
    offset?: Parameters<typeof offset>[0];
    shoudFlip?: boolean;
    autoUpdate?: boolean;
    outsidePress?: boolean | ((event: MouseEvent) => boolean);
    adjustToReferenceWidth?: boolean;
    referenceElement?: React.RefObject<HTMLElement> | null;
    canCloseModal?: boolean;
    bubbles?: boolean | {
        escapeKey?: boolean;
        outsidePress?: boolean;
    };
};
export type UsePopoverReturn = ReturnType<typeof usePopover>;
export declare const usePopover: (props?: UsePopoverProps) => {
    reference: ((node: import("@floating-ui/react-dom").ReferenceType | null) => void) & ((node: import("@floating-ui/react").ReferenceType | null) => void);
    floating: ((node: HTMLElement | null) => void) & ((node: HTMLElement | null) => void);
    toggle: () => void;
    open: () => void;
    nodeId: string | undefined;
    close: () => void;
    isOpen: boolean;
    styles: {
        position: import("@floating-ui/react-dom").Strategy;
        top: number;
        left: number;
    };
    context: {
        x: number;
        strategy: import("@floating-ui/react-dom").Strategy;
        y: number;
        placement: import("@floating-ui/react-dom").Placement;
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
};
export {};
