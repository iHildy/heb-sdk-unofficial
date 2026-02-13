# heb-sdk

Unofficial TypeScript client library for the H-E-B Grocery API.

## Installation

```bash
npm install heb-sdk
# or
pnpm add heb-sdk
```

## Quick Start

```typescript
import { createTokenSession, HEBClient } from 'heb-sdk';

// Create session from OAuth tokens (mobile)
const session = createTokenSession({
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
  idToken: 'your-id-token',
  expiresIn: 1800,
});
const heb = new HEBClient(session);

// Set store context (required for search/homepage/products)
await heb.setStore('790');

// Search for products
const results = await heb.search('organic milk', { limit: 20 });
console.log(results.products);

// Get product details
const product = await heb.getProduct(results.products[0].productId);
console.log(product.name, product.skuId, product.price);

// Add to cart
await heb.addToCart(product.productId, product.skuId, 2);
```

## Session Credentials

Use only session credentials that you are authorized to use.
Do not commit tokens/cookies to source control, logs, or issue trackers.

For long-running and server-side integrations, prefer OAuth bearer sessions.
Cookie sessions are supported for compatible web endpoints.

### Environment Variables

To keep credentials secure, use the `HEB_COOKIES` environment variable:

```bash
export HEB_COOKIES='cookie_a=...; cookie_b=...; CURR_SESSION_STORE=790'
```

This format matches the browser's `Cookie` header (semicolon-separated). Use it with `createSessionFromCookies()`:

```typescript
const session = createSessionFromCookies(process.env.HEB_COOKIES!);
```

## API

### `HEBClient`

Main client class with all methods:

| Method | Description |
|--------|-------------|
| `search(query, { limit? })` | Search products (mobile GraphQL) |
| `getWeeklyAdProducts({ limit? })` | Weekly ad products |
| `getProduct(productId)` | Get full product details |
| `getSkuId(productId)` | Get just the SKU ID |
| `getAccountDetails()` | Account profile + saved addresses |
| `getOrders({ page? })` | Order history |
| `getOrder(orderId)` | Order details |
| `getHomepage()` | Homepage sections |
| `addToCart(productId, skuId, qty)` | Add/update cart item |
| `removeFromCart(productId, skuId)` | Remove item (sets qty to 0) |
| `addToCartById(productId, qty)` | Add to cart (auto-fetches SKU) |

| `typeahead(query)` | Get search suggestions |

### Weekly Ad

```typescript
const weeklyAd = await heb.getWeeklyAdProducts({
  limit: 20,
});
```

### Session Management

| Function | Description |
|----------|-------------|
| `createSession(cookies)` | Create session from cookies |
| `createSessionFromCookies(cookieStr)` | Parse cookie string |
| `createTokenSession(tokens)` | Create session from OAuth bearer tokens (mobile) |
| `isSessionValid(session)` | Check if session expired |

## Error Handling

The library exports typed error classes:

```typescript
import { HEBAuthError, HEBCartError, HEBProductError } from 'heb-sdk';

try {
  await heb.addToCart(productId, skuId, 1);
} catch (err) {
  if (err instanceof HEBCartError) {
    console.error('Cart error:', err.message);
  }
}
```

## Notes

- **Session expiry**: sessions can expire; renew credentials when you get auth errors.
- **OAuth tokens (mobile)**: access tokens are short-lived. Refresh using the `refresh_token`.
- **Store context**: Set `CURR_SESSION_STORE` to get accurate pricing and availability for your store.
- **Mobile GraphQL**: Search, product details, homepage, account, and orders require bearer sessions with a store ID.
- **Weekly ad**: Weekly ad support is currently unavailable without Next.js endpoints.

## License

ISC
