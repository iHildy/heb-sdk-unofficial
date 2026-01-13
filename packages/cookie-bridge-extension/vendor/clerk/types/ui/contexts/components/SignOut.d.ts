export type SignOutContextType = {
    navigateAfterSignOut: () => any;
    navigateAfterMultiSessionSingleSignOutUrl: () => any;
    afterSignOutUrl: string;
    afterMultiSessionSingleSignOutUrl: string;
};
export declare const useSignOutContext: () => SignOutContextType;
