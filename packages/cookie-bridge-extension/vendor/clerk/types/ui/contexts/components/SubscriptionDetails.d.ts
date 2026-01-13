import type { SubscriptionDetailsCtx } from '@/ui/types';
export declare const SubscriptionDetailsContext: import("react").Context<SubscriptionDetailsCtx | null>;
export declare const useSubscriptionDetailsContext: () => {
    componentName: "SubscriptionDetails";
    for?: import("@clerk/types").ForPayerType;
    appearance?: import("@clerk/types").SubscriptionDetailsTheme;
    onSubscriptionCancel?: () => void;
    portalId?: string;
    portalRoot?: HTMLElement | null | undefined;
};
