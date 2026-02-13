# H-E-B MCP Server

MCP (Model Context Protocol) server that exposes H‑E‑B grocery functionality as tools for AI assistants.

## Modes

- **Remote (default)**: SSE transport + Clerk auth + multi‑tenant cookie store.
- **Local testing**: STDIO transport + local cookie bridge (`http://localhost:4321`). (Note: The bridge is unmaintained; use `heb-auth` for better reliability).

## Remote Deployment (Recommended)

### 1. Environment Variables

Set the following on your server:

- `MCP_MODE=remote` (optional; default)
- `PORT=3000`
- `MCP_SERVER_URL` (public base URL for OAuth + metadata, e.g. `https://mcp.example.com`)
- `MCP_OAUTH_ISSUER_URL` (optional; defaults to `MCP_SERVER_URL`)
- `MCP_OAUTH_SCOPES` (optional; default `mcp:tools`)
- `MCP_OAUTH_CLIENTS_FILE` (optional; defaults to `./data/oauth/clients.json`)
- `CLERK_JWKS_URL`
- `CLERK_FRONTEND_URL` (required)
- `CLERK_JWT_TEMPLATE_NAME` (required; `aud` claim from Clerk JWT template)
- `CLERK_SIGN_IN_URL` (required for OAuth logins; should redirect back to `/authorize`)
- `HEB_SESSION_ENCRYPTION_KEY` (32‑byte base64 key)
- `HEB_SESSION_STORE_DIR` (optional, default `./data/sessions`)
- `HEB_OAUTH_CLIENT_ID` (optional, default `myheb-ios-prd`)
- `HEB_OAUTH_REDIRECT_URI` (optional, default `com.heb.myheb://oauth2redirect`)
- `HEB_OAUTH_SCOPE` (optional, default `openid profile email`)
- `HEB_OAUTH_AUTH_URL` (optional, default `https://accounts.heb.com/oidc/auth`)
- `HEB_OAUTH_TOKEN_URL` (optional, default `https://accounts.heb.com/oidc/token`)
- `HEB_OAUTH_USER_AGENT` (optional, default mobile UA)
- `HEB_OAUTH_UPSERT_USER` (optional, default `true`)

If you want the extension to auto-fill settings from `.env`, set:

- `MCP_SERVER_URL`
- `CLERK_PUBLISHABLE_KEY`

Generate a key with:

```bash
openssl rand -base64 32
```

`MCP_SERVER_URL` should be the externally reachable base URL (the same value you use in the extension).

### 2. Cookie Ingestion

The extension sends cookies to:

```
POST /api/cookies
Authorization: Bearer <clerk_session_token>
```

Cookies are stored per Clerk user.

### 3. HEB OAuth (Mobile) Linking (Experimental)

Use Authorization Code + PKCE with explicit user consent to obtain bearer tokens for supported APIs.

Fastest way to link:

```
GET /connect
```

This page walks the user through H‑E‑B login and code exchange.

Flow outline:

1. Generate PKCE (`code_verifier`, `code_challenge`) on the client.
2. Open the auth URL and complete login + consent.
3. Copy the returned redirect URL (or authorization code) from your browser.
4. Exchange the code with:

```
POST /api/heb/oauth/exchange
Authorization: Bearer <clerk_session_token>
Content-Type: application/json

{
  \"code\": \"...\",
  \"code_verifier\": \"...\"
}
```

Optional utilities:

- `GET /api/heb/oauth/status` to check if tokens are stored.
- `POST /api/heb/oauth/refresh` to force refresh.

Tokens are encrypted and stored per user in the same file store as cookies (`HEB_SESSION_ENCRYPTION_KEY` required).

Helper utilities for PKCE and auth URL generation live in the `heb-auth` package (see `packages/heb-auth`).

### 4. OAuth Endpoints (ChatGPT)

OAuth endpoints are exposed at:

```
/.well-known/oauth-authorization-server
/.well-known/oauth-protected-resource
/authorize
/token
/register
```

ChatGPT uses dynamic client registration and OAuth Authorization Code + PKCE.
The `/sse` and `/messages` endpoints require OAuth bearer tokens with `mcp:tools` scope.
For local HTTP testing, set `MCP_DANGEROUSLY_ALLOW_INSECURE_ISSUER_URL=1`.
`CLERK_SIGN_IN_URL` may include a `{redirect}` or `{redirect_url}` placeholder, or it can accept a `redirect_url`/`after_sign_in_url` query param.

### 5. SSE Endpoint

```
GET /sse
POST /messages?sessionId=...
```

Pass the OAuth access token as `Authorization: Bearer <token>` when connecting to both endpoints.

## Local Testing (Claude Desktop)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run in Local Mode

```bash
MCP_MODE=local pnpm dev
```

This starts STDIO transport and the local cookie bridge at `http://localhost:4321`.

### 3. Configure Claude Desktop

Add to `~/.config/claude/config.json` (or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "heb": {
      "command": "node",
      "args": ["/absolute/path/to/heb-mcp/dist/server.js"],
      "env": {
        "MCP_MODE": "local",
        "HEB_SAT": "your-session-token",
        "HEB_REESE84": "your-session-cookie",
        "HEB_STORE_ID": "790"
      }
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `search_products` | Search the H‑E‑B product catalog |
| `get_product` | Get detailed product information |
| `add_to_cart` | Add a product to cart |
| `update_cart_item` | Update cart item quantity |
| `remove_from_cart` | Remove item from cart |
| `search_and_add` | Search and add first result to cart |
| `get_order_history` | Get past orders (not yet implemented) |
| `get_delivery_slots` | Get delivery times (not yet implemented) |

## Development

```bash
# Watch mode with tsx
pnpm dev

# Type check
pnpm typecheck
```

## Docker Deployment

For remote access:

```bash
# Build and run
docker-compose up --build

# SSE endpoint available at http://localhost:3000/sse
```
