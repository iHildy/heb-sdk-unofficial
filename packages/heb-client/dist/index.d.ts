import { BrowserContext, Page } from 'playwright';

/**
 * Core cookie values required for authenticated HEB requests.
 */
interface HEBCookies {
    /** Session Authentication Token (JWT, HttpOnly) */
    sat: string;
    /** Imperva bot mitigation fingerprint */
    reese84: string;
    /** Imperva session tracking (may have suffix like _1234567) */
    incap_ses: string;
    /** Selected store ID for fulfillment context */
    CURR_SESSION_STORE?: string;
    /** Any additional cookies captured during auth */
    [key: string]: string | undefined;
}
/**
 * Required headers for HEB GraphQL API requests.
 */
interface HEBHeaders {
    'apollographql-client-name': string;
    'apollographql-client-version': string;
    cookie: string;
    'content-type': string;
    [key: string]: string;
}
/**
 * Complete session object with cookies, headers, and metadata.
 */
interface HEBSession {
    cookies: HEBCookies;
    headers: HEBHeaders;
    /** JWT expiration timestamp */
    expiresAt?: Date;
    /** Build ID extracted from site (for x-nextjs-data requests) */
    buildId?: string;
}
/**
 * Login credentials - can be passed directly or read from env.
 */
interface HEBCredentials {
    email: string;
    password: string;
}
/**
 * Options for the login function.
 */
interface LoginOptions {
    /** Run browser in headless mode (default: true) */
    headless?: boolean;
    /** Timeout for login flow in ms (default: 60000) */
    timeout?: number;
    /** Store ID to set after login */
    storeId?: string;
    /**
     * Path to Chrome user data directory to reuse existing profile.
     * Helps bypass bot detection by using a trusted profile.
     * Example: '/Users/you/Library/Application Support/Google/Chrome'
     */
    userDataDir?: string;
}
/**
 * Known GraphQL operation hashes (persisted queries).
 */
interface Address {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    nickname?: string;
}
/**
 * Known GraphQL operation hashes (persisted queries).
 */
declare const GRAPHQL_HASHES: {
    readonly cartItemV2: "ade8ec1365c185244d42f9cc4c13997fec4b633ac3c38ff39558df92b210c6d0";
    readonly typeaheadContent: "1ed956c0f10efcfc375321f33c40964bc236fff1397a4e86b7b53cb3b18ad329";
    readonly ModifiableOrderDetailsRequest: "24fe4f6d8f4d3ae8927af0a7d07b8c57abcb303cdd277cd9bb4e022ca1d33b8e";
    readonly ReserveTimeslot: "8b4800e25b070c15448237c7138530f1e1b3655ad3745a814cd5226c144da524";
    readonly listDeliveryTimeslotsV2: "2085a738c42670ed52a42ab190b1f5ae178bb22ac444838e5d1c810cb6e4bf3c";
    readonly listPickupTimeslotsV2: "7f9e10c23b1415ebf350493414b2e55e18c81c63f0571cf35f8dd155c9f3a9a0";
    readonly StoreSearch: "e01fa39e66c3a2c7881322bc48af6a5af97d49b1442d433f2d09d273de2db4b6";
    readonly SelectPickupFulfillment: "8fa3c683ee37ad1bab9ce22b99bd34315b2a89cfc56208d63ba9efc0c49a6323";
};
/**
 * HEB API endpoints.
 */
declare const ENDPOINTS: {
    readonly graphql: "https://www.heb.com/graphql";
    readonly login: "https://www.heb.com/sign-in";
    readonly home: "https://www.heb.com/";
};

/**
 * Cart item structure.
 */
