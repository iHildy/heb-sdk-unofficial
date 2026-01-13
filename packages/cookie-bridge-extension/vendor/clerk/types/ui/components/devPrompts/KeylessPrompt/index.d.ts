type KeylessPromptProps = {
    claimUrl: string;
    copyKeysUrl: string;
    onDismiss: (() => Promise<unknown>) | undefined | null;
};
export declare const KeylessPrompt: (props: KeylessPromptProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
