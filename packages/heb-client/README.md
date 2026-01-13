# heb-client

Unofficial TypeScript client library for the H-E-B Grocery API.

## Installation

```bash
npm install heb-client
# or
pnpm add heb-client
```

## Quick Start

```typescript
import { createSession, HEBClient, type HEBCookies } from 'heb-client';

// Create session from browser cookies
const cookies: HEBCookies = {
  sat: 'your-sat-token',           // Required: auth token
  reese84: 'your-reese84-token',   // Required: bot protection
  incap_ses: '',
  CURR_SESSION_STORE: '790',       // Optional: store ID
};

const session = createSession(cookies);
const heb = new HEBClient(session);

// Search for products
await heb.ensureBuildId();
const results = await heb.search('organic milk', { limit: 20 });
console.log(results.products);

// Get product details
const product = await heb.getProduct(results.products[0].productId);
console.log(product.name, product.skuId, product.price);

// Add to cart
await heb.addToCart(product.productId, product.skuId, 2);
```

## Getting Session Cookies

Since H-E-B uses aggressive bot protection, you need to extract cookies from a logged-in browser session:

1. Log in to [heb.com](https://www.heb.com)
2. Open DevTools → Application → Cookies
3. Copy the `sat`, `reese84`, and `incap_ses` cookie values

**Pro Tip (The Easy Way):**
1. Open DevTools → **Network** tab on heb.com.
2. Click any request to `graphql` or `your-orders`.
3. Go to **Request Headers** > **Cookie**.
4. Right-click the value → **Copy value**.
5. Paste this full string directly into your environment variable.

### Environment Variables

To keep credentials secure, use the `HEB_COOKIES` environment variable:

```bash
export HEB_COOKIES='sat=abc...; reese84=xyz...; CURR_SESSION_STORE=790'
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
| `search(query, { limit? })` | Search products (Next.js data) |
| `getProduct(productId)` | Get full product details |
| `getSkuId(productId)` | Get just the SKU ID |
| `addToCart(productId, skuId, qty)` | Add/update cart item |
| `removeFromCart(productId, skuId)` | Remove item (sets qty to 0) |
| `addToCartById(productId, qty)` | Add to cart (auto-fetches SKU) |

| `typeahead(query)` | Get search suggestions |

### Session Management

| Function | Description |
|----------|-------------|
| `createSession(cookies, buildId?)` | Create session from cookies |
| `createSessionFromCookies(cookieStr, buildId?)` | Parse cookie string |
| `isSessionValid(session)` | Check if session expired |

## Error Handling

The library exports typed error classes:

```typescript
import { HEBAuthError, HEBCartError, HEBProductError } from 'heb-client';

try {
  await heb.addToCart(productId, skuId, 1);
} catch (err) {
  if (err instanceof HEBCartError) {
    console.error('Cart error:', err.message);
  }
}
```

## Notes

- **Session expiry**: The `sat` token expires after ~24h. Re-extract cookies when you get auth errors.
- **Bot protection**: The `reese84` and `incap_ses` cookies can go stale. If requests fail with 403, refresh them.
- **Store context**: Set `CURR_SESSION_STORE` to get accurate pricing and availability for your store.
- **Search data**: Product search uses the Next.js data endpoint and requires a valid buildId.

## License

ISC
