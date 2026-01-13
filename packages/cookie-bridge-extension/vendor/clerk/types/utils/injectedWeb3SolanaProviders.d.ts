import type { SolanaWalletAdapterWallet } from '@solana/wallet-standard';
declare class InjectedWeb3SolanaProviders {
    #private;
    private constructor();
    static getInstance(): InjectedWeb3SolanaProviders;
    get: (walletName: string) => Promise<SolanaWalletAdapterWallet | undefined>;
}
export declare const getInjectedWeb3SolanaProviders: () => InjectedWeb3SolanaProviders;
export {};
