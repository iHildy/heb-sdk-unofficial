/**
 * MCP Tool definitions for H-E-B grocery API.
 * 
 * Each tool wraps functionality from the heb-client library.
 * Tools resolve the client lazily at call time to support hot-reload.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { HEBClient, HEBCookies, HEBSession } from 'heb-client';
import { isSessionValid } from 'heb-client';
import { z } from 'zod';
import { getSessionStatus, saveSessionToFile } from './session.js';

type ClientGetter = () => HEBClient | null;

type ToolOptions = {
  saveCookies?: (cookies: HEBCookies) => Promise<void> | void;
  saveSession?: (session: HEBSession) => Promise<void> | void;
  sessionStatusSource?: string;
};

type OrderHistoryResponse = {
  pageProps?: {
    orders?: Array<{
      orderId: string;
      orderStatusMessageShort?: string;
      orderTimeslot?: { startTime?: string; startDateTime?: string };
      totalPrice?: { formattedAmount?: string };
    }>;
  };
};

type OrderDetailsResponse = {
  page?: {
    pageProps?: {
      order?: {
        orderId?: string;
        status?: string;
        priceDetails?: { total?: { formattedAmount?: string } };
      };
    };
  };
  graphql?: {
    data?: {
      orderDetailsRequest?: {
        order?: {
          orderId?: string;
          status?: string;
          priceDetails?: { total?: { formattedAmount?: string } };
          orderItems?: Array<{
            quantity: number;
            product: { id: string; fullDisplayName: string };
            totalUnitPrice?: { amount?: number };
          }>;
        };
      };
    };
  };
};

/**
 * Helper to require a valid client, returning an error response if missing.
 */
function requireClient(getClient: ClientGetter): { client: HEBClient } | { error: { content: [{ type: 'text'; text: string }]; isError: true } } {
  const client = getClient();
  if (!client) {
    return {
      error: {
        content: [{ type: 'text', text: 'No valid HEB session. Link HEB OAuth or set HEB_SAT/HEB_REESE84 env vars.' }],
        isError: true,
      },
    };
  }
  return { client };
}

/**
 * Register all HEB tools on the MCP server.
 * 
 * @param server - MCP server instance
 * @param getClient - Function that returns the current HEBClient (may be null if no session)
 */
