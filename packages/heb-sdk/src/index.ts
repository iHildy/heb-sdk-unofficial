// ─────────────────────────────────────────────────────────────
// H-E-B Client Library
// Unofficial TypeScript SDK for H-E-B API
// ─────────────────────────────────────────────────────────────

// Main client class
export { HEBClient } from './client';

// ─────────────────────────────────────────────────────────────
// Authentication
// ─────────────────────────────────────────────────────────────
export { createSessionFromCookies, parseCookies } from './cookies';
export {
    buildBearerHeaders, buildHeaders, createSession,
    createTokenSession, ensureFreshSession, formatCookieHeader, getSessionInfo,
    isSessionAuthenticated,
    isSessionValid,
    parseJwtExpiry,
    resolveEndpoint,
    resolveShoppingContext,
    updateTokenSession
} from './session';

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
} from './product';

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
} from './search';

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
} from './weekly-ad';

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
} from './cart';

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
} from './orders';

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
} from './shopping-list';

// ─────────────────────────────────────────────────────────────
// Account
// ─────────────────────────────────────────────────────────────
export {
    getAccountDetails,
    formatAccountDetails,
    type AccountAddress,
    type AccountDetails
} from './account';

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
} from './homepage';

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
} from './fulfillment';

// ─────────────────────────────────────────────────────────────
// Stores
// ─────────────────────────────────────────────────────────────
export {
    searchStores,
    setStore,
    formatStoreSearch,
    type Store,
    type StoreSearchResult
} from './stores';


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
} from './api';

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
} from './types';

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
} from './errors';

export { ENDPOINTS, GRAPHQL_HASHES, MOBILE_GRAPHQL_HASHES, SHOPPING_CONTEXT_TO_CATEGORIES } from './types';

import { formatAccountDetails } from './account';
import { formatCart } from './cart';
import { formatDeliverySlots, formatCurbsideSlots } from './fulfillment';
import { formatHomepageData } from './homepage';
import { formatOrderHistory, formatOrderDetails } from './orders';
import { formatProductListItem, formatProductDetails } from './product';
import { formatShoppingLists, formatShoppingList } from './shopping-list';
import { formatStoreSearch } from './stores';
import { formatWeeklyAd, formatWeeklyAdCategories } from './weekly-ad';

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
