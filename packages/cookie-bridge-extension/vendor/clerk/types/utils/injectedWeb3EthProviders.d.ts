import type { MetamaskWeb3Provider, OKXWalletWeb3Provider } from '@clerk/shared/types';
type InjectedWeb3EthProvider = MetamaskWeb3Provider | OKXWalletWeb3Provider;
declare class InjectedWeb3EthProviders {
    #private;
    private constructor();
    static getInstance(): InjectedWeb3EthProviders;
    get: (provider: InjectedWeb3EthProvider) => any;
}
export declare const getInjectedWeb3EthProviders: () => InjectedWeb3EthProviders;
export {};