interface CartItem {
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
interface CartResponse {
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
declare function addToCart(session: HEBSession, productId: string, skuId: string, quantity: number): Promise<CartResponse>;
/**
 * Update cart item quantity.
 * Alias for addToCart - same mutation, just clearer intent.
 */
declare const updateCartItem: typeof addToCart;
/**
 * Remove item from cart by setting quantity to 0.
 *
 * @example
 * await removeFromCart(session, '2996503', '4122077587');
 */
declare function removeFromCart(session: HEBSession, productId: string, skuId: string): Promise<CartResponse>;
/**
 * Quick add - add 1 of an item to cart.
 */
declare function quickAdd(session: HEBSession, productId: string, skuId: string): Promise<CartResponse>;

/**
 * Curbside pickup slot operations.
 *
 * @module curbside
 */

/**
 * A curbside pickup time slot.
 */
interface CurbsideSlot {
    slotId: string;
    date: Date;
    startTime: string;
    endTime: string;
    fee: number;
    isAvailable: boolean;
    raw?: any;
}
/**
 * Options for fetching curbside slots.
 */
interface GetCurbsideSlotsOptions {
    /** Store number (e.g. 790 for Plano) */
    storeNumber: number;
    /** Number of days to fetch (default: 14) */
    days?: number;
}
/**
 * Result of a curbside reservation attempt.
 */
interface ReserveCurbsideSlotResult {
    success: boolean;
    /** Cart/order ID from the reservation */
    orderId?: string;
    /** ISO 8601 timestamp when the reservation expires */
    expiresAt?: string;
    /** Formatted expiry time (e.g., "3:40pm") */
    expiresAtFormatted?: string;
    /** User-friendly deadline message (e.g., "Place your order by 3:40pm to keep this time") */
    deadlineMessage?: string;
    raw?: any;
}
/**
 * Get available curbside pickup slots for a store.
 *
 * @param session - Active HEB session
 * @param options - Slot options with storeNumber
 * @returns Available curbside pickup slots
 */
declare function getCurbsideSlots(session: HEBSession, options: GetCurbsideSlotsOptions): Promise<CurbsideSlot[]>;
/**
 * Reserve a curbside pickup slot.
 *
 * @param session - Active HEB session
 * @param slotId - Slot ID to reserve
 * @param date - Date of the slot (YYYY-MM-DD)
 * @param storeId - Store ID
 * @returns Whether reservation succeeded
 */
declare function reserveCurbsideSlot(session: HEBSession, slotId: string, date: string, storeId: string): Promise<ReserveCurbsideSlotResult>;

/**
 * Delivery slot operations.
 *
 * @module delivery
 */

/**
 * A delivery time slot.
 */
interface DeliverySlot {
    slotId: string;
    date: Date;
    startTime: string;
    endTime: string;
    fee: number;
    isAvailable: boolean;
    raw?: any;
}
/**
 * Options for fetching delivery slots.
 */
interface GetDeliverySlotsOptions {
    /** Store ID (defaults to session store) */
    storeId?: string;
    /** Delivery address */
    address?: Address;
    /** Number of days to fetch (default: 14) */
    days?: number;
}
/**
 * Result of a reservation attempt.
 */
interface ReserveSlotResult {
    success: boolean;
    /** Cart/order ID from the reservation */
    orderId?: string;
    /** ISO 8601 timestamp when the reservation expires */
    expiresAt?: string;
    /** Formatted expiry time (e.g., "3:40pm") */
    expiresAtFormatted?: string;
    /** User-friendly deadline message (e.g., "Place your order by 3:40pm to keep this time") */
    deadlineMessage?: string;
    raw?: any;
}
/**
 * Get available delivery slots.
 *
 * @param session - Active HEB session
 * @param options - Slot options
 * @returns Available delivery slots
 */
declare function getDeliverySlots(session: HEBSession, options?: GetDeliverySlotsOptions): Promise<DeliverySlot[]>;
/**
 * Reserve a delivery slot.
 *
 * @param session - Active HEB session
 * @param slotId - Slot ID to reserve
 * @param date - Date of the slot (YYYY-MM-DD)
 * @param address - Delivery address
 * @param storeId - Store ID
 * @returns Whether reservation succeeded
 */
declare function reserveSlot(session: HEBSession, slotId: string, date: string, address: Address, storeId: string): Promise<ReserveSlotResult>;

/**
 * Order history operations.
 *
 * @module orders
 */

/**
 * Order item from order history.
 */
interface OrderItem {
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
interface Order {
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
interface GetOrdersOptions {
    page?: number;
}
/**
 * Get order history.
 *
 * @param session - Active HEB session
 * @param options - Pagination options
 * @returns List of orders
 */
declare function getOrders(session: HEBSession, options?: GetOrdersOptions): Promise<Order[]>;
/**
 * Get a single order by ID.
 *
 * @param session - Active HEB session
 * @param orderId - Order ID
 * @returns Order details
 */
declare function getOrder(session: HEBSession, orderId: string): Promise<Order>;

/**
 * Product nutrition info.
 */
interface NutritionInfo {
    servingSize?: string;
    servingsPerContainer?: string;
    calories?: number;
    totalFat?: string;
    saturatedFat?: string;
    transFat?: string;
    cholesterol?: string;
    sodium?: string;
    totalCarbs?: string;
    fiber?: string;
    sugars?: string;
    protein?: string;
}
/**
 * Product price info.
 */
interface ProductPrice {
    amount: number;
    formatted: string;
    wasPrice?: {
        amount: number;
        formatted: string;
    };
    unitPrice?: {
        amount: number;
        unit: string;
        formatted: string;
    };
}
/**
 * Product fulfillment options.
 */
interface FulfillmentInfo {
    curbside: boolean;
    delivery: boolean;
    inStore: boolean;
    aisleLocation?: string;
}
/**
 * Full product details.
 */
interface Product {
    productId: string;
    skuId: string;
    name: string;
    brand?: string;
    isOwnBrand?: boolean;
    description?: string;
    longDescription?: string;
    imageUrl?: string;
    images?: string[];
    price?: ProductPrice;
    nutrition?: NutritionInfo;
    fulfillment?: FulfillmentInfo;
    ingredients?: string;
    upc?: string;
    size?: string;
    category?: string;
    categoryPath?: string[];
    isAvailable?: boolean;
    inStock?: boolean;
    maxQuantity?: number;
    productUrl?: string;
}
/**
 * Get full product details by product ID.
 *
 * Uses Next.js data endpoint which returns comprehensive product info
 * including SKU ID, nutrition, aisle location, and fulfillment options.
 *
 * @param session - Active HEB session with buildId
 * @param productId - Product ID
 *
 * @example
 * const product = await getProductDetails(session, '1875945');
 * console.log(`${product.name} - SKU: ${product.skuId}`);
 * console.log(`Price: ${product.price?.formatted}`);
 */
declare function getProductDetails(session: HEBSession, productId: string): Promise<Product>;
/**
 * Get just the SKU ID for a product.
 * Useful when you have a product ID and need the SKU for cart operations.
 *
 * @example
 * const skuId = await getProductSkuId(session, '1875945');
 * await addToCart(session, '1875945', skuId, 2);
 */
declare function getProductSkuId(session: HEBSession, productId: string): Promise<string>;
/**
 * Build product image URL.
 * HEB images follow a predictable pattern.
 *
 * @param productId - Product ID
 * @param size - Image dimensions (default 360x360)
 *
 * @example
 * const imageUrl = getProductImageUrl('1875945', 500);
 * // https://images.heb.com/is/image/HEBGrocery/1875945?hei=500&wid=500
 */
declare function getProductImageUrl(productId: string, size?: number): string;

/**
 * Search filter option.
 */
interface SearchFilter {
    key: string;
    value: string;
}
/**
 * Search options.
 */
interface SearchOptions {
    page?: number;
    filters?: SearchFilter[];
}
/**
 * Product from search results.
 */
interface SearchProduct {
    productId: string;
    name: string;
    brand?: string;
    description?: string;
    imageUrl?: string;
    price?: {
        amount: number;
        formatted: string;
    };
    unitPrice?: {
        amount: number;
        unit: string;
        formatted: string;
    };
    skuId?: string;
    isAvailable?: boolean;
    fulfillmentOptions?: string[];
    /** URL slug for product page */
    slug?: string;
}
/**
 * Search result structure.
 */
interface SearchResult {
    products: SearchProduct[];
    totalCount: number;
    page: number;
    hasNextPage: boolean;
    facets?: Array<{
        key: string;
        label: string;
        values: Array<{
            value: string;
            count: number;
        }>;
    }>;
}
/**
 * Typeahead suggestion (search term).
 */
interface TypeaheadSuggestion {
    term: string;
    type: 'recent' | 'trending' | 'keyword';
}
/**
 * Typeahead response with categorized suggestions.
 */
interface TypeaheadResult {
    recentSearches: string[];
    trendingSearches: string[];
    allTerms: string[];
}
/**
 * Search for products using GraphQL.
 *
 * Note: This requires the `searchProductQuery` hash which changes per build.
 * If persisted query fails, use `searchSSR()` instead.
 *
 * @example
 * const results = await searchProducts(session, 'milk', { page: 1 });
 * console.log(results.products);
 */
declare function searchProducts(session: HEBSession, query: string, options?: SearchOptions): Promise<SearchResult>;
/**
 * Search for products using SSR (Server-Side Rendering).
 *
 * This fetches the HTML search page and extracts product URLs from it.
 * More reliable than GraphQL search since it doesn't require dynamic hashes.
 *
 * @example
 * const products = await searchSSR(session, 'cinnamon rolls');
 * const product = products[0];
 * console.log(`Found: ${product.name} (ID: ${product.productId})`);
 */
declare function searchSSR(session: HEBSession, query: string, limit?: number): Promise<SearchProduct[]>;
/**
 * Get typeahead/autocomplete suggestions.
 *
 * Returns recent searches and trending searches from HEB.
 *
 * @example
 * const result = await typeahead(session, 'pea');
 * console.log('Recent:', result.recentSearches);
 * console.log('Trending:', result.trendingSearches);
 */
declare function typeahead(session: HEBSession, query: string): Promise<TypeaheadResult>;
/**
 * Get typeahead terms as a flat array.
 *
 * @deprecated Use typeahead() for full results with categorization.
 */
declare function typeaheadTerms(session: HEBSession, query: string): Promise<string[]>;

interface Store {
    storeNumber: string;
    name: string;
    address: {
        streetAddress: string;
        city: string;
        state: string;
        zip: string;
    };
    distanceMiles?: number;
}
interface StoreSearchResult {
    stores: Store[];
}
/**
 * Search for H-E-B stores by address, zip, or city.
 */
declare function searchStores(session: HEBSession, query: string, radius?: number): Promise<Store[]>;
/**
 * Set the store context for the session.
 * This sets the CURR_SESSION_STORE cookie and performs a fulfillment selection request to ensure server-side context.
 */
declare function setStore(session: HEBSession, storeId: string): Promise<void>;

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
 * // Search for products (SSR - most reliable)
 * const products = await heb.searchSSR('cinnamon rolls');
 *
 * // Get product details
 * const product = await heb.getProduct(products[0].productId);
 *
 * // Add to cart
 * await heb.addToCart(product.productId, product.skuId, 2);
 */
declare class HEBClient {
    session: HEBSession;
    constructor(session: HEBSession);
    /**
     * Check if the session is still valid.
     */
    isValid(): boolean;
    /**
     * Ensure the session has a valid buildId.
     * Fetches it if missing.
     */
    ensureBuildId(): Promise<void>;
    /**
     * Search for products using SSR (Server-Side Rendered) search.
     *
     * This is the most reliable search method as it doesn't require
     * dynamic GraphQL hashes. Parses product URLs from HTML results.
     *
     * @param query - Search query
     * @param limit - Max results (default: 20)
     *
     * @example
     * const products = await heb.searchSSR('cinnamon rolls');
     * console.log(`Found ${products.length} products`);
     * products.forEach(p => console.log(`${p.name} (${p.productId})`));
     */
    searchSSR(query: string, limit?: number): Promise<SearchProduct[]>;
    /**
     * Search for products using GraphQL.
     *
     * Note: Requires dynamic hash - may fail if hash is outdated.
     * Use `searchSSR()` for more reliable results.
     *
     * @deprecated Prefer searchSSR() for reliability
     */
    search(query: string, options?: SearchOptions): Promise<SearchResult>;
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
    typeahead(query: string): Promise<TypeaheadResult>;
    /**
     * Get typeahead terms as a flat array.
     *
     * @deprecated Use typeahead() for categorized results.
     */
    typeaheadTerms(query: string): Promise<string[]>;
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
    getProduct(productId: string): Promise<Product>;
    /**
     * Get SKU ID for a product.
     */
    getSkuId(productId: string): Promise<string>;
    /**
     * Get product image URL.
     */
    getImageUrl(productId: string, size?: number): string;
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
    addToCart(productId: string, skuId: string, quantity: number): Promise<CartResponse>;
    /**
     * Update cart item quantity.
     */
    updateCartItem(productId: string, skuId: string, quantity: number): Promise<CartResponse>;
    /**
     * Remove item from cart.
     */
    removeFromCart(productId: string, skuId: string): Promise<CartResponse>;
    /**
     * Quick add - set quantity to 1.
     */
    quickAdd(productId: string, skuId: string): Promise<CartResponse>;
    /**
     * Add to cart by product ID only.
     * Fetches SKU ID automatically.
     *
     * @example
     * // Simplest way to add a product
     * await heb.addToCartById('1875945', 2);
     */
    addToCartById(productId: string, quantity: number): Promise<CartResponse>;
    /**
     * Get order history.
     *
     * @example
     * const orders = await heb.getOrders({ page: 1 });
     * console.log(`Found ${orders.length} orders`);
     */
    getOrders(options?: GetOrdersOptions): Promise<Order[]>;
    /**
     * Get filtered order history.
     *
     * @param orderId - Order ID
     * @returns Order details
     */
    getOrder(orderId: string): Promise<Order>;
    /**
     * Get available delivery slots.
     */
    getDeliverySlots(options?: GetDeliverySlotsOptions): Promise<DeliverySlot[]>;
    /**
     * Reserve a delivery slot.
     */
    reserveSlot(slotId: string, date: string, address: Address, storeId: string): Promise<ReserveSlotResult>;
    /**
     * Get available curbside pickup slots for a store.
     *
     * @param options - Options with storeNumber (required)
     * @example
     * const slots = await heb.getCurbsideSlots({ storeNumber: 790 });
     * slots.forEach(s => console.log(`${s.date.toLocaleDateString()} ${s.startTime}-${s.endTime}`));
     */
    getCurbsideSlots(options: GetCurbsideSlotsOptions): Promise<CurbsideSlot[]>;
    /**
     * Reserve a curbside pickup slot.
     *
     * @param slotId - Slot ID from getCurbsideSlots
     * @param date - Date (YYYY-MM-DD)
     * @param storeId - Store ID
     */
    reserveCurbsideSlot(slotId: string, date: string, storeId: string): Promise<ReserveCurbsideSlotResult>;
    /**
     * Search for H-E-B stores.
     *
     * @param query - Address, zip, or city (e.g. "78701", "Austin")
     * @example
     * const stores = await heb.searchStores('78701');
     * console.log(`Found ${stores.length} stores`);
     */
    searchStores(query: string): Promise<Store[]>;
    /**
     * Set the active store for the session.
     *
     * This updates the session cookie and makes a server request to
     * set the fulfillment context.
     *
     * @param storeId - Store ID (e.g. "790")
     */
    setStore(storeId: string): Promise<void>;
}

/**
 * Get credentials from environment variables.
 */
declare function getCredentialsFromEnv(): HEBCredentials | null;
/**
 * Complete the HEB login flow and return a session.
 *
 * @param credentials - Email and password (or reads from HEB_EMAIL/HEB_PASSWORD env vars)
 * @param options - Login options (headless, timeout, storeId)
 * @returns HEB session with cookies and headers
 */
declare function login(credentials?: HEBCredentials, options?: LoginOptions): Promise<HEBSession>;
/**
 * Extract session from an existing browser page/context.
 * Useful when you already have a logged-in browser session.
 */
declare function extractSession(context: BrowserContext, page?: Page): Promise<HEBSession>;

/**
 * Parse cookies from a Cookie header string or browser export.
 *
 * Accepts:
 * - Cookie header string: "sat=xxx; reese84=yyy; ..."
 * - JSON array from browser DevTools: Copy as JSON from Application > Cookies
 */
declare function parseCookies(input: string): HEBCookies;
/**
 * Create a session from manually extracted cookies.
 *
 * @example
 * // Option 1: From cookie header (copy from browser DevTools Network tab)
 * const session = createSessionFromCookies('sat=xxx; reese84=yyy; ...');
 *
 * // Option 2: From JSON export (Chrome DevTools > Application > Cookies > right-click > Copy all)
 * const session = createSessionFromCookies('[{"name":"sat","value":"xxx"},...]');
 *
 * // Then use for requests
 * fetch('https://www.heb.com/graphql', { headers: session.headers, ... });
 */
declare function createSessionFromCookies(cookieInput: string, buildId?: string): HEBSession;

/**
 * Format cookies object into a Cookie header string.
 */
declare function formatCookieHeader(cookies: HEBCookies): string;
/**
 * Build required headers for HEB GraphQL API requests.
 */
declare function buildHeaders(cookies: HEBCookies, buildId?: string): HEBHeaders;
/**
 * Parse JWT expiration from sat cookie.
 * Returns undefined if parsing fails.
 */
declare function parseJwtExpiry(sat: string): Date | undefined;
/**
 * Check if a session is still valid (not expired).
 */
declare function isSessionValid(session: HEBSession): boolean;
/**
 * Create a session object from cookies and optional metadata.
 */
declare function createSession(cookies: HEBCookies, buildId?: string): HEBSession;

/**
 * GraphQL request payload structure.
 */
interface GraphQLPayload {
    operationName: string;
    variables: Record<string, unknown>;
    extensions?: {
        persistedQuery?: {
            version: number;
            sha256Hash: string;
        };
    };
}
/**
 * HEB API error structure.
 */
interface HEBAPIError {
    message: string;
    extensions?: {
        code?: string;
        classification?: string;
    };
}
/**
 * GraphQL response wrapper.
 */
interface GraphQLResponse<T> {
    data?: T;
    errors?: HEBAPIError[];
}
/**
 * Common HEB API error codes.
 */
declare const ERROR_CODES: {
    readonly INVALID_PRODUCT_STORE: "INVALID_PRODUCT_STORE";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly NOT_FOUND: "NOT_FOUND";
};
/**
 * Execute a GraphQL request against the HEB API.
 */
declare function graphqlRequest<T>(session: HEBSession, payload: GraphQLPayload): Promise<GraphQLResponse<T>>;
/**
 * Execute a persisted GraphQL query.
 */
declare function persistedQuery<T>(session: HEBSession, operationName: keyof typeof GRAPHQL_HASHES, variables: Record<string, unknown>): Promise<GraphQLResponse<T>>;
/**
 * Fetch data from Next.js data endpoint.
 */
declare function nextDataRequest<T>(session: HEBSession, path: string): Promise<T>;
/**
 * Check if response contains specific error code.
 */
declare function hasErrorCode(response: GraphQLResponse<unknown>, code: string): boolean;
/**
 * Extract error messages from response.
 */
declare function getErrorMessages(response: GraphQLResponse<unknown>): string[];

/**
 * Base error for all H-E-B API errors.
 */
declare class HEBError extends Error {
    readonly code?: string | undefined;
    constructor(message: string, code?: string | undefined);
}
/**
 * Authentication-related errors.
 * Thrown when login fails, 2FA is required, or session is invalid.
 */
declare class HEBAuthError extends HEBError {
    constructor(message: string, code?: string);
}
/**
 * Session-related errors.
 * Thrown when session is expired, missing, or cookies are stale.
 */
declare class HEBSessionError extends HEBError {
    constructor(message: string, code?: string);
}
/**
 * Cart operation errors.
 * Thrown when add/update/remove cart operations fail.
 */
declare class HEBCartError extends HEBError {
    constructor(message: string, code?: string);
}
/**
 * Product-related errors.
 * Thrown when product lookup fails or product is unavailable.
 */
declare class HEBProductError extends HEBError {
    constructor(message: string, code?: string);
}
/**
 * Search-related errors.
 */
declare class HEBSearchError extends HEBError {
    constructor(message: string, code?: string);
}

export { type CartItem, type CartResponse, type CurbsideSlot, type DeliverySlot, ENDPOINTS, ERROR_CODES, type FulfillmentInfo, GRAPHQL_HASHES, type GetCurbsideSlotsOptions, type GetDeliverySlotsOptions, type GetOrdersOptions, type GraphQLPayload, type GraphQLResponse, type HEBAPIError, HEBAuthError, HEBCartError, HEBClient, type HEBCookies, type HEBCredentials, HEBError, type HEBHeaders, HEBProductError, HEBSearchError, type HEBSession, HEBSessionError, type LoginOptions, type NutritionInfo, type Order, type OrderItem, type Product, type ProductPrice, type SearchFilter, type SearchOptions, type SearchProduct, type SearchResult, type Store, type StoreSearchResult, type TypeaheadResult, type TypeaheadSuggestion, addToCart, buildHeaders, createSession, createSessionFromCookies, extractSession, formatCookieHeader, getCredentialsFromEnv, getCurbsideSlots, getDeliverySlots, getErrorMessages, getOrder, getOrders, getProductDetails, getProductImageUrl, getProductSkuId, graphqlRequest, hasErrorCode, isSessionValid, login, nextDataRequest, parseCookies, parseJwtExpiry, persistedQuery, quickAdd, removeFromCart, reserveCurbsideSlot, reserveSlot, searchProducts, searchSSR, searchStores, setStore, typeahead, typeaheadTerms, updateCartItem };