export function registerTools(server: McpServer, getClient: ClientGetter, options: ToolOptions = {}): void {
  // ─────────────────────────────────────────────────────────────
  // Session & Context
  // ─────────────────────────────────────────────────────────────

  server.resource(
    'session_status',
    'session://status',
    {
      description: 'Contains info about the current login session and active store'
    },
    async (uri: any) => {
      const result = requireClient(getClient);
      if ('error' in result) {
        return {
          contents: [{
            uri: uri.href,
            text: 'No valid HEB session found.'
          }]
        };
      }
      const { client } = result;
      const status = getSessionStatus(client.session, { source: options.sessionStatusSource });
      return {
        contents: [{
          uri: uri.href,
          text: status
        }]
      };
    }
  );

  server.tool(
    'get_session_info',
    'Get information about the current H-E-B session, including the active store.',
    {},
    async () => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      const session = client.session;
      const storeId = session.cookies?.CURR_SESSION_STORE;
      
      const status = [
        `**Session Status**`,
        `Store ID: ${storeId ?? 'Not Set'}`,
        `Session Valid: ${isSessionValid(session) ? 'Yes' : 'No'}`,
        session.expiresAt ? `Expires At: ${session.expiresAt.toLocaleString()}` : null,
      ].filter(Boolean).join('\n');

      return {
        content: [{ type: 'text', text: status }],
      };
    }
  );


  // ─────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'search_products',
    'Search for products in the H-E-B catalog',
    {
      query: z.string().describe('Search query (e.g., "cinnamon rolls", "milk")'),
      limit: z.number().min(1).max(20).optional().describe('Max results to return (default: 20)'),
    },
    async ({ query, limit }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const results = await client.search(query);
        const requestedLimit = limit ?? 20;
        const products = results.products.slice(0, requestedLimit);

        if (products.length === 0) {
          return {
            content: [{ type: 'text', text: `No products found for "${query}"` }],
          };
        }

        const formatted = products.map((p, i) => 
          `${i + 1}. ${p.name} (ID: ${p.productId})`
        ).join('\n');

        return {
          content: [{ 
            type: 'text', 
            text: `Found ${products.length} products:\n\n${formatted}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'get_buy_it_again',
    'Get previously purchased products ("Buy It Again").',
    {
      limit: z.number().min(1).max(20).optional().describe('Max results to return (default: 20)'),
    },
    async ({ limit }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const results = await client.getBuyItAgain({ limit });
        const requestedLimit = limit ?? 20;
        const products = results.products.slice(0, requestedLimit);

        if (products.length === 0) {
          return {
            content: [{ type: 'text', text: `No "Buy It Again" products found.` }],
          };
        }

        const formatted = products.map((p, i) => 
          `${i + 1}. ${p.name} (ID: ${p.productId})`
        ).join('\n');

        return {
          content: [{ 
            type: 'text', 
            text: `Found ${products.length} "Buy It Again" products:\n\n${formatted}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get "Buy It Again" products: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Product Details
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'get_product',
    'Get detailed information about a specific product',
    {
      product_id: z.string().describe('Product ID from search results'),
    },
    async ({ product_id }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const product = await client.getProduct(product_id);

        const details = [
          `**${product.name}**`,
          product.brand ? `Brand: ${product.brand}` : null,
          product.price ? `Price: ${product.price.formatted}` : null,
          product.inStock !== undefined ? `In Stock: ${product.inStock ? 'Yes' : 'No'}` : null,
          product.description ? `\nDescription: ${product.description}` : null,
          product.nutrition?.calories ? `\nNutrition: ${product.nutrition.calories} cal` : null,
          `\nSKU ID: ${product.skuId}`,
        ].filter(Boolean).join('\n');

        return {
          content: [{ type: 'text', text: details }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get product: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Cart Operations
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'add_to_cart',
    'Add a product to the cart or update its quantity',
    {
      product_id: z.string().describe('Product ID'),
      quantity: z.number().min(1).max(99).describe('Quantity to set'),
      sku_id: z.string().optional().describe('SKU ID (auto-fetched if not provided)'),
    },
    async ({ product_id, quantity, sku_id }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const cartResult = await client.addToCart(product_id, sku_id, quantity);

        if (!cartResult.success) {
          return {
            content: [{ type: 'text', text: `Failed to add to cart: ${cartResult.errors?.join(', ') ?? 'Unknown error'}` }],
            isError: true,
          };
        }

        return {
          content: [{ 
            type: 'text', 
            text: `Added to cart! Cart now has ${cartResult.cart?.itemCount ?? 0} items. Subtotal: ${cartResult.cart?.subtotal?.formatted ?? 'Unknown'}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Cart operation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'update_cart_item',
    'Update the quantity of an item already in the cart',
    {
      product_id: z.string().describe('Product ID'),
      sku_id: z.string().optional().describe('SKU ID (auto-fetched if not provided)'),
      quantity: z.number().min(0).max(99).describe('New quantity (0 to remove)'),
    },
    async ({ product_id, sku_id, quantity }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const cartResult = await client.updateCartItem(product_id, sku_id, quantity);

        if (!cartResult.success) {
          return {
            content: [{ type: 'text', text: `Failed to update cart: ${cartResult.errors?.join(', ') ?? 'Unknown error'}` }],
            isError: true,
          };
        }

        return {
          content: [{ 
            type: 'text', 
            text: `Updated! Cart has ${cartResult.cart?.itemCount ?? 0} items. Subtotal: ${cartResult.cart?.subtotal?.formatted ?? 'Unknown'}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'remove_from_cart',
    'Remove an item from the cart',
    {
      product_id: z.string().describe('Product ID'),
      sku_id: z.string().describe('SKU ID'),
    },
    async ({ product_id, sku_id }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const cartResult = await client.removeFromCart(product_id, sku_id);

        if (!cartResult.success) {
          return {
            content: [{ type: 'text', text: `Failed to remove: ${cartResult.errors?.join(', ') ?? 'Unknown error'}` }],
            isError: true,
          };
        }

        return {
          content: [{ 
            type: 'text', 
            text: `Removed! Cart has ${cartResult.cart?.itemCount ?? 0} items. Subtotal: ${cartResult.cart?.subtotal?.formatted ?? 'Unknown'}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Remove failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'get_cart',
    'Get the current cart contents with items, prices, and totals',
    {},
    async () => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const cart = await client.getCart();

        if (cart.items.length === 0) {
          return {
            content: [{ type: 'text', text: 'Your cart is empty.' }],
          };
        }

        // Format cart items
        const itemsList = cart.items.map((item, i) => {
          const price = item.price?.formatted ?? 'N/A';
          const brand = item.brand ? `(${item.brand})` : '';
          return `${i + 1}. ${item.name ?? 'Unknown'} ${brand} x${item.quantity} - ${price}`;
        }).join('\n');

        // Format totals
        const totals = [
          `Subtotal: ${cart.subtotal.formatted}`,
          cart.tax ? `Tax: ${cart.tax.formatted}` : null,
          cart.savings ? `Savings: -${cart.savings.formatted}` : null,
          `**Total: ${cart.total.formatted}**`,
        ].filter(Boolean).join('\n');

        // Format fees
        let feesSection = '';
        if (cart.fees.length > 0) {
          const feesList = cart.fees.map(fee => 
            `- ${fee.displayName}: ${fee.amount.formatted}`
          ).join('\n');
          feesSection = `\n\n**Fees:**\n${feesList}`;
        }

        // Format payment groups (if present)
        let paymentSection = '';
        if (cart.paymentGroups.length > 0) {
          const payments = cart.paymentGroups.map(pg => 
            `- ${pg.paymentMethod}${pg.paymentAlias ? ` (${pg.paymentAlias})` : ''}: ${pg.amount.formatted}`
          ).join('\n');
          paymentSection = `\n\n**Payment Methods:**\n${payments}`;
        }

        return {
          content: [{ 
            type: 'text', 
            text: `**Cart (${cart.itemCount} items)**\n\n${itemsList}\n\n${totals}${feesSection}${paymentSection}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get cart: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );



  // ─────────────────────────────────────────────────────────────
  // Orders
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'get_order_history',
    'Get past order history to see what the user has bought before.',
    {
      page: z.number().min(1).optional().describe('Page number (default: 1)'),
    },
    async ({ page }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const history = await client.getOrders({ page }) as OrderHistoryResponse;
        const orders = history.pageProps?.orders ?? [];

        if (orders.length === 0) {
          return {
            content: [{ type: 'text', text: 'No past orders found.' }],
          };
        }

        const formatted = orders.map(order => {
          const orderDate = order.orderTimeslot?.startTime ?? order.orderTimeslot?.startDateTime;
          const dateText = orderDate ? new Date(orderDate).toLocaleDateString() : 'Unknown date';
          const totalText = order.totalPrice?.formattedAmount ?? (order as any)?.priceDetails?.total?.formattedAmount ?? 'Unknown total';
          const statusText = order.orderStatusMessageShort ?? (order as any)?.status ?? 'Unknown status';
          return `* Order ID: ${order.orderId} - Date: ${dateText} - Total: ${totalText} (${statusText})`;
        }).join('\n');

        return {
          content: [{ 
            type: 'text', 
            text: `Found ${orders.length} past orders:\n\n${formatted}\n\nUse get_order_details(order_id) to see specific items.` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get order history: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'get_order_details',
    'Get specific items and details for a past order.',
    {
      order_id: z.string().describe('Order ID from order history'),
    },
    async ({ order_id }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const order = await client.getOrder(order_id) as OrderDetailsResponse;
        const pageOrder = order.page?.pageProps?.order;
        const graphOrder = order.graphql?.data?.orderDetailsRequest?.order;

        const items = (graphOrder?.orderItems ?? []).map(item => {
          const price = typeof item.totalUnitPrice?.amount === 'number'
            ? `$${(item.totalUnitPrice.amount / 100).toFixed(2)}`
            : 'Unknown price';
          const name = item.product.fullDisplayName ?? (item.product as any).displayName ?? (item.product as any).name ?? 'Unknown item';
          return `- ${name} (Qty: ${item.quantity}, Price: ${price}) (ID: ${item.product.id})`;
        }).join('\n');

        const orderIdText = pageOrder?.orderId ?? graphOrder?.orderId ?? order_id;
        const statusText = pageOrder?.status ?? graphOrder?.status ?? (graphOrder as any)?.orderStatusMessageShort ?? 'Unknown status';
        const totalText = pageOrder?.priceDetails?.total?.formattedAmount
          ?? graphOrder?.priceDetails?.total?.formattedAmount
          ?? 'Unknown total';

        const details = [
          `**Order ${orderIdText}**`,
          `Status: ${statusText}`,
          `Total: ${totalText}`,
          items ? `Items:\n${items}` : 'Items: No items found.'
        ].join('\n');

        return {
          content: [{ type: 'text', text: details }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get order details: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Account
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'get_account_details',
    'Get the current user\'s account profile details including name, email, phone, and saved addresses.',
    {},
    async () => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const account = await client.getAccountDetails();

        const addressList = account.addresses.length > 0
          ? account.addresses.map((a: { isDefault?: boolean; nickname?: string; address1: string; address2?: string; city: string; state: string; postalCode: string }, i: number) => {
              const defaultTag = a.isDefault ? ' (Default)' : '';
              const nickname = a.nickname ? ` "${a.nickname}"` : '';
              return `${i + 1}.${nickname}${defaultTag} ${a.address1}${a.address2 ? `, ${a.address2}` : ''}, ${a.city}, ${a.state} ${a.postalCode}`;
            }).join('\n')
          : 'No saved addresses';

        const details = [
          `**Account Profile**`,
          `Name: ${account.firstName} ${account.lastName}`,
          `Email: ${account.email}`,
          account.phone ? `Phone: ${account.phone}` : null,
          account.dateOfBirth ? `Date of Birth: ${account.dateOfBirth}` : null,
          account.memberSince ? `Member Since: ${account.memberSince}` : null,
          account.loyaltyNumber ? `Loyalty #: ${account.loyaltyNumber}` : null,
          `\n**Saved Addresses:**\n${addressList}`,
        ].filter(Boolean).join('\n');

        return {
          content: [{ type: 'text', text: details }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get account details: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Homepage
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'get_homepage',
    'Get the H-E-B homepage content including banners, promotions, deals, and featured products',
    {},
    async () => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const homepage = await client.getHomepage();

        const parts: string[] = ['**H-E-B Homepage**'];

        // Banners
        if (homepage.banners.length > 0) {
          parts.push(`\n**Banners (${homepage.banners.length}):**`);
          homepage.banners.slice(0, 5).forEach((b, i) => {
            parts.push(`${i + 1}. ${b.title ?? 'Untitled'}${b.linkUrl ? ` - ${b.linkUrl}` : ''}`);
          });
          if (homepage.banners.length > 5) {
            parts.push(`... and ${homepage.banners.length - 5} more`);
          }
        }

        // Promotions
        if (homepage.promotions.length > 0) {
          parts.push(`\n**Promotions (${homepage.promotions.length}):**`);
          homepage.promotions.slice(0, 5).forEach((p, i) => {
            parts.push(`${i + 1}. ${p.title}${p.description ? ` - ${p.description}` : ''}`);
          });
          if (homepage.promotions.length > 5) {
            parts.push(`... and ${homepage.promotions.length - 5} more`);
          }
        }

        // Featured Products
        if (homepage.featuredProducts.length > 0) {
          parts.push(`\n**Featured Products (${homepage.featuredProducts.length}):**`);
          homepage.featuredProducts.slice(0, 5).forEach((p, i) => {
            const price = p.priceFormatted ?? '';
            parts.push(`${i + 1}. ${p.name}${p.brand ? ` (${p.brand})` : ''} ${price} (ID: ${p.productId})`);
          });
          if (homepage.featuredProducts.length > 5) {
            parts.push(`... and ${homepage.featuredProducts.length - 5} more`);
          }
        }

        // Sections summary
        if (homepage.sections.length > 0) {
          parts.push(`\n**Content Sections (${homepage.sections.length}):**`);
          homepage.sections.forEach((s, i) => {
            parts.push(`${i + 1}. ${s.title ?? s.type} (${s.itemCount} items)`);
          });
        }

        if (parts.length === 1) {
          parts.push('\nNo homepage content found.');
        }

        return {
          content: [{ type: 'text', text: parts.join('\n') }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get homepage: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Delivery Slots
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'get_delivery_slots',
    'Get available delivery time slots. NOTE: This tool requires a valid address to fetch slots.',
    {
      street: z.string().describe('Street address (e.g. "123 Main St")'),
      city: z.string().describe('City'),
      state: z.string().length(2).describe('State code (e.g. "TX")'),
      zip: z.string().describe('Zip code'),
      days: z.number().optional().describe('Number of days to fetch (default: 14)'),
    },
    async ({ street, city, state, zip, days }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const slots = await client.getDeliverySlots({
          address: {
            address1: street,
            city,
            state,
            postalCode: zip,
          },
          days,
        });

        if (slots.length === 0) {
          return {
            content: [{ type: 'text', text: 'No delivery slots found.' }],
          };
        }

        const formatted = slots.map((s: any) => {
          const status = s.isAvailable ? 'AVAILABLE' : 'FULL';
          const fee = s.fee > 0 ? `$${s.fee.toFixed(2)}` : 'FREE';
          return `- [${status}] ${s.date.toLocaleDateString()} ${s.startTime} - ${s.endTime} (${fee}) (ID: ${s.slotId})`;
        }).join('\n');

        return {
          content: [{ type: 'text', text: `Found ${slots.length} slots:\n\n${formatted}` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get delivery slots: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'reserve_slot',
    'Reserve a specific delivery time slot',
    {
      slot_id: z.string().describe('Slot ID from get_delivery_slots'),
      day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date of the slot (YYYY-MM-DD)'),
      store_id: z.string().describe('Store ID'),
      street: z.string().describe('Delivery Street Address'),
      city: z.string().describe('Delivery City'),
      state: z.string().length(2).describe('Delivery State (TX)'),
      zip: z.string().describe('Delivery Zip Code'),
      nickname: z.string().optional().describe('Address Nickname (optional)'),
    },
    async ({ slot_id, day, store_id, street, city, state, zip, nickname }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const res = await client.reserveSlot(
          slot_id,
          day,
          {
            address1: street,
            city,
            state,
            postalCode: zip,
            nickname
          },
          store_id
        );

        const deadlineInfo = res.deadlineMessage 
          ? `\n\n⏰ ${res.deadlineMessage}` 
          : '';

        return {
          content: [{ 
            type: 'text', 
            text: `Successfully reserved delivery slot!${deadlineInfo}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Reservation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Curbside Pickup Slots
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'get_curbside_slots',
    'Get available curbside pickup time slots for a store',
    {
      store_id: z.string().describe('Store ID (e.g. "790" for Plano)'),
      days: z.number().optional().describe('Number of days to fetch (default: 14)'),
    },
    async ({ store_id, days }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const slots = await client.getCurbsideSlots({
          storeNumber: parseInt(store_id, 10),
          days,
        });

        if (slots.length === 0) {
          return {
            content: [{ type: 'text', text: 'No curbside pickup slots found.' }],
          };
        }

        const formatted = slots.map((s: any) => {
          const status = s.isAvailable ? 'AVAILABLE' : 'FULL';
          const fee = s.fee > 0 ? `$${s.fee.toFixed(2)}` : 'FREE';
          return `- [${status}] ${s.date.toLocaleDateString()} ${s.startTime} - ${s.endTime} (${fee}) (ID: ${s.slotId})`;
        }).join('\n');

        return {
          content: [{ type: 'text', text: `Found ${slots.length} curbside slots:\n\n${formatted}` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get curbside slots: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'reserve_curbside_slot',
    'Reserve a curbside pickup time slot',
    {
      slot_id: z.string().describe('Slot ID from get_curbside_slots'),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date of the slot (YYYY-MM-DD)'),
      store_id: z.string().describe('Store ID'),
    },
    async ({ slot_id, date, store_id }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const res = await client.reserveCurbsideSlot(
          slot_id,
          date,
          store_id
        );

        const deadlineInfo = res.deadlineMessage 
          ? `\n\n⏰ ${res.deadlineMessage}` 
          : '';

        return {
          content: [{ 
            type: 'text', 
            text: `Successfully reserved curbside slot!${deadlineInfo}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Curbside reservation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Shopping Lists
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'get_shopping_lists',
    'Get all shopping lists for the current user',
    {},
    async () => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const lists = await client.getShoppingLists();

        if (lists.length === 0) {
          return {
            content: [{ type: 'text', text: 'No shopping lists found.' }],
          };
        }

        const formatted = lists.map((list: { id: string; name: string; itemCount: number; updatedAt?: Date }, i: number) => {
          const itemCount = list.itemCount ?? 0;
          const updated = list.updatedAt ? ` (updated ${list.updatedAt.toLocaleDateString()})` : '';
          return `${i + 1}. ${list.name} - ${itemCount} items${updated} (ID: ${list.id})`;
        }).join('\n');

        return {
          content: [{ 
            type: 'text', 
            text: `Found ${lists.length} shopping lists:\n\n${formatted}\n\nUse get_shopping_list(list_id) to see items.` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get shopping lists: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'get_shopping_list',
    'Get items in a specific shopping list',
    {
      list_id: z.string().describe('Shopping list ID from get_shopping_lists'),
    },
    async ({ list_id }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const list = await client.getShoppingList(list_id);

        if (list.items.length === 0) {
          return {
            content: [{ type: 'text', text: `Shopping list "${list.name}" is empty.` }],
          };
        }

        const itemsList = list.items.map((item: { productId: string; name: string; checked: boolean; price: { total: number } }, i: number) => {
          const priceStr = item.price?.total ? ` - $${item.price.total.toFixed(2)}` : '';
          const checked = item.checked ? ' [x]' : ' [ ]';
          return `${i + 1}.${checked} ${item.name}${priceStr} (ID: ${item.productId})`;
        }).join('\n');

        return {
          content: [{ 
            type: 'text', 
            text: `**${list.name}** (${list.items.length} items)\n\n${itemsList}` 
          }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to get shopping list: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Store Selection
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'search_stores',
    'Search for H-E-B stores by name, city, or zip code',
    {
      query: z.string().describe('Search query (e.g. "Allen", "75002", "Austin")'),
    },
    async ({ query }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        // Access internal session for searchStores
        const stores = await client.searchStores(query);

        if (stores.length === 0) {
          return {
            content: [{ type: 'text', text: `No stores found for "${query}"` }],
          };
        }

        const formatted = stores.map((s: any) => 
          `- [${s.storeNumber}] ${s.name} (${s.address.city}, ${s.address.zip}) - ${s.distanceMiles?.toFixed(1) ?? '?'} miles`
        ).join('\n');

        return {
          content: [{ type: 'text', text: `Found ${stores.length} stores:\n\n${formatted}\n\nUse set_store(storeId) to select one.` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Store search failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  // ─────────────────────────────────────────────────────────────
  // Weekly Ad
  // ─────────────────────────────────────────────────────────────

  server.tool(
    'get_weekly_ad',
    'Get products from the current store\'s weekly ad flyer.',
    {
      limit: z.number().min(1).max(100).optional().describe('Max results to return (default: 20)'),
      category_id: z.string().optional().describe('Filter by category ID (e.g. "490020"). Use get_weekly_ad_categories to find IDs.'),
      store_id: z.string().optional().describe('Override the current store ID (e.g. "796")'),
      page_cursor: z.string().optional().describe('Cursor for pagination'),
    },
    async ({ limit, category_id, store_id, page_cursor }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const adResults = await client.getWeeklyAdProducts({
          limit: limit ?? 20,
          category: category_id,
          storeCode: store_id,
          cursor: page_cursor,
        });

        if (adResults.products.length === 0) {
          return {
            content: [{ type: 'text', text: 'No products found in the weekly ad matching your filters.' }],
          };
        }

        const productsList = adResults.products.map((p, i) => {
          const price = p.priceText ? ` - ${p.priceText}` : '';
          const savings = p.saleStory ? ` (${p.saleStory})` : '';
          return `${i + 1}. ${p.name}${price}${savings} (ID: ${p.id}, UPC: ${p.upc ?? 'N/A'})`;
        }).join('\n');

        const summary = [
          `**Weekly Ad (${adResults.storeCode})**`,
          adResults.validFrom && adResults.validTo ? `Valid: ${adResults.validFrom} to ${adResults.validTo}` : null,
          `Showing ${adResults.products.length} of ${adResults.totalCount} products.`,
          adResults.cursor ? `Next Cursor: ${adResults.cursor}` : null,
          `\n${productsList}`,
        ].filter(Boolean).join('\n');

        return {
          content: [{ type: 'text', text: summary }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to fetch weekly ad: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'get_weekly_ad_categories',
    'Get available categories for the weekly ad to use as filters.',
    {
      store_id: z.string().optional().describe('Override the current store ID (e.g. "796")'),
    },
    async ({ store_id }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        const adResults = await client.getWeeklyAdProducts({
          storeCode: store_id,
          limit: 0, // Just fetch metadata
        });

        const categoriesList = adResults.categories.map(c => 
          `- ${c.name} (ID: ${c.id}) - ${c.count} items`
        ).join('\n');

        const info = [
          `**Weekly Ad Categories (${adResults.storeCode})**`,
          adResults.validFrom && adResults.validTo ? `Valid: ${adResults.validFrom} to ${adResults.validTo}` : null,
          `Total Products: ${adResults.totalCount}`,
          `\n**Available Categories:**\n${categoriesList || 'None'}`,
        ].filter(Boolean).join('\n');

        return {
          content: [{ type: 'text', text: info }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to fetch weekly ad categories: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'set_store',
    'Set the active store for the session',
    {
      store_id: z.string().describe('Store ID (e.g. "796")'),
    },
    async ({ store_id }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        await client.setStore(store_id);
        
        if (options.saveSession) {
          await options.saveSession(client.session);
        } else if (options.saveCookies) {
          await options.saveCookies(client.session.cookies);
        } else if (client.session.authMode !== 'bearer') {
          // Persist to file to trigger reload and save state
          saveSessionToFile(client.session.cookies);
        }

        return {
          content: [{ type: 'text', text: `Store set to ${store_id}. Session updated and saved.` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to set store: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'set_shopping_context',
    'Set the active shopping context for the session (e.g. Curbside, Delivery, In-Store)',
    {
      context: z.enum(['CURBSIDE_PICKUP', 'DELIVERY', 'IN_STORE']).describe('Shopping context to set'),
    },
    async ({ context }) => {
      const result = requireClient(getClient);
      if ('error' in result) return result.error;
      const { client } = result;

      try {
        client.setShoppingContext(context);
        
        if (options.saveSession) {
          await options.saveSession(client.session);
        } else if (options.saveCookies) {
          await options.saveCookies(client.session.cookies);
        } else if (client.session.authMode !== 'bearer') {
          saveSessionToFile(client.session.cookies);
        }

        return {
          content: [{ type: 'text', text: `Shopping context set to ${context}.` }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Failed to set shopping context: ${error instanceof Error ? error.message : 'Unknown error'}` }],
          isError: true,
        };
      }
    }
  );
}
