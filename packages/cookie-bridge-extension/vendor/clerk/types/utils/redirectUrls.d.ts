import type { ClerkOptions, RedirectOptions } from '@clerk/shared/types';
type ComponentMode = 'modal' | 'mounted';
export declare class RedirectUrls {
    #private;
    private static keys;
    private static preserved;
    private readonly options;
    private readonly fromOptions;
    private readonly fromProps;
    private readonly fromSearchParams;
    private readonly mode?;
    constructor(options: ClerkOptions, props?: RedirectOptions, searchParams?: any, mode?: ComponentMode);
    getAfterSignInUrl(): string;
    getAfterSignUpUrl(): string;
    getPreservedSearchParams(): URLSearchParams;
    toSearchParams(): URLSearchParams;
}
export {};
