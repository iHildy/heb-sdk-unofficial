import { ERROR_CODES, hasErrorCode, persistedQuery, type GraphQLResponse } from './api.js';
import type { HEBSession } from './types.js';
import { isSessionAuthenticated } from './session.js';

// ─────────────────────────────────────────────────────────────
// Shared Types (used by both getCart and mutations)
// ─────────────────────────────────────────────────────────────

/**
 * Price display structure.
 */
export interface DisplayPrice {
  amount: number;
  formatted: string;
}

/**
 * Cart item structure.
 */
export interface CartItem {
  productId: string;
  skuId: string;
  name?: string;
  quantity: number;
  price?: DisplayPrice;
  imageUrl?: string;
  brand?: string;
  inStock?: boolean;
}

/**
 * Payment group in the cart.
 */
export interface PaymentGroup {
  paymentGroupId: string;
  paymentMethod: string;
  amount: DisplayPrice;
  paymentAlias?: string;
}

/**
 * Fee applied to the cart (e.g., delivery, curbside).
 */
export interface CartFee {
  id: string;
  displayName: string;
  feeType: string;
  amount: DisplayPrice;
  description?: string;
}

/**
 * Full cart contents (from getCart query).
 */
export interface Cart {
  id: string;
  items: CartItem[];
  /** Total item count reported by the server (sum of all quantities). */
  itemCount: number;
  /**
   * True if the server reported more items than were returned in the items array.
   * When true, the UI should indicate truncation (e.g., "Showing 12 of 22 items").
   */
  isTruncated: boolean;
  subtotal: DisplayPrice;
  total: DisplayPrice;
  tax?: DisplayPrice;
  savings?: DisplayPrice;
  paymentGroups: PaymentGroup[];
  fees: CartFee[];
}

/**
 * Cart response from mutation (add/update/remove).
 */
export interface CartResponse {
  success: boolean;
  cart?: {
    items: CartItem[];
    itemCount: number;
    /**
     * True if the server reported more items than were returned in the items array.
     */
    isTruncated: boolean;
    subtotal?: DisplayPrice;
  };
  errors?: string[];
}

// ─────────────────────────────────────────────────────────────
// Raw GraphQL Response Types (internal)
// ─────────────────────────────────────────────────────────────

// Raw mutation response structures
interface RawCartErrorResponse {
  __typename: 'AddItemToCartV2Error';
  code: string;
  message: string;
  title?: string;
}

