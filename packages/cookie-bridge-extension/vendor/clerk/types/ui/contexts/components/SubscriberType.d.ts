import type { ForPayerType } from '@clerk/shared/types';
export declare const SubscriberTypeContext: import("react").Context<ForPayerType | undefined>;
export declare const useSubscriberTypeContext: () => ForPayerType;
export declare const useSubscriberTypeLocalizationRoot: () => "organizationProfile" | "userProfile";
