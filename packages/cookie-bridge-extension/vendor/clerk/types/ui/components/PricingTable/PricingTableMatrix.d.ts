import type { BillingPlanResource, BillingSubscriptionPlanPeriod } from '@clerk/shared/types';
import * as React from 'react';
interface PricingTableMatrixProps {
    plans: BillingPlanResource[] | undefined;
    highlightedPlan?: BillingPlanResource['slug'];
    planPeriod: BillingSubscriptionPlanPeriod;
    setPlanPeriod: (val: BillingSubscriptionPlanPeriod) => void;
    onSelect: (plan: BillingPlanResource, event?: React.MouseEvent<HTMLElement>) => void;
}
export declare function PricingTableMatrix({ plans, planPeriod, setPlanPeriod, onSelect, highlightedPlan, }: PricingTableMatrixProps): import("@emotion/react/jsx-runtime").JSX.Element | null;
export {};
