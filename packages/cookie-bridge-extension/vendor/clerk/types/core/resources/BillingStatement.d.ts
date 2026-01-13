import type { BillingStatementGroupJSON, BillingStatementJSON, BillingStatementResource, BillingStatementStatus, BillingStatementTotals } from '@clerk/shared/types';
import { BaseResource, BillingPayment } from './internal';
export declare class BillingStatement extends BaseResource implements BillingStatementResource {
    id: string;
    status: BillingStatementStatus;
    timestamp: Date;
    totals: BillingStatementTotals;
    groups: BillingStatementGroup[];
    constructor(data: BillingStatementJSON);
    protected fromJSON(data: BillingStatementJSON | null): this;
}
export declare class BillingStatementGroup {
    id: string;
    timestamp: Date;
    items: BillingPayment[];
    constructor(data: BillingStatementGroupJSON);
    protected fromJSON(data: BillingStatementGroupJSON | null): this;
}
