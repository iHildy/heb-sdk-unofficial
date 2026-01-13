import type { PricingTableCtx } from '../../types';
export declare const PricingTableContext: import("react").Context<PricingTableCtx | null>;
export declare const usePricingTableContext: () => {
    componentName: "PricingTable";
    for?: import("@clerk/types").ForPayerType;
    appearance?: import("@clerk/types").PricingTableTheme;
    checkoutProps?: Pick<import("@clerk/types").__internal_CheckoutProps, "appearance">;
    ctaPosition?: "top" | "bottom";
    collapseFeatures?: boolean;
    newSubscriptionRedirectUrl?: string;
    mode?: "modal" | "mounted";
    signInMode?: "modal" | "redirect";
};
