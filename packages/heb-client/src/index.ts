// ─────────────────────────────────────────────────────────────
// H-E-B Client Library
// Unofficial TypeScript SDK for H-E-B API
// ─────────────────────────────────────────────────────────────

// Main client class
export { HEBClient } from './client.js';

// ─────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────
export { extractSession, getCredentialsFromEnv, login } from './auth.js';
export { createSessionFromCookies, parseCookies } from './cookies.js';
export {
    buildHeaders,
    createSession,
    formatCookieHeader,
    isSessionValid,
    parseJwtExpiry
} from './session.js';

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────
export {
    getProductDetails,
    getProductImageUrl,
    getProductSkuId,
    type FulfillmentInfo,
    type NutritionInfo,
    type Product,
    type ProductPrice
} from './product.js';

// ─────────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────────
export {
    searchProducts,
    searchSSR,
    typeahead,
    typeaheadTerms,
    type SearchFilter,
    type SearchOptions,
    type SearchProduct,
    type SearchResult,
    type TypeaheadResult,
    type TypeaheadSuggestion
} from './search.js';

// ─────────────────────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────────────────────
export {
    addToCart,
    quickAdd,
    removeFromCart,
    updateCartItem,
    type CartItem,
    type CartResponse
} from './cart.js';

// ─────────────────────────────────────────────────────────────
// Orders (stub)
// ─────────────────────────────────────────────────────────────
export {
    getOrder,
    getOrders,
    type GetOrdersOptions,
    type Order,
    type OrderItem
} from './orders.js';

// ─────────────────────────────────────────────────────────────
// Delivery
// ─────────────────────────────────────────────────────────────
export {
    getDeliverySlots,
    reserveSlot,
    type DeliverySlot,
    type GetDeliverySlotsOptions
} from './delivery.js';

// ─────────────────────────────────────────────────────────────
// Curbside Pickup
// ─────────────────────────────────────────────────────────────
export {
    getCurbsideSlots,
    reserveCurbsideSlot,
    type CurbsideSlot,
    type GetCurbsideSlotsOptions
} from './curbside.js';

// ─────────────────────────────────────────────────────────────
// Stores
// ─────────────────────────────────────────────────────────────
export {
    searchStores,
    setStore,
    type Store,
    type StoreSearchResult
} from './stores.js';


// ─────────────────────────────────────────────────────────────
// API Utilities
// ─────────────────────────────────────────────────────────────
export {
    ERROR_CODES,
    getErrorMessages,
    graphqlRequest,
    hasErrorCode,
    nextDataRequest,
    persistedQuery,
    type GraphQLPayload,
    type GraphQLResponse,
    type HEBAPIError
} from './api.js';

// ─────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────
export {
    HEBAuthError,
    HEBCartError,
    HEBError,
    HEBProductError,
    HEBSearchError,
    HEBSessionError
} from './errors.js';

// ─────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────
export type {
    HEBCookies,
    HEBCredentials,
    HEBHeaders,
    HEBSession,
    LoginOptions
} from './types.js';

export { ENDPOINTS, GRAPHQL_HASHES } from './types.js';
