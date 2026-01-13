This report provides a comprehensive technical breakdown of the H-E-B web API discovered during the search, navigation, and cart management journey. Use this as a foundation for building a high-performance unofficial SDK.

H-E-B Unofficial API & SDK Technical Report
Architecture Overview
Engine: Next.js (React)
Data Layer: GraphQL (Apollo) with Persisted Queries (APQ).
CDN/Security: Akamai/Imperva (Incapusla) for bot mitigation and AWS for load balancing.
State Management: Client-side transitions use _next/data for initial loads and GraphQL for interactive state (Cart, Search).
1. Search & Discovery API
H-E-B uses a hybrid approach for product discovery.

*   **Initial Search (SSR)**: The primary search results for a direct URL hit (e.g., `/search?q=...`) are server-side rendered. Data is embedded in the page source within the `<script id="__NEXT_DATA__">` block. Headless SDKs can parse this for SEO-friendly, non-GraphQL discovery.
*   **Interactive Search (GraphQL)**: Filtering, pagination, and dynamic updates use the GraphQL endpoint.

**Endpoint**: `POST https://www.heb.com/graphql`
**Example Payload (searchProductQuery)**:
```json
{
  "operationName": "searchProductQuery",
  "variables": {
    "query": "downy wrinkle release spray",
    "page": 1,
    "filters": []
  },
  "extensions": {
    "persistedQuery": {
      "version": 1,
      "sha256Hash": "[DYNAMIC_HASH_PER_BUILD]"
    }
  }
}
```
**SDK Tip**: To perform a 100% headless search without parsing HTML, use the `typeaheadContent` operation (see hashes section) or extract the `searchProductQuery` hash from the site's `_app.js` or `search.js` static chunks.
2. Product Details API
H-E-B leverages Next.js server-side props for Product Detail Pages (PDP).

Endpoint: GET https://www.heb.com/_next/data/[BUILD_ID]/product-detail/[SLUG]/[PRODUCT_ID].json
Return Type: Pure JSON.
Data Content: Includes price history, nutritional info, aisle location, SKU ID, and fulfillment options (Curbside vs. Home Delivery).
3. Cart Management (The "Add to Cart" Mutation)
The cart is managed via a specific mutation that requires both a Product ID (platform-level) and a SKU ID (inventory-level).

Endpoint: POST https://www.heb.com/graphql
Operation Name: cartItemV2
Critical Persisted Hash: ade8ec1365c185244d42f9cc4c13997fec4b633ac3c38ff39558df92b210c6d0
Request Body:
json
{
  "operationName": "cartItemV2",
  "variables": {
    "userIsLoggedIn": true,
    "productId": "6029501",
    "skuId": "5150024331",
    "quantity": 2
  },
  "extensions": {
    "persistedQuery": {
      "version": 1,
      "sha256Hash": "ade8ec1365c185244d42f9cc4c13997fec4b633ac3c38ff39558df92b210c6d0"
    }
  }
}
Behavior: Updating quantity to 3 or 0 uses the same mutation. Setting quantity to 0 effectively removes the item.

**Common Error Codes**:
*   `INVALID_PRODUCT_STORE`: Occurs when the `productId`/`skuId` pair is not available in the store specified by the `CURR_SESSION_STORE` cookie.
*   `UNAUTHORIZED`: Occurs if `userIsLoggedIn` is true but the `sat` cookie is missing or expired.

4. Required Headers & Authentication
To avoid "403 Forbidden" or generic error responses, the SDK must mimic a legitimate web client.

Header | Purpose
--- | ---
`apollographql-client-name` | `WebPlatform-Solar (Production)`
`apollographql-client-version` | Current site version (Build ID, e.g., `4f7ebba9...`)
`cookie` | **CRITICAL**: Must include `incap_ses`, `reese84`, `sat` (JWT), and `CURR_SESSION_STORE` (Store Context).
`x-nextjs-data` | Set to `1` when fetching `.json` data from `_next/data`.

### ⚠️ CRITICAL: The `sat` Cookie Limitation

The `sat` (Session Authentication Token) cookie is **HttpOnly** and cannot be accessed via:
- `document.cookie`
- Cookie Store API
- Any client-side JavaScript

**Implications for SDK Development:**
1. **Browser-based login required**: The `sat` token can only be obtained by logging in via a real browser session and extracting it from Chrome DevTools → Application → Cookies.
2. **OIDC flow alternative**: Implement the H-E-B OIDC authentication flow (see section 6 below) to programmatically obtain the `sat` JWT.
3. **Token expiration**: The `sat` JWT has an expiration. Monitor for `401 UNAUTHORIZED` errors and refresh accordingly.

---

## 6. Authentication System (OIDC)

H-E-B uses a **custom OIDC (OpenID Connect) provider** at `accounts.heb.com` - NOT Gigya/SAP Customer Data Cloud. The `gigya_uid` claim is legacy backend linkage only.

