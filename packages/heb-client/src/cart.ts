import { ERROR_CODES, hasErrorCode, persistedQuery, type GraphQLResponse } from './api.js';
import type { HEBSession } from './types.js';

/**
 * Cart item structure.
 */
export interface CartItem {
  productId: string;
  skuId: string;
  name?: string;
  quantity: number;
  price?: {
    amount: number;
    formatted: string;
  };
  imageUrl?: string;
}

/**
 * Cart response from mutation.
 */
export interface CartResponse {
  success: boolean;
  cart?: {
    items: CartItem[];
    itemCount: number;
    subtotal?: {
      amount: number;
      formatted: string;
    };
  };
  errors?: string[];
}

// Raw GraphQL response - actual structure from HEB API
interface RawCartErrorResponse {
  __typename: 'AddItemToCartV2Error';
  code: string;
  message: string;
  title?: string;
}

interface RawCartSuccessResponse {
  __typename?: string; // Not always 'Cart', could be missing
  id?: string;
  price?: {
    subtotal?: { amount?: number; formattedAmount?: string };
    total?: { amount?: number; formattedAmount?: string };
  };
  commerceItems?: Array<{
    productId?: string;
    skuId?: string;
    quantity?: number;
    displayName?: string;
    productImage?: { url?: string };
    price?: { amount?: number; formattedAmount?: string };
  }>;
}

interface RawCartResponse {
  addItemToCartV2?: RawCartErrorResponse | RawCartSuccessResponse;
}

/**
 * Type guard to check if response is an error.
 */
function isCartError(data: unknown): data is RawCartErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    '__typename' in data &&
    (data as RawCartErrorResponse).__typename === 'AddItemToCartV2Error'
  );
}

/**
 * Parse cart response from GraphQL.
 */
function parseCartResponse(response: GraphQLResponse<RawCartResponse>): CartResponse {
  // Check for top-level GraphQL errors
  if (response.errors?.length) {
    if (hasErrorCode(response, ERROR_CODES.INVALID_PRODUCT_STORE)) {
      return {
        success: false,
        errors: ['Product not available at your selected store. Check CURR_SESSION_STORE cookie.'],
      };
    }
    if (hasErrorCode(response, ERROR_CODES.UNAUTHORIZED)) {
      return {
        success: false,
        errors: ['Session expired or not logged in. Re-authenticate to continue.'],
      };
    }
    return {
      success: false,
      errors: response.errors.map(e => e.message),
    };
  }

  const data = response.data?.addItemToCartV2;
  
  // No response data
  if (!data) {
    return {
      success: false,
      errors: ['No response from cart API'],
    };
  }

  // Check if it's an error response
  if (isCartError(data)) {
    return {
      success: false,
      errors: [data.message || data.title || `Cart error: ${data.code}`],
    };
  }

  // Success response - parse cart data
  const cart = data as RawCartSuccessResponse;
  const items: CartItem[] = (cart.commerceItems ?? []).map(item => ({
    productId: item.productId ?? '',
    skuId: item.skuId ?? '',
    name: item.displayName,
    quantity: item.quantity ?? 0,
    price: item.price ? {
      amount: item.price.amount ?? 0,
      formatted: item.price.formattedAmount ?? '',
    } : undefined,
    imageUrl: item.productImage?.url,
  }));

  return {
    success: true,
    cart: {
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: cart.price?.subtotal ? {
        amount: cart.price.subtotal.amount ?? 0,
        formatted: cart.price.subtotal.formattedAmount ?? '',
      } : undefined,
    },
  };
}

/**
 * Add or update an item in the cart.
 * 
 * @param session - Active HEB session
 * @param productId - Product ID (platform-level)
 * @param skuId - SKU ID (inventory-level)
 * @param quantity - Quantity to set (not add)
 * 
 * @example
 * // Add 4 protein bars to cart
 * const result = await addToCart(session, '2996503', '4122077587', 4);
 * if (result.success) {
 *   console.log(`Cart now has ${result.cart?.itemCount} items`);
 * }
 */
export async function addToCart(
  session: HEBSession,
  productId: string,
  skuId: string,
  quantity: number
): Promise<CartResponse> {
  // Determine if user is logged in based on sat cookie
  const isLoggedIn = Boolean(session.cookies.sat);

  const response = await persistedQuery<RawCartResponse>(
    session,
    'cartItemV2',
    {
      userIsLoggedIn: isLoggedIn,
      productId,
      skuId,
      quantity,
    }
  );

  return parseCartResponse(response);
}

/**
 * Update cart item quantity.
 * Alias for addToCart - same mutation, just clearer intent.
 */
export const updateCartItem = addToCart;

/**
 * Remove item from cart by setting quantity to 0.
 * 
 * @example
 * await removeFromCart(session, '2996503', '4122077587');
 */
export async function removeFromCart(
  session: HEBSession,
  productId: string,
  skuId: string
): Promise<CartResponse> {
  return addToCart(session, productId, skuId, 0);
}

/**
 * Quick add - add 1 of an item to cart.
 */
export async function quickAdd(
  session: HEBSession,
  productId: string,
  skuId: string
): Promise<CartResponse> {
  // Note: HEB's mutation sets quantity, not adds.
  // To truly "add 1 more", you'd need to first get current quantity.
  // This function sets quantity to 1 for simplicity.
  return addToCart(session, productId, skuId, 1);
}
