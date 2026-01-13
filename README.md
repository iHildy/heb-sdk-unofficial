# HEB SDK Unofficial

Unofficial TypeScript SDK for H-E-B grocery API — search, product details, and cart management.

## Features

- ✅ **SSR Search** - Reliable product search without dynamic GraphQL hashes
- ✅ **Product Details** - Full product info including nutrition, pricing, inventory
- ✅ **Cart Management** - Add, update, remove items
- ✅ **Typeahead** - Search suggestions with recent/trending terms
- ✅ **Session Management** - Cookie-based authentication

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
const products = await heb.searchSSR('cinnamon rolls');
console.log(products[0].name); // "H E B Bakery Two Bite Cinnamon Rolls"

// 4. Get detailed product info
const product = await heb.getProduct(products[0].productId);
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

## API Reference

### HEBClient

The main client class wrapping all functionality.

```typescript
const heb = new HEBClient(session);

// Search
await heb.searchSSR(query, limit?)         // SSR search (recommended)
await heb.search(query, options?)           // GraphQL search (requires dynamic hash)
await heb.typeahead(query)                  // Get search suggestions

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
// SSR Search (recommended - doesn't require GraphQL hashes)
const products = await heb.searchSSR('milk', 10);

// Returns:
interface SearchProduct {
  productId: string;
  name: string;
  slug?: string;
  imageUrl?: string;
}
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
} from 'heb-sdk-unofficial';
```

## Notes

- **Bot Protection**: H-E-B uses Imperva/Incapsula. The `reese84` cookie is essential.
- **Store Context**: `CURR_SESSION_STORE` affects product availability and pricing.
- **Session Expiry**: The `sat` JWT expires. Monitor for 401 errors.
- **GraphQL Hashes**: The `searchProductQuery` hash changes per build. Use `searchSSR()` for reliability.

## License

ISC
