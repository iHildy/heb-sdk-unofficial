import { getErrorMessages, persistedQuery } from './api.js';
import type { HEBSession } from './types.js';

export interface CheckoutResult {
  success: boolean;
  errors: string[];
  raw: unknown;
}

export interface CommitCheckoutResult {
  success: boolean;
  orderId: string | null;
  errors: string[];
  raw: unknown;
}

interface CommitCheckoutResponse {
  commitCheckout?: {
    orderId?: string;
    order?: { orderId?: string };
    confirmation?: { orderId?: string };
  };
}

/**
 * Begin checkout for the current cart.
 *
 * Validates the cart, reserved timeslot, and payment method. Does NOT
 * place the order — call {@link commitCheckout} after reviewing.
 */
export async function checkoutCart(session: HEBSession): Promise<CheckoutResult> {
  const res = await persistedQuery<unknown>(session, 'checkoutCart', {});
  const errors = getErrorMessages(res);
  return {
    success: errors.length === 0,
    errors,
    raw: res.data,
  };
}

/**
 * Commit checkout and place the order.
 *
 * Charges the default payment method on file and creates the order.
 *
 * @param session - Active HEB session
 * @param tosToken - Terms-of-service acknowledgement token. Defaults to
 *   the literal string `"TEST_TOKEN"`, which is the value observed in
 *   captured traffic from a successfully placed curbside order. The name
 *   looks like a placeholder but is the actual accepted value; override
 *   only if H-E-B's API changes.
 */
export async function commitCheckout(
  session: HEBSession,
  tosToken = 'TEST_TOKEN',
): Promise<CommitCheckoutResult> {
  const res = await persistedQuery<CommitCheckoutResponse>(
    session,
    'commitCheckout',
    { tosToken },
  );
  const errors = getErrorMessages(res);
  const data = res.data?.commitCheckout;
  const orderId =
    data?.orderId ??
    data?.order?.orderId ??
    data?.confirmation?.orderId ??
    null;

  return {
    success: errors.length === 0,
    orderId,
    errors,
    raw: res.data,
  };
}
