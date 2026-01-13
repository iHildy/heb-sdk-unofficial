type CopyAPIKeyModalProps = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    apiKeyName: string;
    apiKeySecret: string;
    modalRoot?: React.MutableRefObject<HTMLElement | null>;
};
export declare const CopyAPIKeyModal: ({ isOpen, onOpen, onClose, apiKeyName, apiKeySecret, modalRoot, }: CopyAPIKeyModalProps) => import("@emotion/react/jsx-runtime").JSX.Element | null;
export {};
