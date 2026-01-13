/**
 * Order history operations.
 * 
 * @module orders
 */

import { nextDataRequest, persistedQuery } from './api.js';
import type { HEBSession } from './types.js';

/**
 * Raw order object from order history list.
 */
interface RawHistoryOrder {
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
 * Raw order details response.
 */
interface OrderDetailsResponse {
  orderDetailsRequest: {
    order: {
      orderId: string;
      status: string;
      priceDetails: {
        subtotal: { formattedAmount: string };
        total: { formattedAmount: string };
        tax: { formattedAmount: string };
      };
      orderItems: Array<{
        quantity: number;
        product: {
          id: string;
          fullDisplayName: string;
          thumbnailImageUrls: Array<{ size: string; url: string }>;
          SKUs: Array<{ id: string }>;
        };
        totalUnitPrice: { amount: number };
      }>;
    };
  };
}

/**
 * Order item from order history.
 */
export interface OrderItem {
  productId: string;
  skuId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

/**
 * Order from order history.
 */
export interface Order {
  orderId: string;
  orderDate: Date;
  status: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  storeName?: string;
  fulfillmentType?: string;
}

/**
 * Options for fetching orders.
 */
export interface GetOrdersOptions {
  page?: number;
}

/**
 * Get order history.
 * 
 * @param session - Active HEB session
 * @param options - Pagination options
 * @returns List of orders
 */
export async function getOrders(
  session: HEBSession,
  options: GetOrdersOptions = {}
): Promise<Order[]> {
  const page = options.page || 1;
  const path = `/en/my-account/your-orders.json?page=${page}`;
  
  const data = await nextDataRequest<{
    pageProps: {
      orders: RawHistoryOrder[];
    };
  }>(session, path);

  const rawOrders = data.pageProps.orders;

  return rawOrders.map(o => ({
    orderId: o.orderId,
    orderDate: new Date(o.orderTimeslot.startTime),
    status: o.orderStatusMessageShort,
    items: [], // Details not available in list view
    subtotal: 0, // Not available in list view
    total: parseFloat(o.totalPrice.formattedAmount.replace('$', '')),
    storeName: o.store.name,
    fulfillmentType: o.fulfillmentType,
  }));
}

/**
 * Get a single order by ID.
 * 
 * @param session - Active HEB session
 * @param orderId - Order ID
 * @returns Order details
 */
export async function getOrder(
  session: HEBSession,
  orderId: string
): Promise<Order> {
  const response = await persistedQuery<OrderDetailsResponse>(
    session,
    'ModifiableOrderDetailsRequest',
    { orderId }
  );

  const orderData = response.data?.orderDetailsRequest?.order;

  if (!orderData) {
    throw new Error(`Order ${orderId} not found`);
  }

  return {
    orderId: orderData.orderId,
    orderDate: new Date(), // Date not readily available in this query, would need to fetch from list or other field
    status: orderData.status,
    subtotal: parseFloat(orderData.priceDetails.subtotal.formattedAmount.replace('$', '')),
    total: parseFloat(orderData.priceDetails.total.formattedAmount.replace('$', '')),
    items: orderData.orderItems.map(item => ({
      productId: item.product.id,
      skuId: item.product.SKUs[0]?.id || '',
      name: item.product.fullDisplayName,
      quantity: item.quantity,
      price: item.totalUnitPrice.amount,
      imageUrl: item.product.thumbnailImageUrls.find(img => img.size === 'SMALL')?.url,
    })),
  };
}
