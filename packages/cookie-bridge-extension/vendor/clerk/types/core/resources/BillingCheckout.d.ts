import type { BillingCheckoutJSON, BillingCheckoutResource, BillingCheckoutTotals, BillingPayerResource, BillingPaymentMethodResource, BillingSubscriptionPlanPeriod, ConfirmCheckoutParams } from '@clerk/shared/types';
import { BaseResource, BillingPlan } from './internal';
export declare class BillingCheckout extends BaseResource implements BillingCheckoutResource {
    id: string;
    externalClientSecret: string;
    externalGatewayId: string;
    paymentMethod?: BillingPaymentMethodResource;
    plan: BillingPlan;
    planPeriod: BillingSubscriptionPlanPeriod;
    planPeriodStart: number | undefined;
    status: 'needs_confirmation' | 'completed';
    totals: BillingCheckoutTotals;
    isImmediatePlanChange: boolean;
    freeTrialEndsAt?: Date;
    payer: BillingPayerResource;
    needsPaymentMethod: boolean;
    constructor(data: BillingCheckoutJSON);
    protected fromJSON(data: BillingCheckoutJSON | null): this;
    confirm: (params: ConfirmCheckoutParams) => Promise<this>;
}
