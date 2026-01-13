# H-E-B MCP Server

MCP (Model Context Protocol) server that exposes H‑E‑B grocery functionality as tools for AI assistants.

## Modes

- **Remote (default)**: SSE transport + Clerk auth + multi‑tenant cookie store.
- **Local testing**: STDIO transport + local cookie bridge (`http://localhost:4321`).

## Remote Deployment (Recommended)

### 1. Environment Variables

Set the following on your server:

- `MCP_MODE=remote` (optional; default)
- `PORT=3000`
- `CLERK_JWKS_URL`
- `CLERK_FRONTEND_URL` (required)
- `CLERK_JWT_TEMPLATE_NAME` (required; should match the name of your Clerk JWT template)
- `HEB_SESSION_ENCRYPTION_KEY` (32‑byte base64 key)
- `HEB_SESSION_STORE_DIR` (optional, default `./data/sessions`)

If you want the extension to auto-fill settings from `.env`, set:

- `MCP_SERVER_URL`
- `CLERK_PUBLISHABLE_KEY`

Generate a key with:

```bash
openssl rand -base64 32
```

### 2. Cookie Ingestion

The extension sends cookies to:

```
POST /api/cookies
Authorization: Bearer <clerk_session_token>
```

Cookies are stored per Clerk user.

### 3. SSE Endpoint

```
GET /sse
POST /messages?sessionId=...
```

Pass the same Clerk session token as `Authorization: Bearer <token>` when connecting to both endpoints.

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
        "HEB_SAT": "your-jwt-token",
        "HEB_REESE84": "your-bot-protection-token",
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
