# HEB SDK Unofficial

Unofficial TypeScript SDK for H-E-B grocery API — search, product details, and cart management.

## Features

- ✅ **Mobile GraphQL** - Homepage, account details, orders, and order history
- ✅ **Product Search** - Mobile GraphQL search results
- ✅ **Product Details** - Full product info including nutrition, pricing, inventory
- ✅ **Cart Management** - Add, update, remove items
- ✅ **Typeahead** - Search suggestions with recent/trending terms
- ⚠️ **Weekly Ad** - Temporarily unavailable without Next.js endpoints
- ✅ **Session Management** - Cookie-based authentication + mobile OAuth tokens

## Install

```bash
pnpm add heb-sdk-unofficial
npx playwright install chromium  # Only if using automated login
```

## Quick Start

```typescript
import { createTokenSession, HEBClient } from 'heb-sdk-unofficial';

// 1. Exchange OAuth code for tokens (see Mobile OAuth section)
const tokens = {
  accessToken: process.env.HEB_ACCESS_TOKEN!,
  refreshToken: process.env.HEB_REFRESH_TOKEN,
  idToken: process.env.HEB_ID_TOKEN,
  expiresIn: 1800,
};

// 2. Create session and client
const session = createTokenSession(tokens);
const heb = new HEBClient(session);

// 3. Set store context (required for search, homepage, products)
await heb.setStore('790');

// 4. Search for products
const results = await heb.search('cinnamon rolls', { limit: 20 });
console.log(results.products[0].name); // "H E B Bakery Two Bite Cinnamon Rolls"

// 5. Get detailed product info
const product = await heb.getProduct(results.products[0].productId);
console.log(product.brand);      // "H-E-B"
console.log(product.inStock);    // true
console.log(product.nutrition);  // { calories: 210, ... }

// 6. Add to cart
await heb.addToCart(product.productId, product.skuId, 2);
```

## Getting Cookies

H-E-B uses aggressive bot protection (Imperva). Extract cookies manually from your browser:

1. Login to heb.com in Chrome
2. Open DevTools (F12) → Application → Cookies → www.heb.com
3. Copy values for: `sat`, `reese84`, `CURR_SESSION_STORE`

Or from the Network tab:
1. Right-click any request → Copy as cURL
2. Extract cookie values from the `-H 'Cookie: ...'` header

## Mobile OAuth (Experimental)

The H‑E‑B mobile app uses OAuth (Authorization Code + PKCE). This flow yields Bearer tokens that can be used against the mobile GraphQL API host. Since third‑party apps are not registered in the H‑E‑B IdP, this approach **impersonates the mobile client** and may break if H‑E‑B changes the flow.

```typescript
import { createTokenSession, HEBClient } from 'heb-sdk-unofficial';

// After you perform the OAuth code exchange:
const tokens = {
  accessToken: '...',
  refreshToken: '...',
  idToken: '...',
  expiresIn: 1800,
};

const session = createTokenSession(tokens);
const heb = new HEBClient(session);
```

Notes:
- Token sessions use the mobile GraphQL host by default.
- Homepage, account details, orders, search, and product details require bearer sessions.
- You must refresh tokens periodically (access tokens expire in ~30 minutes).

## API Reference

### HEBClient

The main client class wrapping all functionality.

```typescript
const heb = new HEBClient(session);

// Search
await heb.search(query, { limit? })          // Product search (bearer session)
await heb.typeahead(query)                   // Get search suggestions

// Weekly Ad
await heb.getWeeklyAdProducts({ limit? })    // Weekly ad products

// Products
await heb.getProduct(productId)             // Full product details
await heb.getSkuId(productId)               // Just the SKU ID
heb.getImageUrl(productId, size?)           // Product image URL

// Account
await heb.getAccountDetails()               // Profile + saved addresses

// Orders
await heb.getOrders({ page? })              // Order history
await heb.getOrder(orderId)                 // Order details

// Homepage
await heb.getHomepage()                     // Homepage sections

// Cart
await heb.addToCart(productId, skuId, qty)  // Add/update item
await heb.addToCartById(productId, qty)     // Auto-fetches SKU
await heb.removeFromCart(productId, skuId)  // Remove item

```

### Search

```typescript
const results = await heb.search('milk', { limit: 20 });

// Returns:
interface SearchResult {
  products: SearchProduct[];
  totalCount: number;
}
```

### Weekly Ad

```typescript
// Weekly ad support is temporarily unavailable without Next.js endpoints.
// This call currently throws until a mobile GraphQL operation is captured.
await heb.getWeeklyAdProducts({ limit: 20 });
```

### Product Details

```typescript
const product = await heb.getProduct('1875945');

// Returns:
interface Product {
  productId: string;
  skuId: string;
  name: string;
  brand?: string;
  isOwnBrand?: boolean;
  description?: string;
  price?: { amount: number; formatted: string };
  nutrition?: {
    calories?: number;
    totalFat?: string;
    totalCarbs?: string;
    protein?: string;
    // ...
  };
  inStock?: boolean;
  maxQuantity?: number;
  categoryPath?: string[];
  productUrl?: string;
}
```

### Cart Operations

```typescript
const result = await heb.addToCart('1875945', '1875945', 2);

if (result.success) {
  console.log(`Cart has ${result.cart?.itemCount} items`);
  console.log(`Subtotal: ${result.cart?.subtotal?.formatted}`);
} else {
  console.error(result.errors);
}
```

### Session Management

```typescript
import { createSession, createSessionFromCookies, isSessionValid } from 'heb-sdk-unofficial';

// From cookies object
const session = createSession(cookies);

// From cookie header string
const session = createSessionFromCookies('sat=xxx; reese84=yyy; ...');

// Check expiration
if (!isSessionValid(session)) {
  // Re-authenticate
}
```

## Low-Level API

For direct API access:

```typescript
import { graphqlRequest, persistedQuery, GRAPHQL_HASHES } from 'heb-sdk-unofficial';

// GraphQL with persisted query
const response = await persistedQuery(session, 'cartItemV2', {
  productId: '1875945',
  skuId: '1875945',
  quantity: 2,
  userIsLoggedIn: true,
});

```

## Constants

```typescript
import { GRAPHQL_HASHES, ENDPOINTS } from 'heb-sdk-unofficial';

GRAPHQL_HASHES.cartItemV2        // Add to cart hash
GRAPHQL_HASHES.typeaheadContent  // Typeahead hash

ENDPOINTS.graphql  // https://www.heb.com/graphql
ENDPOINTS.home     // https://www.heb.com/
```

## Types

```typescript
import type {
  HEBSession,
  HEBCookies,
  HEBHeaders,
  Product,
  SearchProduct,
  CartResponse,
  TypeaheadResult,
  WeeklyAdProduct,
  WeeklyAdResult,
  WeeklyAdOptions,
} from 'heb-sdk-unofficial';
```

## Notes

- **Bot Protection**: H-E-B uses Imperva/Incapsula. The `reese84` cookie is essential.
- **Store Context**: `CURR_SESSION_STORE` affects product availability and pricing.
- **Session Expiry**: The `sat` JWT expires. Monitor for 401 errors.
- **Mobile GraphQL**: Homepage, account, orders, search, and product details require bearer sessions.
- **Weekly Ad**: Weekly ad support is currently unavailable without Next.js endpoints.

## License

ISC
