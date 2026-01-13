import React from 'react';
import { Modal } from '@/ui/elements/Modal';
type APIKeyModalProps = React.ComponentProps<typeof Modal> & {
    modalRoot?: React.MutableRefObject<HTMLElement | null>;
};
export declare const APIKeyModal: ({ modalRoot, containerSx, ...modalProps }: APIKeyModalProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
