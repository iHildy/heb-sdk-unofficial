/**
 * MCP Tool definitions for H-E-B grocery API.
 *
 * Each tool wraps functionality from the heb-client library.
 * Tools resolve the client lazily at call time to support hot-reload.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type HEBClient, type HEBCookies, type HEBSession, type ShoppingContext, formatter } from 'heb-client';
import { z } from 'zod';
import { getSessionStatus, saveSessionToFile } from './session.js';

type ClientGetter = () => HEBClient | null;

type ToolOptions = {
  saveCookies?: (cookies: HEBCookies) => Promise<void> | void;
  saveSession?: (session: HEBSession) => Promise<void> | void;
  sessionStatusSource?: string;
};

function requireClient(
  getClient: ClientGetter,
):
  | { client: HEBClient }
  | { error: { content: [{ type: "text"; text: string }]; isError: true } } {
  const client = getClient();
  if (!client) {
    return {
      error: {
        content: [
          {
            type: "text",
            text: "No valid HEB session. Link HEB OAuth or set HEB_SAT/HEB_REESE84 env vars.",
          },
        ],
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
export function registerTools(
  server: McpServer,
  getClient: ClientGetter,
  options: ToolOptions = {},
): void {
  // ─────────────────────────────────────────────────────────────
  // Session & Context
  // ─────────────────────────────────────────────────────────────

  server.resource(
    "session_status",
    "session://status",
    {
      description:
        "Contains info about the current login session and active store",
    },
    async (uri: any) => {
      const result = requireClient(getClient);
      if ("error" in result) {
        return {
          contents: [
            {
              uri: uri.href,
              text: "No valid HEB session found.",
            },
          ],
        };
      }
      const { client } = result;
      const status = getSessionStatus(client.session, {
        source: options.sessionStatusSource,
      });
      return {
        contents: [
          {
            uri: uri.href,
            text: status,
          },
        ],
      };
    },
  );

  server.tool(
    "get_session_info",
    "Get information about the current H-E-B session, including the active store.",
    {},
    async () => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      const info = client.getSessionInfo();

      const status = [
        `**Session Status**`,
        `Store ID: ${info.storeId}`,
        `Shopping Context: ${info.shoppingContext}`,
        `Session Valid: ${info.isValid ? "Yes" : "No"}`,
        info.expiresAt
          ? `Expires At: ${info.expiresAt.toLocaleString()}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      return {
        content: [{ type: "text", text: status }],
      };
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "search_products",
    "Search for products in the H-E-B catalog",
    {
      query: z
        .string()
        .describe('Search query (e.g., "cinnamon rolls", "milk")'),
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe("Max results to return (default: 20)"),
    },
    async ({ query, limit }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const results = await client.search(query);
        const requestedLimit = limit ?? 20;
        const products = results.products.slice(0, requestedLimit);

        if (products.length === 0) {
          return {
            content: [
              { type: "text", text: `No products found for "${query}"` },
            ],
          };
        }

        const formatted = products.map((p, i) => formatter.productListItem(p, i)).join('\n');

        return {
          content: [
            {
              type: "text",
              text: `Found ${products.length} products:\n\n${formatted}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_buy_it_again",
    'Get previously purchased products ("Buy It Again"). Use this instead of searching shopping lists for recently bought items. This tool returns the specific "Buy It Again" products from the user history, not a shopping list.',
    {
      limit: z
        .number()
        .min(1)
        .max(20)
        .optional()
        .describe("Max results to return (default: 20)"),
    },
    async ({ limit }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const results = await client.getBuyItAgain({ limit });
        const requestedLimit = limit ?? 20;
        const products = results.products.slice(0, requestedLimit);

        if (products.length === 0) {
          return {
            content: [
              { type: "text", text: `No "Buy It Again" products found.` },
            ],
          };
        }

        const formatted = products.map((p, i) => formatter.productListItem(p, i)).join('\n');

        return {
          content: [
            {
              type: "text",
              text: `Found ${products.length} "Buy It Again" products:\n\n${formatted}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get "Buy It Again" products: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Product Details
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "get_product",
    "Get detailed information about a specific product",
    {
      product_id: z.string().describe("Product ID from search results"),
    },
    async ({ product_id }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const product = await client.getProduct(product_id);
        const details = formatter.productDetails(product);

        return {
          content: [{ type: "text", text: details }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get product: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Cart Operations
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "add_to_cart",
    "Add a product to the cart or update its quantity",
    {
      product_id: z.string().describe("Product ID"),
      quantity: z.number().min(1).max(99).describe("Quantity to set"),
      sku_id: z
        .string()
        .optional()
        .describe("SKU ID (auto-fetched if not provided)"),
    },
    async ({ product_id, quantity, sku_id }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const cartResult = await client.addToCart(product_id, sku_id, quantity);

        if (!cartResult.success) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to add to cart: ${cartResult.errors?.join(", ") ?? "Unknown error"}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Updated cart! Cart now has ${cartResult.cart?.itemCount ?? 0} items. Subtotal: ${cartResult.cart?.subtotal?.formatted ?? "Unknown"}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Cart operation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "update_cart_item",
    "Update the quantity of an item already in the cart",
    {
      product_id: z.string().describe("Product ID"),
      sku_id: z
        .string()
        .optional()
        .describe("SKU ID (auto-fetched if not provided)"),
      quantity: z
        .number()
        .min(0)
        .max(99)
        .describe("New quantity (0 to remove)"),
    },
    async ({ product_id, sku_id, quantity }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const cartResult = await client.updateCartItem(
          product_id,
          sku_id,
          quantity,
        );

        if (!cartResult.success) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to update cart: ${cartResult.errors?.join(", ") ?? "Unknown error"}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Updated! Cart has ${cartResult.cart?.itemCount ?? 0} items. Subtotal: ${cartResult.cart?.subtotal?.formatted ?? "Unknown"}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Update failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "remove_from_cart",
    "Remove an item from the cart",
    {
      product_id: z.string().describe("Product ID"),
      sku_id: z.string().describe("SKU ID"),
    },
    async ({ product_id, sku_id }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const cartResult = await client.removeFromCart(product_id, sku_id);

        if (!cartResult.success) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to remove: ${cartResult.errors?.join(", ") ?? "Unknown error"}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Removed! Cart has ${cartResult.cart?.itemCount ?? 0} items. Subtotal: ${cartResult.cart?.subtotal?.formatted ?? "Unknown"}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Remove failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_cart",
    "Get the current cart contents with items, prices, and totals",
    {},
    async () => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const cart = await client.getCart();

        if (cart.items.length === 0) {
          return {
            content: [{ type: "text", text: "Your cart is empty." }],
          };
        }

        return {
          content: [{ 
            type: 'text', 
            text: formatter.cart(cart)
          }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get cart: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Orders
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "get_order_history",
    "Get past order history to see what the user has bought before.",
    {
      page: z.number().min(1).optional().describe("Page number (default: 1)"),
    },
    async ({ page }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const history = await client.getOrders({ page });
        const orders = history.pageProps?.orders ?? [];

        if (orders.length === 0) {
          return {
            content: [{ type: "text", text: "No past orders found." }],
          };
        }

        return {
          content: [{ 
            type: 'text', 
            text: formatter.orderHistory(orders) 
          }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get order history: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_order_details",
    "Get specific items and details for a past order.",
    {
      order_id: z.string().describe("Order ID from order history"),
    },
    async ({ order_id }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const order = await client.getOrder(order_id);
        const pageOrder = order.page?.pageProps?.order;

        if (!pageOrder) {
            throw new Error('Order details not found');
        }

        return {
          content: [{ type: 'text', text: formatter.orderDetails(pageOrder) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get order details: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Account
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "get_account_details",
    "Get the current user's account profile details including name, email, phone, and saved addresses.",
    {},
    async () => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const account = await client.getAccountDetails();

        return {
          content: [{ type: 'text', text: formatter.account(account) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get account details: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Homepage
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "get_homepage",
    `Get the H-E-B homepage content including banners, promotions, deals, and featured products.

⚠️ WARNING: This tool returns VERY LONG output by default (300+ products, 25+ sections with 30 items each).
BEFORE calling this tool without filters, STOP and ask the user what they want to see. Suggest options like:
- "Show me just the product carousels" (only_titled: true, include_types: "Carousel")
- "What sections are available?" (items_per_section: 0)
- "Show me deals/savings sections" (include_types: "off,FREE,$")
- "Just show me 5 items per section" (items_per_section: 5)
- "Show everything" (no filters - will be very long)

Only call without filters if the user explicitly requests full/unfiltered homepage content.`,
    {
      max_sections: z
        .number()
        .min(1)
        .optional()
        .describe("Maximum number of content sections to return"),
      items_per_section: z
        .number()
        .min(0)
        .optional()
        .describe(
          "Maximum items per section (0 = no items, just section headers)",
        ),
      include_types: z
        .string()
        .optional()
        .describe(
          'Comma-separated section types to include (e.g., "Carousel,banner"). Partial match.',
        ),
      exclude_types: z
        .string()
        .optional()
        .describe(
          'Comma-separated section types to exclude (e.g., "legalText,NativeExm,Static"). Partial match.',
        ),
      only_titled: z
        .boolean()
        .optional()
        .describe("Only include sections that have a title (default: false)"),
      hide_banners: z
        .boolean()
        .optional()
        .describe("Hide the top-level banners array (default: false)"),
      hide_promotions: z
        .boolean()
        .optional()
        .describe("Hide the top-level promotions array (default: false)"),
      hide_products: z
        .boolean()
        .optional()
        .describe(
          "Hide the top-level featured products array (default: false)",
        ),
    },
    async ({
      max_sections,
      items_per_section,
      include_types,
      exclude_types,
      only_titled,
      hide_banners,
      hide_promotions,
      hide_products,
    }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const homepage = await client.getHomepage({
          maxSections: max_sections,
          maxItemsPerSection: items_per_section,
          includeSectionTypes: include_types
            ? include_types.split(",").map((s) => s.trim())
            : undefined,
          excludeSectionTypes: exclude_types
            ? exclude_types.split(",").map((s) => s.trim())
            : undefined,
          onlyTitledSections: only_titled,
          includeBanners: !hide_banners,
          includePromotions: !hide_promotions,
          includeFeaturedProducts: !hide_products,
        });

        return {
          content: [{ type: 'text', text: formatter.homepage(homepage) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get homepage: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Delivery Slots
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "get_delivery_slots",
    "Get available delivery time slots. NOTE: This tool requires a valid address to fetch slots.",
    {
      street: z.string().describe('Street address (e.g. "123 Main St")'),
      city: z.string().describe("City"),
      state: z.string().length(2).describe('State code (e.g. "TX")'),
      zip: z.string().describe("Zip code"),
      days: z
        .number()
        .optional()
        .describe("Number of days to fetch (default: 14)"),
    },
    async ({ street, city, state, zip, days }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
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
            content: [{ type: "text", text: "No delivery slots found." }],
          };
        }

        return {
          content: [{ type: 'text', text: formatter.deliverySlots(slots, client.session.debug) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get delivery slots: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "reserve_slot",
    "Reserve a specific delivery time slot",
    {
      slot_id: z.string().describe("Slot ID from get_delivery_slots"),
      day: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("Date of the slot (YYYY-MM-DD)"),
      store_id: z.string().describe("Store ID"),
      street: z.string().describe("Delivery Street Address"),
      city: z.string().describe("Delivery City"),
      state: z.string().length(2).describe("Delivery State (TX)"),
      zip: z.string().describe("Delivery Zip Code"),
      nickname: z.string().optional().describe("Address Nickname (optional)"),
    },
    async ({ slot_id, day, store_id, street, city, state, zip, nickname }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
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
            nickname,
          },
          store_id,
        );

        const deadlineInfo = res.deadlineMessage
          ? `\n\n⏰ ${res.deadlineMessage}`
          : "";

        return {
          content: [
            {
              type: "text",
              text: `Successfully reserved delivery slot!${deadlineInfo}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Reservation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Curbside Pickup Slots
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "get_curbside_slots",
    "Get available curbside pickup time slots for a store",
    {
      store_id: z.string().describe('Store ID (e.g. "790" for Plano)'),
      days: z
        .number()
        .optional()
        .describe("Number of days to fetch (default: 14)"),
    },
    async ({ store_id, days }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const slots = await client.getCurbsideSlots({
          storeNumber: parseInt(store_id, 10),
          days,
        });

        if (slots.length === 0) {
          return {
            content: [
              { type: "text", text: "No curbside pickup slots found." },
            ],
          };
        }

        return {
          content: [{ type: 'text', text: formatter.curbsideSlots(slots, client.session.debug) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get curbside slots: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "reserve_curbside_slot",
    "Reserve a curbside pickup time slot",
    {
      slot_id: z.string().describe("Slot ID from get_curbside_slots"),
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("Date of the slot (YYYY-MM-DD)"),
      store_id: z.string().describe("Store ID"),
    },
    async ({ slot_id, date, store_id }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const res = await client.reserveCurbsideSlot(slot_id, date, store_id);

        const deadlineInfo = res.deadlineMessage
          ? `\n\n⏰ ${res.deadlineMessage}`
          : "";

        return {
          content: [
            {
              type: "text",
              text: `Successfully reserved curbside slot!${deadlineInfo}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Curbside reservation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Shopping Lists
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "get_shopping_lists",
    'Get all shopping lists for the current user. Note: This does NOT include "Buy It Again" items; use get_buy_it_again for previously purchased products.',
    {},
    async () => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const lists = await client.getShoppingLists();

        if (lists.length === 0) {
          return {
            content: [{ type: "text", text: "No shopping lists found." }],
          };
        }

        return {
          content: [{ 
            type: 'text', 
            text: formatter.shoppingLists(lists)
          }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get shopping lists: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_shopping_list",
    "Get items in a specific shopping list",
    {
      list_id: z.string().describe("Shopping list ID from get_shopping_lists"),
    },
    async ({ list_id }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const list = await client.getShoppingList(list_id);

        if (list.items.length === 0) {
          return {
            content: [
              { type: "text", text: `Shopping list "${list.name}" is empty.` },
            ],
          };
        }

        return {
          content: [{ 
            type: 'text', 
            text: formatter.shoppingList(list)
          }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get shopping list: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Store Selection
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "search_stores",
    "Search for H-E-B stores by name, city, or zip code",
    {
      query: z
        .string()
        .describe('Search query (e.g. "Allen", "75002", "Austin")'),
    },
    async ({ query }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        // Access internal session for searchStores
        const stores = await client.searchStores(query);

        if (stores.length === 0) {
          return {
            content: [{ type: "text", text: `No stores found for "${query}"` }],
          };
        }

        return {
          content: [{ type: 'text', text: formatter.storeSearch(stores, query) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Store search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Weekly Ad
  // ─────────────────────────────────────────────────────────────

  server.tool(
    "get_weekly_ad",
    "Get products from the current store's weekly ad flyer.",
    {
      limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe("Max results to return (default: 20)"),
      category_id: z
        .string()
        .optional()
        .describe(
          'Filter by category ID (e.g. "490020"). Use get_weekly_ad_categories to find IDs.',
        ),
      store_id: z
        .string()
        .optional()
        .describe('Override the current store ID (e.g. "796")'),
      page_cursor: z.string().optional().describe("Cursor for pagination"),
    },
    async ({ limit, category_id, store_id, page_cursor }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
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
            content: [
              {
                type: "text",
                text: "No products found in the weekly ad matching your filters.",
              },
            ],
          };
        }

        return {
          content: [{ type: 'text', text: formatter.weeklyAd(adResults) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch weekly ad: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_weekly_ad_categories",
    "Get available categories for the weekly ad to use as filters.",
    {
      store_id: z
        .string()
        .optional()
        .describe('Override the current store ID (e.g. "796")'),
    },
    async ({ store_id }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const adResults = await client.getWeeklyAdProducts({
          storeCode: store_id,
          limit: 0, // Just fetch metadata
        });

        return {
          content: [{ type: 'text', text: formatter.weeklyAdCategories(adResults) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch weekly ad categories: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "set_store",
    "Set the active store for the session",
    {
      store_id: z.string().describe('Store ID (e.g. "796")'),
    },
    async ({ store_id }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        await client.setStore(store_id);

        if (options.saveSession) {
          await options.saveSession(client.session);
        } else if (options.saveCookies) {
          await options.saveCookies(client.session.cookies);
        } else if (client.session.authMode !== "bearer") {
          // Persist to file to trigger reload and save state
          saveSessionToFile(client.session.cookies);
        }

        return {
          content: [
            {
              type: "text",
              text: `Store set to ${store_id}. Session updated and saved.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to set store: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "set_shopping_context",
    "Set the active shopping context for the session (Curbside Pickup, Curbside Delivery, or In-Store)",
    {
      context: z
        .enum([
          "CURBSIDE_PICKUP",
          "PICKUP",
          "CURBSIDE_DELIVERY",
          "DELIVERY",
          "EXPLORE_MY_STORE",
          "IN_STORE",
        ])
        .describe(
          "Shopping context. Supported values:\n- DELIVERY (Home Delivery)\n- PICKUP (Curbside Pickup)\n- IN_STORE (Browse In-Store)",
        ),
    },
    async ({ context }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      // Normalize aliases to internal enum values
      const contextMap: Record<string, ShoppingContext> = {
        DELIVERY: "CURBSIDE_DELIVERY",
        CURBSIDE_DELIVERY: "CURBSIDE_DELIVERY",
        PICKUP: "CURBSIDE_PICKUP",
        CURBSIDE_PICKUP: "CURBSIDE_PICKUP",
        IN_STORE: "EXPLORE_MY_STORE",
        EXPLORE_MY_STORE: "EXPLORE_MY_STORE",
      };

      const internalContext = contextMap[context];

      try {
        client.setShoppingContext(internalContext);

        if (options.saveSession) {
          await options.saveSession(client.session);
        } else if (options.saveCookies) {
          await options.saveCookies(client.session.cookies);
        } else if (client.session.authMode !== "bearer") {
          saveSessionToFile(client.session.cookies);
        }

        return {
          content: [
            {
              type: "text",
              text: `Shopping context set to ${internalContext} (input: ${context}).`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to set shopping context: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
