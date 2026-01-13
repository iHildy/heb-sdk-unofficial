type RevokeAPIKeyConfirmationModalProps = {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    apiKeyID?: string;
    apiKeyName: string;
    onRevokeSuccess?: () => void;
    modalRoot?: React.MutableRefObject<HTMLElement | null>;
};
export declare const RevokeAPIKeyConfirmationModal: ({ isOpen, onOpen, onClose, apiKeyID, apiKeyName, onRevokeSuccess, modalRoot, }: RevokeAPIKeyConfirmationModalProps) => import("@emotion/react/jsx-runtime").JSX.Element | null;
export {};