### OIDC Discovery Endpoint
```
https://accounts.heb.com/oidc/.well-known/openid-configuration
```

### Key Endpoints
| Endpoint | URL |
|----------|-----|
| **Authorization** | `https://accounts.heb.com/oidc/auth` |
| **Token** | `https://accounts.heb.com/oidc/token` |
| **JWKS** | `https://accounts.heb.com/oidc/jwks` |
| **Revocation** | `https://accounts.heb.com/oidc/token/revocation` |
| **End Session** | `https://accounts.heb.com/oidc/session/end` |
| **PAR (Pushed Auth Request)** | `https://accounts.heb.com/oidc/request` |

### Issuer
```
http://prd-heb-auth.heb-ecom-idp-prd.aws.heb.internal
```
(External: `https://accounts.heb.com/oidc`)

### Supported Flows
- **Grant Types**: `authorization_code`, `implicit`, `refresh_token`
- **Response Types**: `code`, `id_token`, `code id_token`, `none`
- **Response Modes**: `query`, `fragment`, `form_post`
- **PKCE**: Supported via `S256` code challenge method

### Scopes
- `openid` (required)
- `profile`
- `offline_access` (for refresh tokens)

### Claims Returned
```json
["sub", "amr", "email", "email_verified", "family_name", "gigya_uid", 
 "given_name", "is_vpp", "phone_number", "phone_number_verified", 
 "profile_hash", "sid", "auth_time", "iss"]
```

### Token Endpoint Auth Methods
- `client_secret_basic`
- `client_secret_post`
- `client_secret_jwt`
- `private_key_jwt`
- `none` (public clients)

### ID Token Signing
- Algorithm: `RS256`

### Authentication Flow (Interactive)
1. User navigates to `/my-account/login`
2. Redirects to `https://accounts.heb.com/interaction/[INTERACTION_ID]/login`
3. User submits email → password (multi-step form)
4. On success, redirects back with authorization code
5. Token exchange occurs server-side
6. `sat` cookie is set (HttpOnly, Secure)

### SDK Authentication Strategy
Since `client_id` is managed server-side, SDK authentication requires:
1. **Browser Automation**: Use Playwright/Puppeteer to complete the interactive login flow
2. **Cookie Extraction**: Capture the `sat` cookie after successful login
3. **Token Refresh**: Monitor for 401s and re-authenticate as needed

### Sample Cookies After Auth
| Cookie | Purpose |
|--------|---------|
| `sat` | Session Authentication Token (JWT, HttpOnly) |
| `reese84` | Imperva bot mitigation fingerprint |
| `incap_ses_*` | Imperva session tracking |
| `CURR_SESSION_STORE` | Selected store context |

**Verified Product ID → SKU Mapping Example:**
| Product | Product ID | SKU ID |
|---------|------------|--------|
| H-E-B 10g Protein Chewy Bars - Peanut Butter Chocolate Chip (5 ct) | `2996503` | `4122077587` |
| Downy Wrinkle Releaser Fabric Spray - Light Fresh | `6029501` | `5150024331` |

**Note**: `productId` ≠ `skuId`. The SKU ID is inventory-level and can be found in:
- Apollo client state (`__APOLLO_STATE__`)
- `__NEXT_DATA__` on PDP pages
- Network intercept of "Add to Cart" actions


5. SDK Implementation Strategy
1. **Fulfillment Context First**: Any search or price check requires a fulfillment context (Store ID). Call the `storeLocation` GraphQL query first to set the session's store.
2. **Handle Imperva (Bot Protection)**: H-E-B uses `reese84` and `incap_ses` for bot mitigation. These must be harvested from a valid browser session or initial homepage hit.
3. **Store Context**: The `CURR_SESSION_STORE` cookie is vital. Mutations will fail with `INVALID_PRODUCT_STORE` if the product is regional and the store context is missing or incorrect.
4. **Headless Execution**: The SDK does **not** require a browser for everyday operations (Search, Cart, Price Check) once session cookies and Persisted Query hashes are secured.


Image Optimization: Product images follow a predictable pattern: https://images.heb.com/is/image/HEBGrocery/[PRODUCT_ID]. You can append ?hei=360&wid=360 to fetch specific sizes without hitting an API.
Identified GraphQL Hashes
*   **Cart Add/Update (`cartItemV2`)**: `ade8ec1365c185244d42f9cc4c13997fec4b633ac3c38ff39558df92b210c6d0`
*   **Search Autocomplete (`typeaheadContent`)**: `1ed956c0f10efcfc375321f33c40964bc236fff1397a4e86b7b53cb3b18ad329`
*   **PDP Data Search (`searchProducts`)**: Embedded in SSR `__NEXT_DATA__`.