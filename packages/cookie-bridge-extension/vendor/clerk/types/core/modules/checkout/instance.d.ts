import type { __experimental_CheckoutInstance, __experimental_CheckoutOptions } from '@clerk/shared/types';
import type { Clerk } from '../../clerk';
/**
 * Create a checkout instance with the given options
 */
declare function createCheckoutInstance(clerk: Clerk, options: __experimental_CheckoutOptions): __experimental_CheckoutInstance;
export { createCheckoutInstance };
