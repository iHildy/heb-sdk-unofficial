import type { __experimental_CheckoutCacheState, __experimental_CheckoutInstance, BillingCheckoutResource } from '@clerk/shared/types';
type CheckoutKey = string & {
    readonly __tag: 'CheckoutKey';
};
type CheckoutResult = Awaited<ReturnType<__experimental_CheckoutInstance['start']>>;
export declare const FETCH_STATUS: {
    readonly IDLE: "idle";
    readonly FETCHING: "fetching";
    readonly ERROR: "error";
};
/**
 * Creates a checkout manager for handling checkout operations and state management.
 *
 * @param cacheKey - Unique identifier for the checkout instance
 * @returns Manager with methods for checkout operations and state subscription
 *
 * @example
 * ```typescript
 * const manager = createCheckoutManager('user-123-plan-456-monthly');
 * const unsubscribe = manager.subscribe(state => console.log(state));
 * ```
 */
declare function createCheckoutManager(cacheKey: CheckoutKey): {
    subscribe(listener: (newState: __experimental_CheckoutCacheState) => void): () => void;
    getCacheState: () => __experimental_CheckoutCacheState;
    executeOperation(operationType: "start" | "confirm", operationFn: () => Promise<BillingCheckoutResource>): Promise<CheckoutResult>;
    clearCheckout(): void;
};
export { createCheckoutManager, type __experimental_CheckoutCacheState as CheckoutCacheState, type CheckoutKey };
