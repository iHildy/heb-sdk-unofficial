import type { BillingPlanResource, BillingSubscriptionItemResource, BillingSubscriptionPlanPeriod } from '@clerk/shared/types';
type UsePricingFooterStateParams = {
    subscription: BillingSubscriptionItemResource | undefined;
    plan: BillingPlanResource;
    planPeriod: BillingSubscriptionPlanPeriod;
    for?: 'user' | 'organization';
    hasActiveOrganization: boolean;
};
export declare const getPricingFooterState: (params: UsePricingFooterStateParams) => {
    shouldShowFooter: boolean;
    shouldShowFooterNotice: boolean;
};
export {};
