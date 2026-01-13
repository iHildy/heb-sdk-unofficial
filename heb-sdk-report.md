# H-E-B SDK Technical Learnings Report

This report summarizes observations and technical findings from programmatically interacting with the H-E-B API via the unofficial TypeScript SDK.

## 1. Search Behavior & Limitations

### Next.js Search Data
- **Next.js Search (`search`)**: Uses the `_next/data/<buildId>/en/search.json?q=...` endpoint and avoids dynamic GraphQL hashes entirely.
- **Result Shape**: Search results arrive as `SearchGridV2.items` with pricing, inventory, SKU, and facet data in a single payload.
- **Fuzzy Matching**: The search engine is highly permissive. Searching for specific sizes (e.g., "26 oz") often returns similar products in different flavors or sizes first. Strict client-side filtering (e.g., `p.name.includes('26 Oz')`) is necessary for automation.

## 2. Cart Management Anatomy

### The `cartItemV2` Mutation
- **Set vs. Increment**: The H-E-B GraphQL mutation `cartItemV2` **sets** the absolute quantity rather than incrementing it. To "add 1 more", the client must first fetch the current cart state.
- **Product ID vs. SKU ID**: Adding to cart requires both IDs. 
    - `productId`: Platform-level identifier (7-8 digits).
    - `skuId`: Inventory-level identifier (10 digits).
- **Removal**: Removing an item is performed by setting the quantity to `0` using the same `cartItemV2` operation.

### Data Parsing Anomalies
- **Inconsistent Cart Responses**: In some GraphQL responses, the `commerceItems` array may return empty even if the mutation reports a `success`. This suggests that the cart items are sometimes updated asynchronously or cached differently in the API response compared to the `subtotal`.

## 3. Session & Build Context

### The `buildId` Constant
- The `buildId` is critical for `_next/data/` requests. It changes with every production deployment of `heb.com`.
- **Discovery**: The most reliable way to get the current `buildId` without a browser is to fetch the homepage and regex match: `/"buildId":"([^"]+)"/`.

### Header Requirements
- **Apollo Client**: The `apollographql-client-name` (set to `WebPlatform-Solar (Production)`) and `apollographql-client-version` (set to the `buildId`) are mandatory. Excluding these or using generic values can result in `403 Forbidden` or generic errors.

## 4. Automation Risks

### Bot Protection
- **Session Duration**: The `sat` (JWT) cookie has a fixed expiration. Since it is `HttpOnly`, it cannot be refreshed programmatically without the full OIDC flow or browser automation.
- **Imperva/Akamai**: The `reese84` and `incap_ses` cookies are vital for bypassing bot protection. If these are stale, requests will fail with a `403` or a redirect to a challenge page, which the SDK cannot solve headlessly.

## 5. Summary of Successfully Added Target
- **Product**: H-E-B Hit the Trail Mix
- **Size**: 26 Oz
- **Product ID**: `780815`
- **SKU ID**: `4122075621`
- **Quantity**: 3