interface RawCartSuccessResponse {
  __typename?: string;
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

// Raw getCart (cartEstimated) response structures
interface RawDisplayPrice {
  amount?: number;
  formattedAmount?: string;
  displayName?: string | null;
}

interface RawCommerceItem {
  productId?: string;
  skuId?: string;
  quantity?: number;
  displayName?: string;
  productImage?: { url?: string };
  price?: RawDisplayPrice;
  brand?: { name?: string };
  inventory?: { inventoryState?: string };
}

interface RawPaymentGroup {
  paymentGroupId?: string;
  paymentMethod?: string;
  amount?: RawDisplayPrice;
  paymentAlias?: string;
}

interface RawFee {
  id?: string;
  displayName?: string;
  feeType?: string;
  priceInfo?: {
    totalAmount?: RawDisplayPrice;
    listPrice?: RawDisplayPrice;
  };
  feeDescription?: string | null;
}

interface RawCartV2 {
  id?: string;
  currentTime?: string;
  commerceItems?: RawCommerceItem[];
  price?: {
    subtotal?: RawDisplayPrice;
    total?: RawDisplayPrice;
    tax?: RawDisplayPrice;
    totalDiscounts?: RawDisplayPrice;
    retailDiscountTotal?: RawDisplayPrice;
    saleDiscountTotal?: RawDisplayPrice;
    savings?: Array<{
      savingType?: string;
      totalSavings?: RawDisplayPrice;
    }>;
  };
  paymentGroups?: RawPaymentGroup[];
  fees?: RawFee[];
}

interface RawCartEstimatedResponse {
  cartV2?: RawCartV2;
}

// Mobile cart response shapes (bearer sessions)
interface MobileCartPrice {
  amount?: number;
  formattedAmount?: string;
}

interface MobileCartItem {
  product?: {
    id?: string;
    productId?: string;
    fullDisplayName?: string;
    displayName?: string;
    brand?: { name?: string };
    isAvailableForCheckout?: boolean;
    skus?: Array<{ id?: string; displayName?: string }>;
  };
  sku?: { id?: string; displayName?: string };
  quantity?: number;
  itemPrice?: {
    listPrice?: MobileCartPrice;
    salePrice?: MobileCartPrice;
    adjustedTotal?: MobileCartPrice;
    rawTotal?: MobileCartPrice;
  };
}

interface MobileCart {
  id?: string;
  itemCount?: { total?: number };
  items?: MobileCartItem[];
  priceWithoutTax?: {
    subtotal?: MobileCartPrice;
    total?: MobileCartPrice;
    totalDiscounts?: MobileCartPrice;
    saleDiscountTotal?: MobileCartPrice;
    retailDiscountTotal?: MobileCartPrice;
    savings?: Array<{ totalSavings?: MobileCartPrice }>;
  };
  paymentGroups?: Array<{
    paymentGroupId?: string;
    paymentMethod?: string;
    amount?: MobileCartPrice;
    paymentAlias?: string;
  }>;
  fees?: Array<{
    id?: string;
    displayName?: string;
    feeType?: string;
    priceInfo?: { totalAmount?: MobileCartPrice };
    feeDescription?: string | null;
  }>;
}

// ─────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────

/**
 * Parse raw display price to DisplayPrice.
 */
function parseDisplayPrice(raw?: RawDisplayPrice): DisplayPrice {
  return {
    amount: raw?.amount ?? 0,
    formatted: raw?.formattedAmount ?? '$0.00',
  };
}

function parseMobileDisplayPrice(raw?: MobileCartPrice): DisplayPrice {
  return {
    amount: raw?.amount ?? 0,
    formatted: raw?.formattedAmount ?? '$0.00',
  };
}

/**
 * Calculate itemCount and isTruncated from items array and optional server-reported total.
 * This centralizes the logic (DRY) to detect when the API truncates items.
 */
function calculateCartCounts(
  items: CartItem[],
  explicitTotal?: number
): { itemCount: number; isTruncated: boolean } {
  const sumQuantities = items.reduce((sum, item) => sum + item.quantity, 0);
  const itemCount = explicitTotal ?? sumQuantities;
  const isTruncated = explicitTotal != null && sumQuantities < explicitTotal;
  return { itemCount, isTruncated };
}

function parseMobileCartItems(items?: MobileCartItem[]): CartItem[] {
  if (!items?.length) return [];
  return items.map(item => {
    const product = item.product;
    const sku = item.sku ?? product?.skus?.[0];
    const priceSource = item.itemPrice?.salePrice
      ?? item.itemPrice?.listPrice
      ?? item.itemPrice?.adjustedTotal
      ?? item.itemPrice?.rawTotal;

    return {
      productId: product?.id ?? product?.productId ?? '',
      skuId: sku?.id ?? '',
      name: product?.fullDisplayName ?? product?.displayName ?? sku?.displayName,
      quantity: item.quantity ?? 0,
      price: priceSource ? parseMobileDisplayPrice(priceSource) : undefined,
      brand: product?.brand?.name,
      inStock: product?.isAvailableForCheckout ?? undefined,
    };
  });
}

function parseMobileCart(cart: MobileCart): Cart {
  const items = parseMobileCartItems(cart.items);

  const paymentGroups: PaymentGroup[] = (cart.paymentGroups ?? []).map(pg => ({
    paymentGroupId: pg.paymentGroupId ?? '',
    paymentMethod: pg.paymentMethod ?? '',
    amount: parseMobileDisplayPrice(pg.amount),
    paymentAlias: pg.paymentAlias,
  }));

  const fees: CartFee[] = (cart.fees ?? []).map(fee => ({
    id: fee.id ?? '',
    displayName: fee.displayName ?? '',
    feeType: fee.feeType ?? '',
    amount: parseMobileDisplayPrice(fee.priceInfo?.totalAmount),
    description: fee.feeDescription ?? undefined,
  }));

  let savingsAmount = 0;
  if (cart.priceWithoutTax?.savings?.length) {
    savingsAmount = cart.priceWithoutTax.savings.reduce(
      (sum, s) => sum + (s.totalSavings?.amount ?? 0),
      0
    );
  } else if (cart.priceWithoutTax?.totalDiscounts?.amount) {
    savingsAmount = Math.abs(cart.priceWithoutTax.totalDiscounts.amount);
  }

  const savings: DisplayPrice | undefined = savingsAmount > 0 ? {
    amount: savingsAmount,
    formatted: `$${savingsAmount.toFixed(2)}`,
  } : undefined;

  const { itemCount, isTruncated } = calculateCartCounts(items, cart.itemCount?.total);

  return {
    id: cart.id ?? '',
    items,
    itemCount,
    isTruncated,
    subtotal: parseMobileDisplayPrice(cart.priceWithoutTax?.subtotal),
    total: parseMobileDisplayPrice(cart.priceWithoutTax?.total),
    savings,
    paymentGroups,
    fees,
  };
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
 * Parse cart response from mutation.
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
  const cart = data as RawCartSuccessResponse & MobileCart;

  if (Array.isArray(cart.items)) {
    const items = parseMobileCartItems(cart.items);
    const { itemCount, isTruncated } = calculateCartCounts(items, cart.itemCount?.total);
    return {
      success: true,
      cart: {
        items,
        itemCount,
        isTruncated,
        subtotal: cart.priceWithoutTax?.subtotal ? parseMobileDisplayPrice(cart.priceWithoutTax.subtotal) : undefined,
      },
    };
  }

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

  // commerceItems path: no explicit total from server, so never truncated
  const { itemCount, isTruncated } = calculateCartCounts(items);

  return {
    success: true,
    cart: {
      items,
      itemCount,
      isTruncated,
      subtotal: cart.price?.subtotal ? {
        amount: cart.price.subtotal.amount ?? 0,
        formatted: cart.price.subtotal.formattedAmount ?? '',
      } : undefined,
    },
  };
}

/**
 * Parse cartEstimated response to Cart.
 */
function parseGetCartResponse(response: GraphQLResponse<RawCartEstimatedResponse>): Cart {
  // Check for GraphQL errors
  if (response.errors?.length) {
    const errorMsg = response.errors.map(e => e.message).join(', ');
    throw new Error(`Failed to get cart: ${errorMsg}`);
  }

  const cartV2 = response.data?.cartV2 as (RawCartV2 & MobileCart) | undefined;

  if (!cartV2) {
    throw new Error('No cart data returned');
  }

  if (Array.isArray(cartV2.items)) {
    return parseMobileCart(cartV2);
  }

  // Parse commerce items
  const items: CartItem[] = (cartV2.commerceItems ?? []).map(item => ({
    productId: item.productId ?? '',
    skuId: item.skuId ?? '',
    name: item.displayName,
    quantity: item.quantity ?? 0,
    price: item.price ? parseDisplayPrice(item.price) : undefined,
    imageUrl: item.productImage?.url,
    brand: item.brand?.name,
    inStock: item.inventory?.inventoryState === 'IN_STOCK',
  }));

  // Parse payment groups
  const paymentGroups: PaymentGroup[] = (cartV2.paymentGroups ?? []).map(pg => ({
    paymentGroupId: pg.paymentGroupId ?? '',
    paymentMethod: pg.paymentMethod ?? '',
    amount: parseDisplayPrice(pg.amount),
    paymentAlias: pg.paymentAlias,
  }));

  // Parse fees
  const fees: CartFee[] = (cartV2.fees ?? []).map(fee => ({
    id: fee.id ?? '',
    displayName: fee.displayName ?? '',
    feeType: fee.feeType ?? '',
    amount: parseDisplayPrice(fee.priceInfo?.totalAmount),
    description: fee.feeDescription ?? undefined,
  }));

  // Calculate total savings from all saving types
  let savingsAmount = 0;
  if (cartV2.price?.savings?.length) {
    savingsAmount = cartV2.price.savings.reduce(
      (sum, s) => sum + (s.totalSavings?.amount ?? 0),
      0
    );
  } else if (cartV2.price?.totalDiscounts?.amount) {
    savingsAmount = Math.abs(cartV2.price.totalDiscounts.amount);
  }

  const savings: DisplayPrice | undefined = savingsAmount > 0 ? {
    amount: savingsAmount,
    formatted: `$${savingsAmount.toFixed(2)}`,
  } : undefined;

  // commerceItems path: no explicit total from server, so never truncated
  const { itemCount, isTruncated } = calculateCartCounts(items);

  return {
    id: cartV2.id ?? '',
    items,
    itemCount,
    isTruncated,
    subtotal: parseDisplayPrice(cartV2.price?.subtotal),
    total: parseDisplayPrice(cartV2.price?.total),
    tax: cartV2.price?.tax?.amount ? parseDisplayPrice(cartV2.price.tax) : undefined,
    savings,
    paymentGroups,
    fees,
  };
}

// ─────────────────────────────────────────────────────────────
// Public API Functions
// ─────────────────────────────────────────────────────────────

/**
 * Get the current cart contents.
 * 
 * @param session - Active HEB session
 * @returns Full cart with items, pricing, payment groups, and fees
 * 
 * @example
 * const cart = await getCart(session);
 * console.log(`Cart has ${cart.itemCount} items`);
 * console.log(`Subtotal: ${cart.subtotal.formatted}`);
 * console.log(`Total: ${cart.total.formatted}`);
 * 
 * // Check fees
 * cart.fees.forEach(fee => {
 *   console.log(`${fee.displayName}: ${fee.amount.formatted}`);
 * });
 */
export async function getCart(session: HEBSession): Promise<Cart> {
  const isLoggedIn = isSessionAuthenticated(session);

  const response = await persistedQuery<RawCartEstimatedResponse>(
    session,
    session.authMode === 'bearer' ? 'cartV2' : 'cartEstimated',
    session.authMode === 'bearer'
      ? { includeTax: false, isAuthenticated: isLoggedIn }
      : { userIsLoggedIn: isLoggedIn }
  );

  return parseGetCartResponse(response);
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
  const isLoggedIn = isSessionAuthenticated(session);

  const response = await persistedQuery<RawCartResponse>(
    session,
    'cartItemV2',
    session.authMode === 'bearer'
      ? {
          includeTax: false,
          isAuthenticated: isLoggedIn,
          parentOrderId: null,
          productId,
          quantity,
          skuId,
        }
      : {
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
