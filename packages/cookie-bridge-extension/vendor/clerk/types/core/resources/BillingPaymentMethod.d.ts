import type { BillingInitializedPaymentMethodJSON, BillingInitializedPaymentMethodResource, BillingPaymentMethodJSON, BillingPaymentMethodResource, BillingPaymentMethodStatus, MakeDefaultPaymentMethodParams, RemovePaymentMethodParams } from '@clerk/shared/types';
import { BaseResource, DeletedObject } from './internal';
export declare class BillingPaymentMethod extends BaseResource implements BillingPaymentMethodResource {
    id: string;
    last4: string | null;
    paymentType?: 'card';
    cardType: string | null;
    isDefault?: boolean;
    isRemovable?: boolean;
    status: BillingPaymentMethodStatus;
    walletType?: string | null;
    expiryYear?: number | null;
    expiryMonth?: number | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    constructor(data: BillingPaymentMethodJSON);
    protected fromJSON(data: BillingPaymentMethodJSON | null): this;
    remove(params?: RemovePaymentMethodParams): Promise<DeletedObject>;
    makeDefault(params?: MakeDefaultPaymentMethodParams): Promise<null>;
}
export declare class BillingInitializedPaymentMethod extends BaseResource implements BillingInitializedPaymentMethodResource {
    externalClientSecret: string;
    externalGatewayId: string;
    paymentMethodOrder: string[];
    constructor(data: BillingInitializedPaymentMethodJSON);
    protected fromJSON(data: BillingInitializedPaymentMethodJSON | null): this;
}
