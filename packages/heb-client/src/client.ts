import { addToCart, getCart, quickAdd, removeFromCart, updateCartItem, type Cart, type CartResponse } from './cart.js';
import { getCurbsideSlots, reserveCurbsideSlot, type CurbsideSlot, type GetCurbsideSlotsOptions, type ReserveCurbsideSlotResult } from './curbside.js';
import { getDeliverySlots, reserveSlot, type DeliverySlot, type GetDeliverySlotsOptions, type ReserveSlotResult } from './delivery.js';
import { getOrder, getOrders, type GetOrdersOptions, type Order } from './orders.js';
import { getProductDetails, getProductImageUrl, getProductSkuId, type Product } from './product.js';
import { searchProducts, typeahead, typeaheadTerms, type SearchOptions, type SearchResult, type TypeaheadResult } from './search.js';
import { buildHeaders, fetchBuildId, isSessionValid } from './session.js';
import { searchStores, setStore, type Store } from './stores.js';
import type { Address, HEBSession } from './types.js';

/**
 * Unified HEB API client.
 * 
 * Wraps all API functions with a single session for convenient usage.
 * 
 * @example
 * import { createSessionFromCookies, HEBClient } from 'heb-sdk-unofficial';
 * 
 * // Create session from browser cookies
 * const session = createSessionFromCookies('sat=xxx; reese84=yyy; ...', 'buildId123');
 * 
 * // Create client
 * const heb = new HEBClient(session);
 * 
 * // Search for products
 * await heb.ensureBuildId();
 * const results = await heb.search('cinnamon rolls', { limit: 20 });
 * 
 * // Get product details
 * const product = await heb.getProduct(results.products[0].productId);
 * 
 * // Add to cart
 * await heb.addToCart(product.productId, product.skuId, 2);
 */
export class HEBClient {
  constructor(public session: HEBSession) {}

  /**
   * Check if the session is still valid.
   */
  isValid(): boolean {
    return isSessionValid(this.session);
  }

