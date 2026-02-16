# heb-sdk-unofficial

Unofficial TypeScript SDK for the H-E-B Grocery API.

## Install

```bash
npm install heb-sdk-unofficial
# or
pnpm add heb-sdk-unofficial
```

---

## Quick Start

Create a bearer session from OAuth tokens and make your first API call.

```typescript
import { createTokenSession, HEBClient } from 'heb-sdk-unofficial';

const session = createTokenSession({
  accessToken: process.env.HEB_ACCESS_TOKEN ?? '',
  refreshToken: process.env.HEB_REFRESH_TOKEN,
  idToken: process.env.HEB_ID_TOKEN,
  expiresIn: 1800,
});

const heb = new HEBClient(session);

// Set store for pricing and availability
await heb.setStore('790');

// Search products
const results = await heb.search('coffee', { limit: 10 });
console.log(results.products.map((p) => p.name));
```

---

## Sessions

Bearer sessions use OAuth tokens and work with search, orders, account, and weekly ad APIs. Cookie sessions use browser cookies and work with cart and shopping lists.

Use `heb-auth-unofficial` to generate tokens via PKCE flow, or `createTokenSession` directly.

```typescript
import { createTokenSession, createSessionFromCookies } from 'heb-sdk-unofficial';

// OAuth bearer tokens (mobile API)
const bearer = createTokenSession({
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
  idToken: 'your-id-token',
  expiresIn: 1800,
});

// Cookie session (web API)
const cookies = createSessionFromCookies('sat=abc...; reese84=xyz...');
```

---

## Set Store Context

Store context drives pricing and availability. Set it before search, product details, homepage, and weekly ad calls.

```typescript
await heb.setStore('790');
```

---

## API Reference

### Search & Products

| Method | Description |
|--------|-------------|
| `search(query, { limit? })` | Search products (mobile GraphQL) |
| `getProduct(productId)` | Get full product details |
| `getSkuId(productId)` | Get just the SKU ID |
| `typeahead(query)` | Get search suggestions |

### Cart

| Method | Description |
|--------|-------------|
| `getCart()` | Get current cart contents |
| `addToCart(productId, skuId, qty)` | Add/update cart item |
| `addToCartById(productId, qty)` | Add to cart (auto-fetches SKU) |
| `removeFromCart(productId, skuId)` | Remove item (sets qty to 0) |

### Account & Orders

| Method | Description |
|--------|-------------|
| `getAccountDetails()` | Account profile + saved addresses |
| `getOrders({ page? })` | Order history |
| `getOrder(orderId)` | Order details |

### Content

| Method | Description |
|--------|-------------|
| `getHomepage()` | Homepage sections |
| `getWeeklyAdProducts({ limit? })` | Weekly ad products |

---

## Error Handling

Typed error classes for different failure modes:

```typescript
import { HEBAuthError, HEBCartError, HEBProductError } from 'heb-sdk-unofficial';

try {
  await heb.addToCart(productId, skuId, 1);
} catch (err) {
  if (err instanceof HEBCartError) {
    console.error('Cart error:', err.message);
  }
}
```

---

## Cookie Sessions

Extract cookies from a logged-in browser session:

1. Log in to [heb.com](https://www.heb.com)
2. Open DevTools → Network tab
3. Click any request to `graphql` or `your-orders`
4. Copy the `Cookie` header value
5. Use with `createSessionFromCookies()`

```bash
export HEB_COOKIES='sat=abc...; reese84=xyz...; CURR_SESSION_STORE=790'
```

```typescript
const session = createSessionFromCookies(process.env.HEB_COOKIES!);
```

---

## Token Refresh

Set `session.refresh` to enable automatic token refresh near expiry:

```typescript
import { refreshTokens } from 'heb-auth-unofficial';
import { updateTokenSession } from 'heb-sdk-unofficial';

session.refresh = async () => {
  const tokens = await refreshTokens({ refreshToken: session.refreshToken! });
  updateTokenSession(session, tokens);
};
```

---

## Notes

- **Session expiry**: The `sat` token expires after ~24h. Re-extract cookies when you get auth errors.
- **OAuth tokens (mobile)**: Access tokens expire in ~30 minutes. Use `refreshTokens` from `heb-auth-unofficial` to refresh.
- **Bot protection**: The `reese84` and `incap_ses` cookies can go stale. If requests fail with 403, refresh them.
- **Store context**: Set `CURR_SESSION_STORE` to get accurate pricing and availability for your store.
- **Bearer auth**: Required for search, product details, homepage, account, and orders.
- **Cookie auth**: Required for cart operations and shopping lists.

---

## License

ISC
