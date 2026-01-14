# HEB SDK Unofficial

Unofficial TypeScript SDK for H-E-B grocery API — search, product details, and cart management.

## Features

- ✅ **Next.js Search** - Reliable product search via data endpoint
- ✅ **Product Details** - Full product info including nutrition, pricing, inventory
- ✅ **Cart Management** - Add, update, remove items
- ✅ **Typeahead** - Search suggestions with recent/trending terms
- ✅ **Weekly Ad** - Weekly ad flyer products via Flipp
- ✅ **Session Management** - Cookie-based authentication + experimental mobile OAuth tokens

## Install

```bash
pnpm add heb-sdk-unofficial
npx playwright install chromium  # Only if using automated login
```

## Quick Start

```typescript
import { createSession, HEBClient, type HEBCookies } from 'heb-sdk-unofficial';

// 1. Build cookies from your HEB session
const cookies: HEBCookies = {
  sat: process.env.HEB_SAT!,        // Session auth token (JWT)
  reese84: process.env.HEB_REESE84!, // Bot protection token
  incap_ses: '',                    // Imperva session (optional)
  CURR_SESSION_STORE: '790',        // Store ID
};

// 2. Create session and client
const session = createSession(cookies, 'buildId123');
const heb = new HEBClient(session);

// 3. Search for products
await heb.ensureBuildId();
const results = await heb.search('cinnamon rolls', { limit: 20 });
console.log(results.products[0].name); // "H E B Bakery Two Bite Cinnamon Rolls"

// 4. Get detailed product info
const product = await heb.getProduct(results.products[0].productId);
console.log(product.brand);      // "H-E-B"
console.log(product.inStock);    // true
console.log(product.nutrition);  // { calories: 210, ... }

// 5. Add to cart
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
- Search/typeahead still rely on the web Next.js data endpoint and may require a valid buildId.
- You must refresh tokens periodically (access tokens expire in ~30 minutes).

## API Reference

### HEBClient

The main client class wrapping all functionality.

```typescript
const heb = new HEBClient(session);

// Search
await heb.search(query, { limit? })          // Product search (requires buildId)
await heb.typeahead(query)                   // Get search suggestions

// Weekly Ad
await heb.getWeeklyAdProducts({ limit? })    // Weekly ad products

// Products
await heb.getProduct(productId)             // Full product details
await heb.getSkuId(productId)               // Just the SKU ID
heb.getImageUrl(productId, size?)           // Product image URL

// Cart
await heb.addToCart(productId, skuId, qty)  // Add/update item
await heb.addToCartById(productId, qty)     // Auto-fetches SKU
await heb.removeFromCart(productId, skuId)  // Remove item

```

### Search

```typescript
await heb.ensureBuildId();
const results = await heb.search('milk', { limit: 20 });

// Returns:
interface SearchResult {
  products: SearchProduct[];
  totalCount: number;
}
```

### Weekly Ad

```typescript
const weeklyAd = await heb.getWeeklyAdProducts({
  displayType: 'all',
  categoryFilter: 'Fruit',
  department: 'Seafood',
  limit: 20,
});
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
const session = createSession(cookies, buildId);

// From cookie header string
const session = createSessionFromCookies('sat=xxx; reese84=yyy; ...', buildId);

// Check expiration
if (!isSessionValid(session)) {
  // Re-authenticate
}
```

## Low-Level API

For direct API access:

```typescript
import { graphqlRequest, persistedQuery, nextDataRequest, GRAPHQL_HASHES } from 'heb-sdk-unofficial';

// GraphQL with persisted query
const response = await persistedQuery(session, 'cartItemV2', {
  productId: '1875945',
  skuId: '1875945',
  quantity: 2,
  userIsLoggedIn: true,
});

// Next.js data endpoint
const data = await nextDataRequest(session, '/en/product-detail/1875945.json');
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
- **Search Data**: Product search uses the Next.js data endpoint and requires a valid buildId.
- **Weekly Ad**: Weekly ad products come from Flipp endpoints and require a store ID (postal code is derived).

## License

ISC
