/**
 * MCP Tool definitions for H-E-B grocery API.
 *
 * Each tool wraps functionality from the heb-sdk-unofficial library.
 * Tools resolve the client lazily at call time to support hot-reload.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type HEBClient, type HEBCookies, type HEBSession, type ShoppingContext, formatter } from 'heb-sdk-unofficial';
import { z } from 'zod';
import { getSessionStatus, saveSessionToFile } from './session.js';

type ClientGetter = () => HEBClient | null;

type ToolOptions = {
  saveCookies?: (cookies: HEBCookies) => Promise<void> | void;
  saveSession?: (session: HEBSession) => Promise<void> | void;
  sessionStatusSource?: string;
};

const ResponseFormatSchema = z.enum(['markdown', 'json']);
type ResponseFormat = z.infer<typeof ResponseFormatSchema>;

const responseFormatParam = {
  response_format: ResponseFormatSchema
    .optional()
    .describe('Output format. Markdown is always returned; JSON is included as structuredContent when requested.'),
};

function resolveResponseFormat(format?: ResponseFormat): ResponseFormat {
  return format === 'json' ? 'json' : 'markdown';
}

function buildToolResponse(
  markdown: string,
  data: Record<string, unknown> | undefined,
  responseFormat?: ResponseFormat,
): { content: [{ type: 'text'; text: string }]; structuredContent?: Record<string, unknown> } {
  const format = resolveResponseFormat(responseFormat);
  const contentText = format === 'json' && data !== undefined
    ? `${markdown}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
    : markdown;

  const result: { content: [{ type: 'text'; text: string }]; structuredContent?: Record<string, unknown> } = {
    content: [{ type: 'text', text: contentText }],
  };

  if (data !== undefined) {
    result.structuredContent = data;
  }

  return result;
}

function buildToolError(
  message: string,
  data: Record<string, unknown> | undefined,
  responseFormat?: ResponseFormat,
): { content: [{ type: 'text'; text: string }]; structuredContent?: Record<string, unknown>; isError: true } {
  return {
    ...buildToolResponse(message, data, responseFormat),
    isError: true,
  };
}

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

  server.registerResource(
    "heb_session_status",
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

  server.registerTool(
    "heb_get_session_info",
    {
      title: "Get Session Info",
      description:
        "Get information about the current H-E-B session, including the active store.",
      inputSchema: { ...responseFormatParam },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ response_format }) => {
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

      const data = {
        store_id: info.storeId,
        shopping_context: info.shoppingContext,
        session_valid: info.isValid,
        expires_at: info.expiresAt ? info.expiresAt.toISOString() : null,
      };

      return buildToolResponse(status, data, response_format);
    },
  );

  // ─────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────

  server.registerTool(
    "heb_search_products",
    {
      title: "Search Products",
      description: "Search for products in the H-E-B catalog",
      inputSchema: {
        query: z
          .string()
          .describe('Search query (e.g., "cinnamon rolls", "milk")'),
        limit: z
          .number()
          .min(1)
          .max(20)
          .optional()
          .describe("Max results to return (default: 20)"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ query, limit, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const requestedLimit = limit ?? 20;
        const results = await client.search(query, { limit: requestedLimit });
        const products = results.products.slice(0, requestedLimit);

        const data = {
          query,
          count: products.length,
          total_count: results.totalCount,
          page: results.page,
          has_more: results.hasNextPage,
          facets: results.facets ?? [],
          items: products,
        };

        if (products.length === 0) {
          return buildToolResponse(`No products found for "${query}"`, data, response_format);
        }

        const formatted = products.map((p, i) => formatter.productListItem(p, i)).join('\n');

        return buildToolResponse(
          `Found ${products.length} products:\n\n${formatted}`,
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_get_buy_it_again",
    {
      title: "Get Buy It Again",
      description:
        'Get previously purchased products ("Buy It Again"). Use this instead of searching shopping lists for recently bought items. This tool returns the specific "Buy It Again" products from the user history, not a shopping list.',
      inputSchema: {
        limit: z
          .number()
          .min(1)
          .max(20)
          .optional()
          .describe("Max results to return (default: 20)"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ limit, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const results = await client.getBuyItAgain({ limit });
        const requestedLimit = limit ?? 20;
        const products = results.products.slice(0, requestedLimit);

        const data = {
          count: products.length,
          total_count: results.totalCount,
          page: results.page,
          has_more: results.hasNextPage,
          facets: results.facets ?? [],
          items: products,
        };

        if (products.length === 0) {
          return buildToolResponse('No "Buy It Again" products found.', data, response_format);
        }

        const formatted = products.map((p, i) => formatter.productListItem(p, i)).join('\n');

        return buildToolResponse(
          `Found ${products.length} "Buy It Again" products:\n\n${formatted}`,
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_get_product",
    {
      title: "Get Product",
      description: "Get detailed information about a specific product",
      inputSchema: {
        product_id: z.string().describe("Product ID from search results"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ product_id, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const product = await client.getProduct(product_id);
        const details = formatter.productDetails(product);

        return buildToolResponse(details, { product }, response_format);
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

  server.registerTool(
    "heb_add_to_cart",
    {
      title: "Add To Cart",
      description: "Add a product to the cart or update its quantity",
      inputSchema: {
        product_id: z.string().describe("Product ID"),
        quantity: z.number().min(1).max(99).describe("Quantity to set"),
        sku_id: z
          .string()
          .optional()
          .describe("SKU ID (auto-fetched if not provided)"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ product_id, quantity, sku_id, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const cartResult = await client.addToCart(product_id, sku_id, quantity);
        const data = {
          success: cartResult.success,
          errors: cartResult.errors ?? [],
          cart: cartResult.cart ?? null,
        };

        if (!cartResult.success) {
          return buildToolError(
            `Failed to add to cart: ${cartResult.errors?.join(", ") ?? "Unknown error"}`,
            data,
            response_format,
          );
        }

        return buildToolResponse(
          `Updated cart! Cart now has ${cartResult.cart?.itemCount ?? 0} items. Subtotal: ${cartResult.cart?.subtotal?.formatted ?? "Unknown"}`,
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_update_cart_item",
    {
      title: "Update Cart Item",
      description: "Update the quantity of an item already in the cart",
      inputSchema: {
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
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ product_id, sku_id, quantity, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const cartResult = await client.updateCartItem(
          product_id,
          sku_id,
          quantity,
        );
        const data = {
          success: cartResult.success,
          errors: cartResult.errors ?? [],
          cart: cartResult.cart ?? null,
        };

        if (!cartResult.success) {
          return buildToolError(
            `Failed to update cart: ${cartResult.errors?.join(", ") ?? "Unknown error"}`,
            data,
            response_format,
          );
        }

        return buildToolResponse(
          `Updated! Cart has ${cartResult.cart?.itemCount ?? 0} items. Subtotal: ${cartResult.cart?.subtotal?.formatted ?? "Unknown"}`,
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_remove_from_cart",
    {
      title: "Remove From Cart",
      description: "Remove an item from the cart",
      inputSchema: {
        product_id: z.string().describe("Product ID"),
        sku_id: z.string().describe("SKU ID"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ product_id, sku_id, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const cartResult = await client.removeFromCart(product_id, sku_id);
        const data = {
          success: cartResult.success,
          errors: cartResult.errors ?? [],
          cart: cartResult.cart ?? null,
        };

        if (!cartResult.success) {
          return buildToolError(
            `Failed to remove: ${cartResult.errors?.join(", ") ?? "Unknown error"}`,
            data,
            response_format,
          );
        }

        return buildToolResponse(
          `Removed! Cart has ${cartResult.cart?.itemCount ?? 0} items. Subtotal: ${cartResult.cart?.subtotal?.formatted ?? "Unknown"}`,
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_get_cart",
    {
      title: "Get Cart",
      description: "Get the current cart contents with items, prices, and totals",
      inputSchema: { ...responseFormatParam },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const cart = await client.getCart();
        const { items, ...cartDetails } = cart;
        const data = {
          ...cartDetails,
          items,
          count: items.length,
          total_count: cart.itemCount,
          has_more: cart.isTruncated,
        };

        if (cart.items.length === 0) {
          return buildToolResponse('Your cart is empty.', data, response_format);
        }

        return buildToolResponse(formatter.cart(cart), data, response_format);
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

  server.registerTool(
    "heb_get_order_history",
    {
      title: "Get Order History",
      description: "Get past order history to see what the user has bought before.",
      inputSchema: {
        page: z.number().min(1).optional().describe("Page number (default: 1)"),
        page_size: z
          .number()
          .min(1)
          .max(50)
          .optional()
          .describe("Page size (default: 10)"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ page, page_size, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const history = await client.getOrders({ page, size: page_size });
        const orders = history.pageProps?.orders ?? [];
        const pagination = history.pagination;
        const currentPage = pagination?.page ?? (page ?? 1);
        const pageSize = pagination?.size ?? (page_size ?? 10);
        const hasMore = pagination?.hasMore ?? false;
        const data = {
          page: currentPage,
          page_size: pageSize,
          count: orders.length,
          has_more: hasMore,
          next_page: hasMore ? (pagination?.nextPage ?? currentPage + 1) : null,
          active_count: pagination?.activeCount ?? 0,
          completed_count: pagination?.completedCount ?? 0,
          items: orders,
        };

        if (orders.length === 0) {
          return buildToolResponse('No past orders found.', data, response_format);
        }

        return buildToolResponse(formatter.orderHistory(orders), data, response_format);
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

  server.registerTool(
    "heb_get_order_details",
    {
      title: "Get Order Details",
      description: "Get specific items and details for a past order.",
      inputSchema: {
        order_id: z.string().describe("Order ID from order history"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ order_id, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const order = await client.getOrder(order_id);
        const pageOrder = order.page?.pageProps?.order;

        if (!pageOrder) {
            throw new Error('Order details not found');
        }

        return buildToolResponse(
          formatter.orderDetails(pageOrder),
          { order: pageOrder },
          response_format,
        );
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

  server.registerTool(
    "heb_get_account_details",
    {
      title: "Get Account Details",
      description:
        "Get the current user's account profile details including name, email, phone, and saved addresses.",
      inputSchema: { ...responseFormatParam },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const account = await client.getAccountDetails();

        return buildToolResponse(
          formatter.account(account),
          { account },
          response_format,
        );
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

  server.registerTool(
    "heb_get_homepage",
    {
      title: "Get Homepage",
      description: `Get the H-E-B homepage content including banners, promotions, deals, and featured products.

⚠️ WARNING: This tool returns VERY LONG output by default (300+ products, 25+ sections with 30 items each).
BEFORE calling this tool without filters, STOP and ask the user what they want to see. Suggest options like:
- "Show me just the product carousels" (only_titled: true, include_types: "Carousel")
- "What sections are available?" (items_per_section: 0)
- "Show me deals/savings sections" (include_types: "off,FREE,$")
- "Just show me 5 items per section" (items_per_section: 5)
- "Show everything" (no filters - will be very long)

Only call without filters if the user explicitly requests full/unfiltered homepage content.`,
      inputSchema: {
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
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
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
      response_format,
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

        return buildToolResponse(
          formatter.homepage(homepage),
          { homepage },
          response_format,
        );
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

  server.registerTool(
    "heb_get_delivery_slots",
    {
      title: "Get Delivery Slots",
      description:
        "Get available delivery time slots. NOTE: This tool requires a valid address to fetch slots.",
      inputSchema: {
        street: z.string().describe('Street address (e.g. "123 Main St")'),
        city: z.string().describe("City"),
        state: z.string().length(2).describe('State code (e.g. "TX")'),
        zip: z.string().describe("Zip code"),
        days: z
          .number()
          .optional()
          .describe("Number of days to fetch (default: 14)"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ street, city, state, zip, days, response_format }) => {
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

        const data = {
          count: slots.length,
          total_count: slots.length,
          has_more: false,
          items: slots,
        };

        if (slots.length === 0) {
          return buildToolResponse('No delivery slots found.', data, response_format);
        }

        return buildToolResponse(
          formatter.deliverySlots(slots, client.session.debug),
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_reserve_slot",
    {
      title: "Reserve Delivery Slot",
      description: "Reserve a specific delivery time slot",
      inputSchema: {
        slot_id: z.string().describe("Slot ID from heb_get_delivery_slots"),
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
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ slot_id, day, store_id, street, city, state, zip, nickname, response_format }) => {
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

        const data = {
          success: true,
          slot_id,
          day,
          store_id,
          address: {
            street,
            city,
            state,
            zip,
            nickname: nickname ?? null,
          },
          result: res,
        };

        return buildToolResponse(
          `Successfully reserved delivery slot!${deadlineInfo}`,
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_get_curbside_slots",
    {
      title: "Get Curbside Slots",
      description: "Get available curbside pickup time slots for a store",
      inputSchema: {
        store_id: z.string().describe('Store ID (e.g. "790" for Plano)'),
        days: z
          .number()
          .optional()
          .describe("Number of days to fetch (default: 14)"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ store_id, days, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const slots = await client.getCurbsideSlots({
          storeNumber: parseInt(store_id, 10),
          days,
        });

        const data = {
          store_id,
          count: slots.length,
          total_count: slots.length,
          has_more: false,
          items: slots,
        };

        if (slots.length === 0) {
          return buildToolResponse('No curbside pickup slots found.', data, response_format);
        }

        return buildToolResponse(
          formatter.curbsideSlots(slots, client.session.debug),
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_reserve_curbside_slot",
    {
      title: "Reserve Curbside Slot",
      description: "Reserve a curbside pickup time slot",
      inputSchema: {
        slot_id: z.string().describe("Slot ID from heb_get_curbside_slots"),
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .describe("Date of the slot (YYYY-MM-DD)"),
        store_id: z.string().describe("Store ID"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ slot_id, date, store_id, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const res = await client.reserveCurbsideSlot(slot_id, date, store_id);

        const deadlineInfo = res.deadlineMessage
          ? `\n\n⏰ ${res.deadlineMessage}`
          : "";

        const data = {
          success: true,
          slot_id,
          date,
          store_id,
          result: res,
        };

        return buildToolResponse(
          `Successfully reserved curbside slot!${deadlineInfo}`,
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_get_shopping_lists",
    {
      title: "Get Shopping Lists",
      description:
        'Get all shopping lists for the current user. Note: This does NOT include "Buy It Again" items; use heb_get_buy_it_again for previously purchased products.',
      inputSchema: { ...responseFormatParam },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const listsResult = await client.getShoppingLists();
        const lists = listsResult.lists;
        const pageInfo = listsResult.pageInfo;
        const data = {
          page: pageInfo.page,
          page_size: pageInfo.size,
          total_count: pageInfo.totalCount,
          count: lists.length,
          has_more: pageInfo.hasMore,
          next_page: pageInfo.nextPage ?? null,
          sort: pageInfo.sort,
          sort_direction: pageInfo.sortDirection,
          items: lists,
        };

        if (lists.length === 0) {
          return buildToolResponse('No shopping lists found.', data, response_format);
        }

        return buildToolResponse(
          formatter.shoppingLists(lists),
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_get_shopping_list",
    {
      title: "Get Shopping List",
      description: "Get items in a specific shopping list",
      inputSchema: {
        list_id: z.string().describe("Shopping list ID from heb_get_shopping_lists"),
        page: z.number().min(0).optional().describe("Page number (0-indexed, default: 0)"),
        size: z.number().min(1).max(500).optional().describe("Page size (default: 500)"),
        sort: z
          .enum(['CATEGORY', 'LAST_UPDATED', 'NAME'])
          .optional()
          .describe("Sort field (default: CATEGORY)"),
        sort_direction: z
          .enum(['ASC', 'DESC'])
          .optional()
          .describe("Sort direction (default: ASC)"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ list_id, page, size, sort, sort_direction, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const list = await client.getShoppingList(list_id, {
          page,
          size,
          sort,
          sortDirection: sort_direction,
        });
        const { items, pageInfo: listPageInfo, ...listDetails } = list;
        const currentPage = listPageInfo?.page ?? (page ?? 0);
        const pageSize = listPageInfo?.size ?? (size ?? 500);
        const data = {
          ...listDetails,
          items,
          page: currentPage,
          page_size: pageSize,
          total_count: listPageInfo?.totalCount ?? null,
          has_more: listPageInfo?.hasMore ?? null,
          count: items.length,
        };

        if (items.length === 0) {
          return buildToolResponse(
            `Shopping list "${list.name}" is empty.`,
            data,
            response_format,
          );
        }

        return buildToolResponse(
          formatter.shoppingList(list),
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_search_stores",
    {
      title: "Search Stores",
      description: "Search for H-E-B stores by name, city, or zip code",
      inputSchema: {
        query: z
          .string()
          .describe('Search query (e.g. "Allen", "75002", "Austin")'),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ query, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        // Access internal session for searchStores
        const stores = await client.searchStores(query);

        const data = {
          query,
          count: stores.length,
          total_count: stores.length,
          has_more: false,
          items: stores,
        };

        if (stores.length === 0) {
          return buildToolResponse(`No stores found for "${query}"`, data, response_format);
        }

        return buildToolResponse(
          formatter.storeSearch(stores, query),
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_get_weekly_ad",
    {
      title: "Get Weekly Ad",
      description: "Get products from the current store's weekly ad flyer.",
      inputSchema: {
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
            'Filter by category ID (e.g. "490020"). Use heb_get_weekly_ad_categories to find IDs.',
          ),
        store_id: z
          .string()
          .optional()
          .describe('Override the current store ID (e.g. "796")'),
        page_cursor: z.string().optional().describe("Cursor for pagination"),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ limit, category_id, store_id, page_cursor, response_format }) => {
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

        const data = {
          store_id: adResults.storeCode,
          category_id: category_id ?? null,
          count: adResults.products.length,
          total_count: adResults.totalCount,
          has_more: Boolean(adResults.cursor),
          next_cursor: adResults.cursor ?? null,
          items: adResults.products,
          categories: adResults.categories,
          valid_from: adResults.validFrom ?? null,
          valid_to: adResults.validTo ?? null,
        };

        if (adResults.products.length === 0) {
          return buildToolResponse(
            'No products found in the weekly ad matching your filters.',
            data,
            response_format,
          );
        }

        return buildToolResponse(
          formatter.weeklyAd(adResults),
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_get_weekly_ad_categories",
    {
      title: "Get Weekly Ad Categories",
      description: "Get available categories for the weekly ad to use as filters.",
      inputSchema: {
        store_id: z
          .string()
          .optional()
          .describe('Override the current store ID (e.g. "796")'),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ store_id, response_format }) => {
      const result = requireClient(getClient);
      if ("error" in result) return result.error;
      const { client } = result;

      try {
        const adResults = await client.getWeeklyAdProducts({
          storeCode: store_id,
          limit: 0, // Just fetch metadata
        });

        const data = {
          store_id: adResults.storeCode,
          count: adResults.categories.length,
          total_count: adResults.totalCount,
          has_more: false,
          items: adResults.categories,
        };

        return buildToolResponse(
          formatter.weeklyAdCategories(adResults),
          data,
          response_format,
        );
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

  server.registerTool(
    "heb_set_store",
    {
      title: "Set Store",
      description: "Set the active store for the session",
      inputSchema: {
        store_id: z.string().describe('Store ID (e.g. "796")'),
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ store_id, response_format }) => {
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

        return buildToolResponse(
          `Store set to ${store_id}. Session updated and saved.`,
          { store_id },
          response_format,
        );
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

  server.registerTool(
    "heb_set_shopping_context",
    {
      title: "Set Shopping Context",
      description:
        "Set the active shopping context for the session (Curbside Pickup, Curbside Delivery, or In-Store)",
      inputSchema: {
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
        ...responseFormatParam,
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ context, response_format }) => {
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

        return buildToolResponse(
          `Shopping context set to ${internalContext} (input: ${context}).`,
          { context: internalContext, input: context },
          response_format,
        );
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
