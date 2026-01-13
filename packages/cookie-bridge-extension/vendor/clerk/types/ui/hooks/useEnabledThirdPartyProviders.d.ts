import type { OAuthProvider, OAuthStrategy, PhoneCodeChannel, PhoneCodeProvider, Web3Provider, Web3Strategy } from '@clerk/shared/types';
type ThirdPartyStrategyToDataMap = {
    [k in Web3Strategy | OAuthStrategy | PhoneCodeChannel]: {
        id: Web3Provider | OAuthProvider | PhoneCodeProvider;
        iconUrl: string;
        name: string;
    };
};
type ThirdPartyProviderToDataMap = {
    [k in Web3Provider | OAuthProvider | PhoneCodeProvider]: {
        strategy: Web3Strategy | OAuthStrategy | PhoneCodeChannel;
        iconUrl: string;
        name: string;
    };
};
export declare const useEnabledThirdPartyProviders: () => {
    strategies: (PhoneCodeChannel | OAuthStrategy | "web3_metamask_signature" | "web3_base_signature" | "web3_coinbase_wallet_signature" | "web3_okx_wallet_signature" | "web3_solana_signature")[];
    web3Strategies: ("web3_metamask_signature" | "web3_base_signature" | "web3_coinbase_wallet_signature" | "web3_okx_wallet_signature" | "web3_solana_signature")[];
    alternativePhoneCodeChannels: PhoneCodeChannel[];
    authenticatableOauthStrategies: OAuthStrategy[];
    strategyToDisplayData: ThirdPartyStrategyToDataMap;
    providerToDisplayData: ThirdPartyProviderToDataMap;
};
export {};
