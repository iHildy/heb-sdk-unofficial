/**
 * Order history operations.
 * 
 * @module orders
 */

import { nextDataRequest, persistedQuery } from './api.js';
import type { GraphQLResponse } from './api.js';
import type { HEBSession } from './types.js';

/**
 * Raw order object from order history list.
 */
export interface RawHistoryOrder {
  orderId: string;
  orderStatusMessageShort: string;
  orderChangesOverview: {
    reviewChangesEligible: boolean;
    unfulfilledCount: number;
    __typename: string;
  };
  fulfillmentType: string;
  store: {
    name: string;
    latitude: number;
    longitude: number;
    __typename: string;
  };
  orderTimeslot: {
    startTime: string;
    endTime: string;
    __typename: string;
  };
  totalPrice: {
    formattedAmount: string;
    __typename: string;
  };
  productCount: number;
  __typename: string;
}

/**
 * Raw order history page response from Next.js data endpoint.
 */
export interface OrderHistoryResponse {
  pageProps: {
    orders?: RawHistoryOrder[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Raw order details page payload from Next.js data endpoint.
 */
export interface OrderDetailsPageOrder {
  orderId: string;
  status: string;
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
  orderDetailsRequest?: {
    order?: {
      orderId?: string;
      status?: string;
      priceDetails?: {
        subtotal?: { formattedAmount?: string };
        total?: { formattedAmount?: string };
        tax?: { formattedAmount?: string };
      };
      orderItems?: Array<{
        quantity: number;
        product: {
          id: string;
          fullDisplayName: string;
          thumbnailImageUrls: Array<{ size: string; url: string }>;
          SKUs: Array<{ id: string }>;
        };
        totalUnitPrice?: { amount?: number };
      }>;
    };
  };
}

/**
 * Raw order details response (Next.js + GraphQL).
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
}

/**
 * Get order history (raw Next.js payload).
 * 
 * @param session - Active HEB session
 * @param options - Pagination options
 * @returns Raw order history response
 */
export async function getOrders(
  session: HEBSession,
  options: GetOrdersOptions = {}
): Promise<OrderHistoryResponse> {
  const page = options.page ?? 1;
  const path = `/en/my-account/your-orders.json?page=${page}`;

  return nextDataRequest<OrderHistoryResponse>(session, path);
}

/**
 * Get a single order by ID (raw Next.js + GraphQL payloads).
 * 
 * @param session - Active HEB session
 * @param orderId - Order ID
 * @returns Raw order details response
 */
export async function getOrder(
  session: HEBSession,
  orderId: string
): Promise<OrderDetailsResponse> {
  const safeOrderId = encodeURIComponent(orderId);
  const path = `/en/my-account/order-history/${safeOrderId}.json?orderId=${safeOrderId}`;

  const [page, graphql] = await Promise.all([
    nextDataRequest<OrderDetailsPageResponse>(session, path),
    persistedQuery<OrderDetailsGraphqlResponse>(
      session,
      'ModifiableOrderDetailsRequest',
      { orderId }
    ),
  ]);

  return { page, graphql };
}
