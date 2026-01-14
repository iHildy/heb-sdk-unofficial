// ─────────────────────────────────────────────────────────────
// H-E-B Client Library
// Unofficial TypeScript SDK for H-E-B API
// ─────────────────────────────────────────────────────────────

// Main client class
export { HEBClient } from './client.js';

// ─────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────
export { createSessionFromCookies, parseCookies } from './cookies.js';
export {
    buildBearerHeaders, buildHeaders, createSession,
    createTokenSession, ensureFreshSession, formatCookieHeader, getSessionInfo,
    isSessionAuthenticated,
    isSessionValid,
    parseJwtExpiry,
    resolveEndpoint,
    updateTokenSession
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
    typeahead,
    typeaheadTerms,
    type SearchOptions,
    type SearchProduct,
    type SearchResult,
    type TypeaheadResult,
    type TypeaheadSuggestion
} from './search.js';

// ─────────────────────────────────────────────────────────────
// Weekly Ad
// ─────────────────────────────────────────────────────────────
export {
    getWeeklyAdProducts,
    type WeeklyAdOptions,
    type WeeklyAdProduct,
    type WeeklyAdResult
} from './weekly-ad.js';

// ─────────────────────────────────────────────────────────────
// Cart
// ─────────────────────────────────────────────────────────────
export {
    addToCart,
    getCart,
    quickAdd,
    removeFromCart,
    updateCartItem,
    type Cart,
    type CartFee,
    type CartItem,
    type CartResponse,
    type DisplayPrice,
    type PaymentGroup
} from './cart.js';

// ─────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────
export {
    getOrder,
    getOrders,
    type GetOrdersOptions,
    type OrderDetailsGraphqlResponse,
    type OrderDetailsPageOrder,
    type OrderDetailsPageResponse,
    type OrderDetailsResponse,
    type OrderHistoryResponse,
    type RawHistoryOrder
} from './orders.js';

// ─────────────────────────────────────────────────────────────
// Shopping Lists
// ─────────────────────────────────────────────────────────────
export {
    getShoppingList,
    getShoppingLists,
    type GetShoppingListOptions,
    type ShoppingList,
    type ShoppingListDetails,
    type ShoppingListItem
} from './shopping-list.js';

// ─────────────────────────────────────────────────────────────
// Account
// ─────────────────────────────────────────────────────────────
export {
    getAccountDetails,
    type AccountAddress,
    type AccountDetails
} from './account.js';

// ─────────────────────────────────────────────────────────────
// Homepage
// ─────────────────────────────────────────────────────────────
export {
    getHomepage,
    type HomepageBanner,
    type HomepageData,
    type HomepageFeaturedProduct,
    type HomepageItem,
    type HomepageOptions,
    type HomepagePromotion,
    type HomepageSection
} from './homepage.js';

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
    persistedQuery,
    type GraphQLPayload,
    type GraphQLResponse,
    type HEBAPIError
} from './api.js';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export type {
    HEBAuthMode,
    HEBAuthTokens, HEBCookies,
    HEBCredentials, HEBEndpoints, HEBHeaders,
    HEBSession,
    LoginOptions
} from './types.js';

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

export { ENDPOINTS, GRAPHQL_HASHES, MOBILE_GRAPHQL_HASHES } from './types.js';
