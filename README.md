# heb-sdk-unofficial

Unofficial TypeScript monorepo for integrating with H‑E‑B grocery experiences. It combines a full client SDK, an MCP server for AI assistants, OAuth helpers, and a cookie‑bridge browser extension. This README is intentionally high level; detailed docs live at [https://heb-sdk-unofficial.hildy.io/docs](https://heb-sdk-unofficial.hildy.io/docs).

**Packages**
- `packages/heb-sdk` TypeScript SDK that wraps H‑E‑B web + mobile endpoints with typed models, formatters, and session helpers.
- `packages/heb-auth` PKCE + OAuth utilities used to link H‑E‑B mobile bearer tokens.
- `packages/heb-mcp` MCP server exposing H‑E‑B tools over MCP (remote streamable HTTP + OAuth/Clerk, or local STDIO).
- `packages/heb-mcp/web` Minimal web UI used for OAuth linking and connect flows.
- `packages/cookie-bridge-extension` Chrome/Firefox extension that syncs authenticated H‑E‑B cookies to the MCP server, enabling cookie-based sessions.

**Capabilities (via `heb-sdk-unofficial` and MCP tools)**
- Product search, typeahead, and product detail retrieval.
- Cart operations (add/update/remove) and cart summary.
- Order history + order details.
- Shopping lists and “Buy It Again” items.
- Store search + store/session context management.
- Delivery and curbside slot discovery + reservation.
- Weekly ad discovery + category filters.
- Homepage feed sections, banners, promotions, and featured items.

**How it fits together**
- The cookie‑bridge extension captures authenticated H‑E‑B cookies from a logged‑in browser and sends them to the server.
- `heb-mcp-unofficial` stores sessions (local file or encrypted per‑user store) and exposes MCP tools backed by `heb-sdk-unofficial`.
- `heb-auth-unofficial` provides OAuth/PKCE helpers for linking mobile bearer tokens when needed.

**Extensibility**
- Reuse the existing MCP tool set as building blocks, or register your own tools by wiring new `heb-sdk-unofficial` calls in `packages/heb-mcp/src/tools.ts`.
- Wrap the SDK however you want (for example, build a `heb-cli`, a cron worker, or a custom service layer).
- Extend API coverage in `packages/heb-sdk` (new endpoints, formatters, types) as your needs grow.

**Notes**
- This is an unofficial project and is not affiliated with H‑E‑B.
- H‑E‑B’s bot protection and session requirements mean you need valid user sessions/cookies or linked bearer tokens to access data.
