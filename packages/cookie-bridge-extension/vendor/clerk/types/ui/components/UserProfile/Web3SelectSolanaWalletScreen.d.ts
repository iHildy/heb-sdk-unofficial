import type { Web3Strategy } from '@clerk/shared/types';
export type Web3SelectWalletProps = {
    onConnect: (params: {
        strategy: Web3Strategy;
        walletName: string;
    }) => Promise<void>;
};
export declare const Web3SelectSolanaWalletScreen: ({ onConnect }: Web3SelectWalletProps) => import("@emotion/react/jsx-runtime").JSX.Element;
