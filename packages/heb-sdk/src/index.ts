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
    resolveShoppingContext,
    updateTokenSession
} from './session.js';

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────
export {
    getProductDetails,
    getProductImageUrl,
    getProductSkuId,
    formatProductListItem,
    formatProductDetails,
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
    type SearchOptions,
    type SearchResult,
    type TypeaheadResult,
    type TypeaheadSuggestion
} from './search.js';

// ─────────────────────────────────────────────────────────────
// Weekly Ad
// ─────────────────────────────────────────────────────────────
export {
    getWeeklyAdProducts,
    formatWeeklyAd,
    formatWeeklyAdCategories,
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
    formatCart,
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
    formatOrderHistory,
    formatOrderDetails,
    type GetOrdersOptions,
    type OrderDetailsGraphqlResponse,
    type OrderDetailsItem,
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
    formatShoppingList,
    formatShoppingLists,
    type GetShoppingListOptions,
    type ShoppingList,
    type ShoppingListDetails,
    type ShoppingListsPageInfo,
    type ShoppingListsResult,
    type ShoppingListItem
} from './shopping-list.js';

// ─────────────────────────────────────────────────────────────
// Account
// ─────────────────────────────────────────────────────────────
export {
    getAccountDetails,
    formatAccountDetails,
    type AccountAddress,
    type AccountDetails
} from './account.js';

// ─────────────────────────────────────────────────────────────
// Homepage
// ─────────────────────────────────────────────────────────────
export {
    getHomepage,
    formatHomepageData,
    type HomepageBanner,
    type HomepageData,
    type HomepageFeaturedProduct,
    type HomepageItem,
    type HomepageOptions,
    type HomepagePromotion,
    type HomepageSection
} from './homepage.js';

// ─────────────────────────────────────────────────────────────
// Fulfillment (Delivery & Curbside)
// ─────────────────────────────────────────────────────────────
export {
    getCurbsideSlots,
    getDeliverySlots,
    reserveSlot,
    formatDeliverySlots,
    formatCurbsideSlots,
    type FulfillmentSlot,
    type ReserveSlotResult
} from './fulfillment.js';

// ─────────────────────────────────────────────────────────────
// Stores
// ─────────────────────────────────────────────────────────────
export {
    searchStores,
    setStore,
    formatStoreSearch,
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
    FulfillmentType,
    HEBAuthMode,
    HEBAuthTokens, HEBCookies,
    HEBCredentials, HEBEndpoints, HEBHeaders,
    HEBSession,
    LoginOptions,
    ShoppingContext
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

export { ENDPOINTS, GRAPHQL_HASHES, MOBILE_GRAPHQL_HASHES, SHOPPING_CONTEXT_TO_CATEGORIES } from './types.js';

import { formatAccountDetails } from './account.js';
import { formatCart } from './cart.js';
import { formatDeliverySlots, formatCurbsideSlots } from './fulfillment.js';
import { formatHomepageData } from './homepage.js';
import { formatOrderHistory, formatOrderDetails } from './orders.js';
import { formatProductListItem, formatProductDetails } from './product.js';
import { formatShoppingLists, formatShoppingList } from './shopping-list.js';
import { formatStoreSearch } from './stores.js';
import { formatWeeklyAd, formatWeeklyAdCategories } from './weekly-ad.js';

export const formatter = {
  account: formatAccountDetails,
  cart: formatCart,
  curbsideSlots: formatCurbsideSlots,
  deliverySlots: formatDeliverySlots,
  homepage: formatHomepageData,
  orderDetails: formatOrderDetails,
  orderHistory: formatOrderHistory,
  productDetails: formatProductDetails,
  productListItem: formatProductListItem,
  shoppingList: formatShoppingList,
  shoppingLists: formatShoppingLists,
  storeSearch: formatStoreSearch,
  weeklyAd: formatWeeklyAd,
  weeklyAdCategories: formatWeeklyAdCategories,
};
