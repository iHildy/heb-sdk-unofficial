import React from 'react';
import type { ThemableCssProp } from '../styledSystem';
export declare const ModalContext: React.Context<{
    value: {
        toggle?: () => void;
    };
} | undefined>, _: () => {
    toggle?: () => void;
}, useUnsafeModalContext: () => {
    toggle?: () => void;
} | Partial<{
    toggle?: () => void;
}>;
type ModalProps = React.PropsWithChildren<{
    id?: string;
    handleOpen?: () => void;
    handleClose?: () => void;
    contentSx?: ThemableCssProp;
    containerSx?: ThemableCssProp;
    canCloseModal?: boolean;
    style?: React.CSSProperties;
    portalRoot?: HTMLElement | React.MutableRefObject<HTMLElement | null>;
    initialFocusRef?: number | React.MutableRefObject<HTMLElement | null>;
}>;
export declare const Modal: React.ComponentType<ModalProps>;
export {};
