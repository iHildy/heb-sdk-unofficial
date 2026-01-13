import type { BillingPayerJSON, BillingPayerResource } from '@clerk/shared/types';
import { BaseResource } from './internal';
export declare class BillingPayer extends BaseResource implements BillingPayerResource {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
    imageUrl?: string;
    userId: string | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    organizationId: string | null;
    organizationName?: string | null;
    constructor(data: BillingPayerJSON);
    protected fromJSON(data: BillingPayerJSON | null): this;
}
