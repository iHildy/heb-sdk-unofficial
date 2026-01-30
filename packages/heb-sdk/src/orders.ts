/**
 * Order history operations.
 * 
 * @module orders
 */

import type { GraphQLResponse } from './api.js';
import { persistedQuery } from './api.js';
import { getShoppingMode, resolveShoppingContext } from './session.js';
import type { HEBSession } from './types.js';
import { formatSlotTime, formatSlotDate } from './utils.js';

/**
 * Raw order object from order history list.
 */
export interface RawHistoryOrder {
  orderId: string;
  orderStatusMessageShort?: string;
  status?: string; // Add status
  orderChangesOverview?: {
    reviewChangesEligible?: boolean;
    unfulfilledCount?: number;
    __typename?: string;
  };
  fulfillmentType?: string;
  store?: {
    name?: string;
    latitude?: number;
    longitude?: number;
    __typename?: string;
  };
  orderTimeslot?: {
    startTime?: string;
    endTime?: string;
    startDateTime?: string;
    endDateTime?: string;
    formattedStartTime?: string;
    formattedEndTime?: string;
    formattedDate?: string;
    __typename?: string;
  };
  totalPrice?: {
    formattedAmount?: string;
    __typename?: string;
  };
  priceDetails?: {
    total?: { formattedAmount?: string };
  };
  productCount?: number;
  __typename?: string;
}

/**
 * Raw order history response (mobile GraphQL).
 */
export interface OrderHistoryResponse {
  pageProps: {
    orders?: RawHistoryOrder[];
    [key: string]: unknown;
  };
  pagination?: {
    page: number;
    size: number;
    hasMore: boolean;
    nextPage?: number;
    activeCount: number;
    completedCount: number;
  };
  [key: string]: unknown;
}

/**
 * Normalized order item (from orderItems array).
 */
export interface OrderDetailsItem {
  /** Product ID */
  id: string;
  /** Product display name */
  name: string;
  /** Quantity ordered */
  quantity: number;
  /** Formatted price string (e.g., "$26.44") */
  price: string;
  /** Unit price as a number (in dollars, NOT cents) */
  unitPrice: number;
  /** Thumbnail image URL */
  image?: string;
}

/**
 * Normalized order details payload (from mobile GraphQL).
 */
export interface OrderDetailsPageOrder {
  orderId: string;
  status: string;
  /** Normalized order items */
  items: OrderDetailsItem[];
  priceDetails?: {
    subtotal?: { formattedAmount?: string };
    total?: { formattedAmount?: string };
    tax?: { formattedAmount?: string };
  };
  fulfillmentType?: string;
  orderPlacedOnDateTime?: string;
  orderTimeslot?: {
    startDateTime?: string;
    endDateTime?: string;
    formattedStartTime?: string;
    formattedEndTime?: string;
    formattedDate?: string;
  };
  [key: string]: unknown;
}

