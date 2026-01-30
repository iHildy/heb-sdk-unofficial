# Troubleshooting

## No store selected
- Errors: `No store selected`, `INVALID_PRODUCT_STORE`.
- Fix: call `setStore("790")` or set `CURR_SESSION_STORE` before search, product, homepage, weekly ad.

## Wrong auth mode
- Errors like "Search requires a bearer session" or "Product details require a bearer session".
- Fix: use `createTokenSession` (bearer) for search/product/homepage/orders/account/weekly ad.

## 401/403 or UNAUTHORIZED
- Cookie sessions: re-extract `sat`, `reese84`, `incap_ses` from a logged-in browser.
- Bearer sessions: refresh tokens via `session.refresh` and `updateTokenSession`.

## Cart mutations behave like set
- `addToCart` and `quickAdd` set quantity. Read the cart to increment safely.

## Unknown operation
- `persistedQuery` throws when the operation name is missing in hash maps.
- Fix: add the hash to `GRAPHQL_HASHES` or `MOBILE_GRAPHQL_HASHES` and update `MOBILE_QUERY_MAP` if needed.

## Shopping context mismatch
- Availability looks wrong: set `shoppingContext` to `CURBSIDE_PICKUP`, `CURBSIDE_DELIVERY`, or `EXPLORE_MY_STORE`.

## Debugging tips
- Enable `session.debug` or `heb.setDebug(true)` to log payloads and responses.
- Inspect `getSessionInfo(session)` before a failing call.
