/**
 * MCP Tool definitions for H-E-B grocery API.
 *
 * Each tool wraps functionality from the heb-client library.
 * Tools resolve the client lazily at call time to support hot-reload.
 */
import { isSessionValid } from 'heb-client';
import { z } from 'zod';
import { getSessionStatus, saveSessionToFile } from './session.js';
/**
 * Helper to require a valid client, returning an error response if missing.
 */
function requireClient(getClient) {
    const client = getClient();
    if (!client) {
        return {
            error: {
                content: [{ type: 'text', text: 'No valid HEB session. Please log in via the browser extension or set HEB_SAT/HEB_REESE84 env vars.' }],
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
export function registerTools(server, getClient) {
    // ─────────────────────────────────────────────────────────────
    // Session & Context
    // ─────────────────────────────────────────────────────────────
    server.resource('session_status', 'session://status', {
        description: 'Contains info about the current login session and active store'
    }, async (uri) => {
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
        const status = getSessionStatus(client.session);
        return {
            contents: [{
                    uri: uri.href,
                    text: status
                }]
        };
    });
    server.tool('get_session_info', 'Get information about the current H-E-B session, including the active store.', {}, async () => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
        const { client } = result;
        const session = client.session;
        const storeId = session.cookies.CURR_SESSION_STORE;
        const status = [
            `**Session Status**`,
            `Store ID: ${storeId ?? 'Not Set'}`,
            `Session Valid: ${isSessionValid(session) ? 'Yes' : 'No'}`,
            session.expiresAt ? `Expires At: ${session.expiresAt.toLocaleString()}` : null,
            session.buildId ? `Build ID: ${session.buildId}` : null,
        ].filter(Boolean).join('\n');
        return {
            content: [{ type: 'text', text: status }],
        };
    });
    // ─────────────────────────────────────────────────────────────
    // Search
    // ─────────────────────────────────────────────────────────────
    server.tool('search_products', 'Search for products in the H-E-B catalog', {
        query: z.string().describe('Search query (e.g., "cinnamon rolls", "milk")'),
        limit: z.number().min(1).max(50).optional().describe('Max results to return (default: 10)'),
    }, async ({ query, limit }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
        const { client } = result;
        try {
            const products = await client.searchSSR(query, limit ?? 10);
            if (products.length === 0) {
                return {
                    content: [{ type: 'text', text: `No products found for "${query}"` }],
                };
            }
            const results = products.map((p, i) => `${i + 1}. ${p.name} (ID: ${p.productId})`).join('\n');
            return {
                content: [{
                        type: 'text',
                        text: `Found ${products.length} products:\n\n${results}`
                    }],
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    // ─────────────────────────────────────────────────────────────
    // Product Details
    // ─────────────────────────────────────────────────────────────
    server.tool('get_product', 'Get detailed information about a specific product', {
        product_id: z.string().describe('Product ID from search results'),
    }, async ({ product_id }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
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
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Failed to get product: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    // ─────────────────────────────────────────────────────────────
    // Cart Operations
    // ─────────────────────────────────────────────────────────────
    server.tool('add_to_cart', 'Add a product to the cart or update its quantity', {
        product_id: z.string().describe('Product ID'),
        quantity: z.number().min(1).max(99).describe('Quantity to set'),
        sku_id: z.string().optional().describe('SKU ID (auto-fetched if not provided)'),
    }, async ({ product_id, quantity, sku_id }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
        const { client } = result;
        try {
            let skuId = sku_id;
            // Auto-fetch SKU if not provided
            if (!skuId) {
                skuId = await client.getSkuId(product_id);
            }
            const cartResult = await client.addToCart(product_id, skuId, quantity);
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
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Cart operation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    server.tool('update_cart_item', 'Update the quantity of an item already in the cart', {
        product_id: z.string().describe('Product ID'),
        sku_id: z.string().describe('SKU ID'),
        quantity: z.number().min(1).max(99).describe('New quantity'),
    }, async ({ product_id, sku_id, quantity }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
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
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Update failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    server.tool('remove_from_cart', 'Remove an item from the cart', {
        product_id: z.string().describe('Product ID'),
        sku_id: z.string().describe('SKU ID'),
    }, async ({ product_id, sku_id }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
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
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Remove failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    // ─────────────────────────────────────────────────────────────
    // Orders (Stub)
    // ─────────────────────────────────────────────────────────────
    server.tool('get_order_history', 'Get past order history to see what the user has bought before.', {
        page: z.number().min(1).optional().describe('Page number (default: 1)'),
    }, async ({ page }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
        const { client } = result;
        try {
            const orders = await client.getOrders({ page });
            if (orders.length === 0) {
                return {
                    content: [{ type: 'text', text: 'No past orders found.' }],
                };
            }
            const formatted = orders.map(o => `* Order ID: ${o.orderId} - Date: ${o.orderDate.toLocaleDateString()} - Total: $${o.total.toFixed(2)} (${o.status})`).join('\n');
            return {
                content: [{
                        type: 'text',
                        text: `Found ${orders.length} past orders:\n\n${formatted}\n\nUse get_order_details(order_id) to see specific items.`
                    }],
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Failed to get order history: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    server.tool('get_order_details', 'Get specific items and details for a past order.', {
        order_id: z.string().describe('Order ID from order history'),
    }, async ({ order_id }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
        const { client } = result;
        try {
            const order = await client.getOrder(order_id);
            const items = order.items.map(item => `- ${item.name} (Qty: ${item.quantity}, Price: $${(item.price / 100).toFixed(2)}) (ID: ${item.productId})`).join('\n');
            const details = [
                `**Order ${order.orderId}**`,
                `Status: ${order.status}`,
                `Total: $${order.total.toFixed(2)}`,
                `Items:\n${items}`
            ].join('\n');
            return {
                content: [{ type: 'text', text: details }],
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Failed to get order details: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    // ─────────────────────────────────────────────────────────────
    // Delivery Slots
    // ─────────────────────────────────────────────────────────────
    server.tool('get_delivery_slots', 'Get available delivery time slots. NOTE: This tool requires a valid address to fetch slots.', {
        street: z.string().describe('Street address (e.g. "123 Main St")'),
        city: z.string().describe('City'),
        state: z.string().length(2).describe('State code (e.g. "TX")'),
        zip: z.string().describe('Zip code'),
        days: z.number().optional().describe('Number of days to fetch (default: 14)'),
    }, async ({ street, city, state, zip, days }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
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
            const formatted = slots.map((s) => {
                const status = s.isAvailable ? 'AVAILABLE' : 'FULL';
                const fee = s.fee > 0 ? `$${s.fee.toFixed(2)}` : 'FREE';
                return `- [${status}] ${s.date.toLocaleDateString()} ${s.startTime} - ${s.endTime} (${fee}) (ID: ${s.slotId})`;
            }).join('\n');
            return {
                content: [{ type: 'text', text: `Found ${slots.length} slots:\n\n${formatted}` }],
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Failed to get delivery slots: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    server.tool('reserve_slot', 'Reserve a specific delivery time slot', {
        slot_id: z.string().describe('Slot ID from get_delivery_slots'),
        day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date of the slot (YYYY-MM-DD)'),
        store_id: z.string().describe('Store ID'),
        street: z.string().describe('Delivery Street Address'),
        city: z.string().describe('Delivery City'),
        state: z.string().length(2).describe('Delivery State (TX)'),
        zip: z.string().describe('Delivery Zip Code'),
        nickname: z.string().optional().describe('Address Nickname (optional)'),
    }, async ({ slot_id, day, store_id, street, city, state, zip, nickname }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
        const { client } = result;
        try {
            const res = await client.reserveSlot(slot_id, day, {
                address1: street,
                city,
                state,
                postalCode: zip,
                nickname
            }, store_id);
            const deadlineInfo = res.deadlineMessage
                ? `\n\n⏰ ${res.deadlineMessage}`
                : '';
            return {
                content: [{
                        type: 'text',
                        text: `Successfully reserved delivery slot!${deadlineInfo}`
                    }],
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Reservation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    // ─────────────────────────────────────────────────────────────
    // Curbside Pickup Slots
    // ─────────────────────────────────────────────────────────────
    server.tool('get_curbside_slots', 'Get available curbside pickup time slots for a store', {
        store_id: z.string().describe('Store ID (e.g. "790" for Plano)'),
        days: z.number().optional().describe('Number of days to fetch (default: 14)'),
    }, async ({ store_id, days }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
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
            const formatted = slots.map((s) => {
                const status = s.isAvailable ? 'AVAILABLE' : 'FULL';
                const fee = s.fee > 0 ? `$${s.fee.toFixed(2)}` : 'FREE';
                return `- [${status}] ${s.date.toLocaleDateString()} ${s.startTime} - ${s.endTime} (${fee}) (ID: ${s.slotId})`;
            }).join('\n');
            return {
                content: [{ type: 'text', text: `Found ${slots.length} curbside slots:\n\n${formatted}` }],
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Failed to get curbside slots: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    server.tool('reserve_curbside_slot', 'Reserve a curbside pickup time slot', {
        slot_id: z.string().describe('Slot ID from get_curbside_slots'),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Date of the slot (YYYY-MM-DD)'),
        store_id: z.string().describe('Store ID'),
    }, async ({ slot_id, date, store_id }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
        const { client } = result;
        try {
            const res = await client.reserveCurbsideSlot(slot_id, date, store_id);
            const deadlineInfo = res.deadlineMessage
                ? `\n\n⏰ ${res.deadlineMessage}`
                : '';
            return {
                content: [{
                        type: 'text',
                        text: `Successfully reserved curbside slot!${deadlineInfo}`
                    }],
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Curbside reservation failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    // ─────────────────────────────────────────────────────────────
    // Store Selection
    // ─────────────────────────────────────────────────────────────
    server.tool('search_stores', 'Search for H-E-B stores by name, city, or zip code', {
        query: z.string().describe('Search query (e.g. "Allen", "75002", "Austin")'),
    }, async ({ query }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
        const { client } = result;
        try {
            // Access internal session for searchStores
            const stores = await client.searchStores(query);
            if (stores.length === 0) {
                return {
                    content: [{ type: 'text', text: `No stores found for "${query}"` }],
                };
            }
            const formatted = stores.map((s) => `- [${s.storeNumber}] ${s.name} (${s.address.city}, ${s.address.zip}) - ${s.distanceMiles?.toFixed(1) ?? '?'} miles`).join('\n');
            return {
                content: [{ type: 'text', text: `Found ${stores.length} stores:\n\n${formatted}\n\nUse set_store(storeId) to select one.` }],
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Store search failed: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
    server.tool('set_store', 'Set the active store for the session', {
        store_id: z.string().describe('Store ID (e.g. "796")'),
    }, async ({ store_id }) => {
        const result = requireClient(getClient);
        if ('error' in result)
            return result.error;
        const { client } = result;
        try {
            await client.setStore(store_id);
            // Persist to file to trigger reload and save state
            saveSessionToFile(client.session.cookies);
            return {
                content: [{ type: 'text', text: `Store set to ${store_id}. Session updated and saved.` }],
            };
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: `Failed to set store: ${error instanceof Error ? error.message : 'Unknown error'}` }],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=tools.js.map