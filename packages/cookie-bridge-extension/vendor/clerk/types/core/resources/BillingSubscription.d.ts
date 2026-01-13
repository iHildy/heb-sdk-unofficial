import type { BillingMoneyAmount, BillingSubscriptionItemJSON, BillingSubscriptionItemResource, BillingSubscriptionJSON, BillingSubscriptionPlanPeriod, BillingSubscriptionResource, BillingSubscriptionStatus, CancelSubscriptionParams } from '@clerk/shared/types';
import { BaseResource, BillingPlan, DeletedObject } from './internal';
export declare class BillingSubscription extends BaseResource implements BillingSubscriptionResource {
    id: string;
    status: Extract<BillingSubscriptionStatus, 'active' | 'past_due'>;
    activeAt: Date;
    createdAt: Date;
    pastDueAt: Date | null;
    updatedAt: Date | null;
    nextPayment?: {
        amount: BillingMoneyAmount;
        date: Date;
    };
    subscriptionItems: BillingSubscriptionItemResource[];
    eligibleForFreeTrial: boolean;
    constructor(data: BillingSubscriptionJSON);
    protected fromJSON(data: BillingSubscriptionJSON | null): this;
}
export declare class BillingSubscriptionItem extends BaseResource implements BillingSubscriptionItemResource {
    id: string;
    plan: BillingPlan;
    planPeriod: BillingSubscriptionPlanPeriod;
    status: BillingSubscriptionStatus;
    createdAt: Date;
    periodStart: Date;
    periodEnd: Date | null;
    canceledAt: Date | null;
    pastDueAt: Date | null;
    amount?: BillingMoneyAmount;
    credit?: {
        amount: BillingMoneyAmount;
    };
    isFreeTrial: boolean;
    constructor(data: BillingSubscriptionItemJSON);
    protected fromJSON(data: BillingSubscriptionItemJSON | null): this;
    cancel(params: CancelSubscriptionParams): Promise<DeletedObject>;
}
