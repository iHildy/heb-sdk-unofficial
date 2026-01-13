import type { ClerkAPIError, ClerkRuntimeError as ClerkRuntimeErrorType } from '@clerk/shared/types';
type Web3CallbackErrorHandler = {
    (err: any, setError?: (err: ClerkRuntimeErrorType | ClerkAPIError | string | undefined) => void): void;
};
export declare const web3CallbackErrorHandler: Web3CallbackErrorHandler;
export {};
