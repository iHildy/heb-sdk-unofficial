# GraphQL helpers and persisted queries

## Helpers
- `graphqlRequest(session, payload)` sends a raw GraphQL request.
- `persistedQuery(session, operationName, variables)` resolves the hash and sends a persisted query.
- Error helpers: `ERROR_CODES`, `hasErrorCode`, `getErrorMessages`.

## Operation name resolution
`persistedQuery` selects hashes based on `session.authMode`:
- Bearer sessions look in `MOBILE_GRAPHQL_HASHES` first.
- Cookie sessions look in `GRAPHQL_HASHES`.
- If the operation is missing, it throws `Unknown operation` with available names.

## Mobile name mapping
`MOBILE_QUERY_MAP` in `packages/heb-sdk-unofficial/src/api.ts` maps web-style names to mobile operation names:
- `cartItemV2` -> `addItemToCartV2`
- `cartEstimated` -> `cartV2`
- `typeaheadContent` -> `TypeaheadContent`
- `ReserveTimeslot` -> `reserveTimeslotV3`

## Extending with new operations
1. Add the persisted query hash to `packages/heb-sdk-unofficial/src/types.ts` in the right map.
2. If the mobile operation name differs, add to `MOBILE_QUERY_MAP`.
3. Use `persistedQuery(session, operationName, variables)` in your module.
4. Export the new function in `packages/heb-sdk-unofficial/src/index.ts`.

## Common error patterns
- `UNAUTHORIZED`: refresh bearer tokens or re-extract cookies.
- `INVALID_PRODUCT_STORE`: missing or wrong `CURR_SESSION_STORE`.
