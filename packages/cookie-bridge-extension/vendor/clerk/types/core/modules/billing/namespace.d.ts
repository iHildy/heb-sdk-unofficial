import type { BillingNamespace, BillingPaymentResource, BillingPlanResource, BillingStatementResource, BillingSubscriptionResource, ClerkPaginatedResponse, CreateCheckoutParams, GetPaymentAttemptsParams, GetPlansParams, GetStatementsParams, GetSubscriptionParams } from '@clerk/shared/types';
import { BillingCheckout } from '../../resources/internal';
export declare class Billing implements BillingNamespace {
    #private;
    static path(subPath: string, param?: {
        orgId?: string | null;
    }): string;
    getPlans: (params?: GetPlansParams) => Promise<ClerkPaginatedResponse<BillingPlanResource>>;
    getPlan: (params: {
        id: string;
    }) => Promise<BillingPlanResource>;
    getSubscription: (params: GetSubscriptionParams) => Promise<BillingSubscriptionResource>;
    getStatements: (params: GetStatementsParams) => Promise<ClerkPaginatedResponse<BillingStatementResource>>;
    getStatement: (params: {
        id: string;
        orgId?: string;
    }) => Promise<BillingStatementResource>;
    getPaymentAttempts: (params: GetPaymentAttemptsParams) => Promise<ClerkPaginatedResponse<BillingPaymentResource>>;
    getPaymentAttempt: (params: {
        id: string;
        orgId?: string;
    }) => Promise<BillingPaymentResource>;
    startCheckout: (params: CreateCheckoutParams) => Promise<BillingCheckout>;
}
