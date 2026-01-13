import type { AddPaymentMethodParams, GetPaymentMethodsParams, InitializePaymentMethodParams } from '@clerk/shared/types';
import { BillingInitializedPaymentMethod, BillingPaymentMethod } from '../../resources/internal';
type WithOptionalOrgType<T> = T & {
    orgId?: string;
};
export declare const initializePaymentMethod: (params: WithOptionalOrgType<InitializePaymentMethodParams>) => Promise<BillingInitializedPaymentMethod>;
export declare const addPaymentMethod: (params: WithOptionalOrgType<AddPaymentMethodParams>) => Promise<BillingPaymentMethod>;
export declare const getPaymentMethods: (params?: WithOptionalOrgType<GetPaymentMethodsParams>) => Promise<{
    total_count: number;
    data: BillingPaymentMethod[];
}>;
export {};
