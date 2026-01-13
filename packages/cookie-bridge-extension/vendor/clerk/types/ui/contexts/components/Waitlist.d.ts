import type { WaitlistCtx } from '../../types';
export type WaitlistContextType = WaitlistCtx & {
    signInUrl: string;
    afterJoinWaitlistUrl?: string;
    initialValues: any;
};
export declare const WaitlistContext: import("react").Context<WaitlistCtx | null>;
export declare const useWaitlistContext: () => WaitlistContextType;