  /**
   * Ensure the session has a valid buildId.
   * Fetches it if missing.
   */
  async ensureBuildId(): Promise<void> {
    if (this.session.buildId) {
      return;
    }

    try {
      const buildId = await fetchBuildId(this.session.cookies);
      if (buildId) {
        this.session.buildId = buildId;
        this.session.headers = buildHeaders(this.session.cookies, buildId);
      }
    } catch (error) {
      console.warn('Failed to fetch buildId, continuing with unknown version:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Search
  // ─────────────────────────────────────────────────────────────

  /**
   * Search for products using the Next.js data endpoint.
   *
   * Requires a valid buildId on the session (call ensureBuildId first if needed).
   *
   * @param query - Search query
   * @param options - Search options
   *
   * @example
   * const results = await heb.search('cinnamon rolls', { limit: 20 });
   * console.log(`Found ${results.products.length} products`);
   */
  async search(query: string, options?: SearchOptions): Promise<SearchResult> {
    return searchProducts(this.session, query, options);
  }

  /**
   * Get typeahead/autocomplete suggestions.
   * 
   * Returns recent searches and trending searches.
   * Note: These are search terms, not product results.
   * 
   * @example
   * const result = await heb.typeahead('milk');
   * console.log('Recent:', result.recentSearches);
   * console.log('Trending:', result.trendingSearches);
   */
  async typeahead(query: string): Promise<TypeaheadResult> {
    return typeahead(this.session, query);
  }

  /**
   * Get typeahead terms as a flat array.
   * 
   * @deprecated Use typeahead() for categorized results.
   */
  async typeaheadTerms(query: string): Promise<string[]> {
    return typeaheadTerms(this.session, query);
  }

  // ─────────────────────────────────────────────────────────────
  // Products
  // ─────────────────────────────────────────────────────────────

  /**
   * Get full product details.
   * 
   * @example
   * const product = await heb.getProduct('1875945');
   * console.log(product.name);        // H-E-B Bakery Two-Bite Cinnamon Rolls
   * console.log(product.brand);       // H-E-B
   * console.log(product.inStock);     // true
   * console.log(product.nutrition);   // { calories: 210, ... }
   */
  async getProduct(productId: string): Promise<Product> {
    return getProductDetails(this.session, productId);
  }

  /**
   * Get SKU ID for a product.
   */
  async getSkuId(productId: string): Promise<string> {
    return getProductSkuId(this.session, productId);
  }

  /**
   * Get product image URL.
   */
  getImageUrl(productId: string, size?: number): string {
    return getProductImageUrl(productId, size);
  }

  // ─────────────────────────────────────────────────────────────
  // Cart
  // ─────────────────────────────────────────────────────────────

  /**
   * Get the current cart contents.
   * 
   * Returns full cart with items, pricing, payment groups, and fees.
   * 
   * @example
   * const cart = await heb.getCart();
   * console.log(`Cart has ${cart.itemCount} items`);
   * console.log(`Subtotal: ${cart.subtotal.formatted}`);
   * cart.items.forEach(item => console.log(`${item.name} x${item.quantity}`));
   */
  async getCart(): Promise<Cart> {
    return getCart(this.session);
  }

  /**
   * Add or update item in cart.
   * 
   * @param productId - Product ID
   * @param skuId - SKU ID (get from getProduct or getSkuId)
   * @param quantity - Quantity to set (not add)
   * 
   * @example
   * const product = await heb.getProduct('1875945');
   * await heb.addToCart(product.productId, product.skuId, 2);
   */
  async addToCart(productId: string, skuId: string, quantity: number): Promise<CartResponse> {
    return addToCart(this.session, productId, skuId, quantity);
  }

  /**
   * Update cart item quantity.
   */
  async updateCartItem(productId: string, skuId: string, quantity: number): Promise<CartResponse> {
    return updateCartItem(this.session, productId, skuId, quantity);
  }

  /**
   * Remove item from cart.
   */
  async removeFromCart(productId: string, skuId: string): Promise<CartResponse> {
    return removeFromCart(this.session, productId, skuId);
  }

  /**
   * Quick add - set quantity to 1.
   */
  async quickAdd(productId: string, skuId: string): Promise<CartResponse> {
    return quickAdd(this.session, productId, skuId);
  }

  /**
   * Add to cart by product ID only.
   * Fetches SKU ID automatically.
   * 
   * @example
   * // Simplest way to add a product
   * await heb.addToCartById('1875945', 2);
   */
  async addToCartById(productId: string, quantity: number): Promise<CartResponse> {
    const skuId = await this.getSkuId(productId);
    return this.addToCart(productId, skuId, quantity);
  }

  // ─────────────────────────────────────────────────────────────
  // Orders
  // ─────────────────────────────────────────────────────────────

  /**
   * Get order history.
   * 
   * @example
   * const orders = await heb.getOrders({ page: 1 });
   * console.log(`Found ${orders.length} orders`);
   */
  async getOrders(options: GetOrdersOptions = {}): Promise<Order[]> {
    return getOrders(this.session, options);
  }

  /**
   * Get filtered order history.
   * 
   * @param orderId - Order ID
   * @returns Order details
   */
  async getOrder(orderId: string): Promise<Order> {
    return getOrder(this.session, orderId);
  }



  // ─────────────────────────────────────────────────────────────
  // Delivery
  // ─────────────────────────────────────────────────────────────

  /**
   * Get available delivery slots.
   */
  async getDeliverySlots(options: GetDeliverySlotsOptions = {}): Promise<DeliverySlot[]> {
    return getDeliverySlots(this.session, options);
  }

  /**
   * Reserve a delivery slot.
   */
  async reserveSlot(
    slotId: string, 
    date: string, 
    address: Address, 
    storeId: string
  ): Promise<ReserveSlotResult> {
    return reserveSlot(this.session, slotId, date, address, storeId);
  }

  // ─────────────────────────────────────────────────────────────
  // Curbside Pickup
  // ─────────────────────────────────────────────────────────────

  /**
   * Get available curbside pickup slots for a store.
   * 
   * @param options - Options with storeNumber (required)
   * @example
   * const slots = await heb.getCurbsideSlots({ storeNumber: 790 });
   * slots.forEach(s => console.log(`${s.date.toLocaleDateString()} ${s.startTime}-${s.endTime}`));
   */
  async getCurbsideSlots(options: GetCurbsideSlotsOptions): Promise<CurbsideSlot[]> {
    return getCurbsideSlots(this.session, options);
  }

  /**
   * Reserve a curbside pickup slot.
   * 
   * @param slotId - Slot ID from getCurbsideSlots
   * @param date - Date (YYYY-MM-DD)
   * @param storeId - Store ID
   */
  async reserveCurbsideSlot(
    slotId: string,
    date: string,
    storeId: string
  ): Promise<ReserveCurbsideSlotResult> {
    return reserveCurbsideSlot(this.session, slotId, date, storeId);
  }

  // ─────────────────────────────────────────────────────────────
  // Stores
  // ─────────────────────────────────────────────────────────────

  /**
   * Search for H-E-B stores.
   * 
   * @param query - Address, zip, or city (e.g. "78701", "Austin")
   * @example
   * const stores = await heb.searchStores('78701');
   * console.log(`Found ${stores.length} stores`);
   */
  async searchStores(query: string): Promise<Store[]> {
    return searchStores(this.session, query);
  }

  /**
   * Set the active store for the session.
   * 
   * This updates the session cookie and makes a server request to
   * set the fulfillment context.
   * 
   * @param storeId - Store ID (e.g. "790")
   */
  async setStore(storeId: string): Promise<void> {
    return setStore(this.session, storeId);
  }
}