export interface OrderDetailsPageResponse {
  pageProps?: {
    order?: OrderDetailsPageOrder;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Raw order details response (GraphQL persisted query).
 */
export interface OrderDetailsGraphqlResponse {
  orderDetails?: OrderDetailsOrder;
  orderDetailsRequest?: {
    order?: OrderDetailsOrder;
  };
}

/**
 * Order details order structure from orderDetails query.
 */
export interface OrderDetailsOrder {
  orderId?: string;
  status?: string;
  orderStatusMessageShort?: string;
  fulfillmentType?: string;
  orderPlacedOnDateTime?: string;
  priceDetails?: {
    subtotal?: { formattedAmount?: string };
    total?: { formattedAmount?: string };
    tax?: { formattedAmount?: string };
  };
  orderTimeslot?: {
    startTime?: string;
    endTime?: string;
    startDateTime?: string;
    endDateTime?: string;
  };
  store?: {
    id?: string;
    name?: string;
    address?: string;
  };
  orderItems?: Array<{
    quantity: number;
    product: {
      id: string;
      fullDisplayName: string;
      thumbnailImageUrls?: Array<{ size: string; url: string }>;
      SKUs?: Array<{ id: string }>;
    };
    totalUnitPrice?: { amount?: number; formattedAmount?: string };
    unitPrice?: { amount?: number; formattedAmount?: string };
  }>;
  readyOrder?: {
    orderId?: string;
    status?: string;
  };
}

/**
 * Raw order details response (mobile GraphQL).
 */
export interface OrderDetailsResponse {
  page: OrderDetailsPageResponse;
  graphql: GraphQLResponse<OrderDetailsGraphqlResponse>;
}

/**
 * Options for fetching orders.
 */
export interface GetOrdersOptions {
  page?: number;
  size?: number;
}

interface OrderHistoryGraphqlResponse {
  orderHistoryRequest?: {
    orderHistory?: {
      orders?: RawHistoryOrder[];
    };
    orders?: RawHistoryOrder[];
  };
  orderHistory?: {
    orders?: RawHistoryOrder[];
  };
}

const DEFAULT_ORDER_PAGE_SIZE = 10;

function assertBearer(session: HEBSession): void {
  if (session.authMode !== 'bearer') {
    throw new Error('Orders require a bearer session (mobile GraphQL).');
  }
}

function extractOrders(payload?: OrderHistoryGraphqlResponse): RawHistoryOrder[] {
  if (!payload) return [];
  const root: any = payload as any;
  const orderHistoryRequest = root.orderHistoryRequest ?? root.orderHistory;
  const orderHistory = orderHistoryRequest?.orderHistory ?? orderHistoryRequest;
  const orders = orderHistory?.orders ?? orderHistoryRequest?.orders ?? root.orders;
  return Array.isArray(orders) ? (orders as RawHistoryOrder[]) : [];
}

/**
 * Normalize a single order item from raw GraphQL data.
 * Uses formattedAmount when available; otherwise uses raw amount (already in dollars).
 */
function normalizeOrderItem(item: any): OrderDetailsItem {
  const product = item?.product ?? {};
  const priceObj = item?.totalUnitPrice ?? item?.unitPrice ?? {};
  
  // API returns amount in dollars (e.g., 26.44), NOT cents
  const amount = typeof priceObj?.amount === 'number' ? priceObj.amount : 0;
  // Prefer formattedAmount from API; fallback to formatting ourselves
  const formattedPrice = priceObj?.formattedAmount ?? `$${amount.toFixed(2)}`;

  return {
    id: product?.id ?? '',
    name: product?.fullDisplayName ?? product?.displayName ?? product?.name ?? '',
    quantity: item?.quantity ?? 0,
    price: formattedPrice,
    unitPrice: amount,
    image: product?.thumbnailImageUrls?.[0]?.url ?? product?.image,
  };
}

/**
 * Normalize a single order from history list to ensure totalPrice is populated.
 * The mobile API returns totalPrice directly, but we ensure consistent structure.
 */
function normalizeHistoryOrder(order: any): RawHistoryOrder {
  const priceDetails = order?.priceDetails ?? order?.priceSummary ?? {};
  // Ensure totalPrice is an object before spreading (could be primitive in edge cases)
  const totalPriceSource = order?.totalPrice ?? order?.total ?? order?.orderTotal;
  const totalPrice = typeof totalPriceSource === 'object' && totalPriceSource !== null ? totalPriceSource : {};
  
  // Try to find a formatted amount from various possible locations
  const formattedAmount = 
    totalPrice?.formattedAmount ?? 
    priceDetails?.total?.formattedAmount ?? 
    order?.grandTotal?.formattedAmount ??
    order?.price?.total?.formattedAmount;

  const orderTimeslot = order?.orderTimeslot ?? {};
  const startTime = orderTimeslot?.startTime ?? orderTimeslot?.startDateTime;
  const endTime = orderTimeslot?.endTime ?? orderTimeslot?.endDateTime;

  // Ensure totalPrice exists with the found amount
  return {
    ...order,
    totalPrice: {
      ...totalPrice,
      formattedAmount,
    },
    orderTimeslot: {
      ...orderTimeslot,
      startTime,
      endTime,
      formattedStartTime: startTime ? formatSlotTime(startTime) : undefined,
      formattedEndTime: endTime ? formatSlotTime(endTime) : undefined,
      formattedDate: startTime ? formatSlotDate(startTime) : undefined,
    }
  };
}

function normalizeOrderDetails(order: any): OrderDetailsPageOrder {
  const orderTimeslot = order?.orderTimeslot ?? order?.timeslot ?? order?.orderTimeSlot ?? {};
  const priceDetails = order?.priceDetails ?? order?.priceSummary ?? {};
  const totalPrice = order?.totalPrice ?? order?.total ?? {};
  const formattedTotal = priceDetails?.total?.formattedAmount ?? totalPrice?.formattedAmount;

  // Normalize all order items
  const rawItems = order?.orderItems ?? [];
  const items: OrderDetailsItem[] = rawItems.map(normalizeOrderItem);

  const startTime = orderTimeslot?.startDateTime ?? orderTimeslot?.startTime;
  const endTime = orderTimeslot?.endDateTime ?? orderTimeslot?.endTime;

  return {
    orderId: order?.orderId ?? '',
    status: order?.status ?? order?.orderStatusMessageShort ?? '',
    items,
    fulfillmentType: order?.fulfillmentType,
    orderPlacedOnDateTime: order?.orderPlacedOnDateTime ?? order?.orderPlacedOn,
    orderTimeslot: {
      startDateTime: startTime,
      endDateTime: endTime,
      formattedStartTime: startTime ? formatSlotTime(startTime) : undefined,
      formattedEndTime: endTime ? formatSlotTime(endTime) : undefined,
      formattedDate: startTime ? formatSlotDate(startTime) : undefined,
    },
    priceDetails: {
      subtotal: priceDetails?.subtotal ?? totalPrice?.subtotal,
      total: formattedTotal ? { formattedAmount: formattedTotal } : priceDetails?.total,
      tax: priceDetails?.tax,
    },
  };
}

/**
 * Get order history (mobile GraphQL).
 * 
 * @param session - Active HEB bearer session
 * @param options - Pagination options
 * @returns Raw order history response
 */
export async function getOrders(
  session: HEBSession,
  options: GetOrdersOptions = {}
): Promise<OrderHistoryResponse> {
  assertBearer(session);

  const page = options.page ?? 1;
  const size = Math.max(1, Math.floor(options.size ?? DEFAULT_ORDER_PAGE_SIZE));
  const offset = Math.max(0, (page - 1) * size);

  const context = resolveShoppingContext(session);
  const mode = getShoppingMode(context); // Approximation, refine if DELIVERY mode exists for orders

  const [active, completed] = await Promise.all([
    persistedQuery<OrderHistoryGraphqlResponse>(session, 'orderHistory', {
      mode,
      offset,
      omitOrderItems: false,
      size,
      status: 'ACTIVE',
    }),
    persistedQuery<OrderHistoryGraphqlResponse>(session, 'orderHistory', {
      mode,
      offset,
      omitOrderItems: false,
      size,
      status: 'COMPLETED',
    }),
  ]);

  const errors = [...(active.errors ?? []), ...(completed.errors ?? [])];
  if (errors.length) {
    throw new Error(`Order history fetch failed: ${errors.map(e => e.message).join(', ')}`);
  }

  const activeOrders = extractOrders(active.data);
  const completedOrders = extractOrders(completed.data);
  const combined = [...activeOrders, ...completedOrders];
  const uniqueOrders = new Map<string, RawHistoryOrder>();
  for (const rawOrder of combined) {
    if (rawOrder?.orderId && !uniqueOrders.has(rawOrder.orderId)) {
      uniqueOrders.set(rawOrder.orderId, normalizeHistoryOrder(rawOrder));
    }
  }

  const hasMore = activeOrders.length >= size || completedOrders.length >= size;

  return {
    pageProps: {
      orders: Array.from(uniqueOrders.values()),
    },
    pagination: {
      page,
      size,
      hasMore,
      nextPage: hasMore ? page + 1 : undefined,
      activeCount: activeOrders.length,
      completedCount: completedOrders.length,
    },
  };
}

/**
 * Get a single order by ID (mobile GraphQL).
 * 
 * Uses the dedicated orderDetails operation for efficient single-order fetching.
 * 
 * @param session - Active HEB bearer session
 * @param orderId - Order ID (e.g., "HEB24702750622")
 * @param includeReadyOrder - Include ready order status info (default: true)
 * @returns Raw order details response
 */
export async function getOrder(
  session: HEBSession,
  orderId: string,
  includeReadyOrder = true
): Promise<OrderDetailsResponse> {
  assertBearer(session);

  const result = await persistedQuery<OrderDetailsGraphqlResponse>(session, 'orderDetails', {
    orderId,
    includeReadyOrder,
  });

  if (result.errors?.length) {
    throw new Error(`Order details fetch failed: ${result.errors.map(e => e.message).join(', ')}`);
  }

  // Handle both response shapes: orderDetails or orderDetailsRequest.order
  const order = result.data?.orderDetails ?? result.data?.orderDetailsRequest?.order;
  if (!order) {
    throw new Error(`Order ${orderId} not found.`);
  }

  const pageOrder = normalizeOrderDetails(order);

  return {
    page: { pageProps: { order: pageOrder } },
    graphql: result,
  };
}

/**
 * Format order history list for display.
 */
export function formatOrderHistory(orders: RawHistoryOrder[]): string {
  if (orders.length === 0) {
    return 'No past orders found.';
  }

  const formatted = orders.map(order => {
    const ts = order.orderTimeslot;
    const timeRange = ts?.formattedStartTime ? ` (${ts.formattedStartTime} - ${ts.formattedEndTime})` : '';
    // Use formatSlotDate if available, otherwise default to local string (but formatSlotDate is safer)
    const dateText = ts?.formattedDate ?? (ts?.startTime ? formatSlotDate(ts.startTime) : 'Unknown date');
    const totalText = order.totalPrice?.formattedAmount ?? order.priceDetails?.total?.formattedAmount ?? 'Unknown total';
    const statusText = order.orderStatusMessageShort ?? order.status ?? 'Unknown status';
    return `* Order ID: ${order.orderId} - Date: ${dateText}${timeRange} - Total: ${totalText} (${statusText})`;
  }).join('\n');

  return `Found ${orders.length} past orders:\n\n${formatted}\n\nUse get_order_details(order_id) to see specific items.`;
}

/**
 * Format full order details for display.
 */
export function formatOrderDetails(order: OrderDetailsPageOrder): string {
  // Use normalized items from SDK (prices already in dollars, not cents)
  const normalizedItems = order.items ?? [];
  const items = normalizedItems.length > 0
    ? normalizedItems.map((item) =>
        `- ${item.name} (Qty: ${item.quantity}, Price: ${item.price}) (ID: ${item.id})`
      ).join('\n')
    : '';

  const orderIdText = order.orderId;
  const statusText = order.status ?? 'Unknown status';
  const totalText = order.priceDetails?.total?.formattedAmount ?? 'Unknown total';
  
  const ts = order.orderTimeslot;
  const timeText = ts?.formattedDate ? `${ts.formattedDate} (${ts.formattedStartTime} - ${ts.formattedEndTime})` : 'Unknown';

  return [
    `**Order ${orderIdText}**`,
    `Status: ${statusText}`,
    `Date/Time: ${timeText}`,
    `Total: ${totalText}`,
    items ? `Items:\n${items}` : 'Items: No items found.'
  ].join('\n');
}
