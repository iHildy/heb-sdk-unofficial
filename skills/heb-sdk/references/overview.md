# heb-sdk-unofficial overview

## Purpose
A TypeScript client for the H-E-B APIs. It wraps web and mobile GraphQL endpoints behind a single `HEBSession` and exposes a high-level `HEBClient` plus low-level helpers.

## Entry points
- High level: `new HEBClient(session)`.
- Low level: exported functions like `searchProducts`, `getCart`, `persistedQuery`.
- Formatters: `formatter.cart`, `formatProductDetails`, etc.

## Auth modes and endpoints
- Cookie sessions target the web GraphQL host (`https://www.heb.com/graphql`).
- Bearer sessions target the mobile GraphQL host (`https://api-edge.heb-ecom-api.hebdigital-prd.com/graphql`).
- `createTokenSession` sets a mobile user agent by default; override via options if needed.

## Context rules
- Store context (`CURR_SESSION_STORE`) is required for search, product details, homepage, and weekly ad.
- Shopping context (`CURBSIDE_PICKUP`, `CURBSIDE_DELIVERY`, `EXPLORE_MY_STORE`) affects availability.
- `setStore()` updates cookies; for cookie sessions it also calls a fulfillment mutation to set server context.

## Debugging
- Enable `heb.setDebug(true)` or `session.debug = true` to log GraphQL payloads/responses.
