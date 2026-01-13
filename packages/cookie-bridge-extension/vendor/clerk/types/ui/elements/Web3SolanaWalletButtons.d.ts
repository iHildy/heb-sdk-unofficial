type Web3WalletButtonsProps = {
    web3AuthCallback: ({ walletName }: {
        walletName: string;
    }) => Promise<unknown>;
};
export declare const Web3SolanaWalletButtons: (props: Web3WalletButtonsProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
