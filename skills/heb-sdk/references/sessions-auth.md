# Sessions and auth

## Cookie sessions (web GraphQL)
Use when you need cart, typeahead, store search, or shopping lists.

- Required cookies: `sat`, `reese84`, `incap_ses`.
- `createSessionFromCookies(cookieInput)` accepts either:
  - a Cookie header string (`sat=...; reese84=...; ...`), or
  - a DevTools JSON export (array of cookie objects).
- `createSessionFromCookies` throws if `sat` is missing.

## Bearer sessions (mobile GraphQL)
Use for search, product details, homepage, orders, account, and weekly ad.

- Build with `createTokenSession({ accessToken, refreshToken?, idToken?, expiresIn? })`.
- By default it uses a mobile user agent and sets `session.endpoints.graphql` to the mobile host.
- You can override endpoints and user agent via `createTokenSession` options.

## Refreshing tokens
- Attach `session.refresh = async () => { ... }`.
- `graphqlRequest` and `persistedQuery` call `ensureFreshSession` which triggers refresh when near expiry.
- After refresh, call `updateTokenSession(session, tokens)` to update headers and expiry.

## Session health checks
- `isSessionAuthenticated(session)` verifies presence of cookies or access token.
- `isSessionValid(session)` checks expiry (60s buffer).
- `getSessionInfo(session)` reports storeId, expiry, and shopping context.

## Context setup
- Store context is a cookie (`CURR_SESSION_STORE`).
- `await heb.setStore("790")` sets the cookie and (for cookie sessions) sends a fulfillment mutation.
- Shopping context defaults to `CURBSIDE_PICKUP`. Set with `heb.setShoppingContext("CURBSIDE_DELIVERY")`.

## Environment variables (recommended)
- `HEB_COOKIES` for cookie sessions.
- `HEB_ACCESS_TOKEN`, `HEB_REFRESH_TOKEN`, `HEB_ID_TOKEN` for bearer sessions.
