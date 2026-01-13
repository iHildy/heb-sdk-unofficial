import type { GenerateSignature, Web3Provider } from '@clerk/shared/types';
type GetWeb3IdentifierParams = {
    provider: Web3Provider;
    walletName?: string;
};
export declare function getWeb3Identifier(params: GetWeb3IdentifierParams): Promise<string>;
export declare const generateWeb3Signature: GenerateSignature;
export declare function getMetamaskIdentifier(): Promise<string>;
export declare function getCoinbaseWalletIdentifier(): Promise<string>;
export declare function getOKXWalletIdentifier(): Promise<string>;
export declare function getBaseIdentifier(): Promise<string>;
export declare function getSolanaIdentifier(walletName: string): Promise<string>;
type GenerateSignatureParams = {
    identifier: string;
    nonce: string;
};
type GenerateSolanaSignatureParams = GenerateSignatureParams & {
    walletName: string;
};
export declare function generateSignatureWithMetamask(params: GenerateSignatureParams): Promise<string>;
export declare function generateSignatureWithCoinbaseWallet(params: GenerateSignatureParams): Promise<string>;
export declare function generateSignatureWithOKXWallet(params: GenerateSignatureParams): Promise<string>;
export declare function generateSignatureWithBase(params: GenerateSignatureParams): Promise<string>;
export declare function generateSignatureWithSolana(params: GenerateSolanaSignatureParams): Promise<string>;
export {};
