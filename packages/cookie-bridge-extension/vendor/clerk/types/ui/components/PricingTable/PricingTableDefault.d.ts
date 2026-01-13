import type { BillingPlanResource, BillingSubscriptionPlanPeriod, PricingTableProps } from '@clerk/shared/types';
interface PricingTableDefaultProps {
    plans?: BillingPlanResource[] | null;
    highlightedPlan?: BillingPlanResource['slug'];
    planPeriod: BillingSubscriptionPlanPeriod;
    setPlanPeriod: (val: BillingSubscriptionPlanPeriod) => void;
    onSelect: (plan: BillingPlanResource) => void;
    isCompact?: boolean;
    props: PricingTableProps;
}
export declare function PricingTableDefault({ plans, planPeriod, setPlanPeriod, onSelect, isCompact, props, }: PricingTableDefaultProps): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
