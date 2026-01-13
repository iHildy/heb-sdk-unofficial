import type { AttemptWeb3WalletVerificationParams, PrepareWeb3WalletVerificationParams, VerificationResource, Web3WalletJSON, Web3WalletJSONSnapshot, Web3WalletResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
export declare class Web3Wallet extends BaseResource implements Web3WalletResource {
    id: string;
    web3Wallet: string;
    verification: VerificationResource;
    constructor(data: Partial<Web3WalletJSON | Web3WalletJSONSnapshot>, pathRoot: string);
    create(): Promise<this>;
    prepareVerification: (params: PrepareWeb3WalletVerificationParams) => Promise<this>;
    attemptVerification: (params: AttemptWeb3WalletVerificationParams) => Promise<this>;
    destroy(): Promise<void>;
    toString(): string;
    protected fromJSON(data: Web3WalletJSON | Web3WalletJSONSnapshot | null): this;
    __internal_toSnapshot(): Web3WalletJSONSnapshot;
}
