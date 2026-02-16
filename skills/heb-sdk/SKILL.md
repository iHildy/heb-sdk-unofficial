---
name: heb-sdk-unofficial
description: Guide for implementing and using the heb-sdk-unofficial TypeScript client in apps or automations. Use when wiring sessions (cookie vs bearer), setting store/shopping context, calling HEBClient methods, handling errors, or using low-level GraphQL helpers in application code.
---

# heb-sdk-unofficial

## Overview
Use this skill to integrate the `heb-sdk-unofficial` client into apps and automations. Focus on the session model, store context, and which endpoints require bearer vs cookie auth.

## Workflow
1. Identify the feature you need and its auth requirements.
   - Load `references/client-methods.md` for the method map.
2. Build the correct session.
   - Cookie session for web GraphQL features.
   - Bearer session for mobile GraphQL features.
   - Load `references/sessions-auth.md` for details and refresh patterns.
3. Set context before calls that need it.
   - Store context is required for search, product details, homepage, and weekly ad.
   - Shopping context affects availability and fulfillment.
4. Call SDK methods through `HEBClient` unless you need an unsupported operation.
   - Use `persistedQuery`/`graphqlRequest` only when required.
   - Load `references/graphql-helpers.md` for operation-name rules.
5. Debug and handle errors.
   - Enable `heb.setDebug(true)` or `session.debug = true`.
   - Load `references/troubleshooting.md` for common failures.

## Implementation Guidelines
- Prefer `HEBClient` in app code; use exported functions for lower-level control or tree-shaking.
- Keep credentials in env vars (`HEB_COOKIES`, `HEB_ACCESS_TOKEN`, etc.). Never hard-code tokens.
- Always call `setStore()` (or set `CURR_SESSION_STORE`) before store-dependent calls.
- Cart mutations set quantity (not increment). Read the cart if you need to add relative quantities.

## Reference Files
- `references/overview.md`: package layout, core concepts, and endpoint split.
- `references/sessions-auth.md`: session creation, refresh, and context tips.
- `references/client-methods.md`: HEBClient method map and auth requirements.
- `references/graphql-helpers.md`: persisted query rules, error codes, and operation mapping.
- `references/types-and-formatters.md`: key types and formatter utilities.
- `references/troubleshooting.md`: common errors and fixes.
- `references/examples.md`: copy-ready usage snippets.
