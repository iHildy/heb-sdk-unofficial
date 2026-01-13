# HEB Cookie Bridge Extension

This Chrome/Firefox extension securely hands off your H‑E‑B session cookies to your `heb-mcp` server. In remote mode, it uses Clerk authentication so cookies are only stored for the signed‑in user. In local mode, it can still push cookies to `http://localhost:4321` for testing.

## Installation

1. **Chrome/Edge**:
   - Open `chrome://extensions`.
   - Enable **Developer Mode** (top right).
   - Click **Load unpacked**.
   - Select this folder (`packages/cookie-bridge-extension`).

2. **Firefox**:
   - Open `about:debugging#/runtime/this-firefox`.
   - Click **Load Temporary Add-on...**.
   - Select `manifest.json`.

## Remote (Recommended)

1. Deploy `heb-mcp` with Clerk enabled (see `packages/heb-mcp/README.md`).
2. (Optional) Populate `packages/cookie-bridge-extension/config.json` from the repo root `.env`:

```
pnpm sync:extension-config
```

Supported env keys: `MCP_SERVER_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_JWT_TEMPLATE_NAME`.
3. Open the extension popup and set:
   - **Server URL**: your hosted MCP URL (e.g. `https://mcp.example.com`).
   - **Clerk Publishable Key**: the same Clerk app as the server.
   - **JWT Template Name** (optional): use the same template name you configured in Clerk (e.g. `heb-mcp`).
4. Click **Save Settings** and grant host permissions.
5. Sign in via the embedded Clerk UI.
6. Log in to [heb.com](https://www.heb.com) and the extension will sync cookies automatically.

## Local Testing

1. Run `heb-mcp` locally in STDIO mode (local testing) and keep the cookie bridge on `http://localhost:4321`.
2. In the extension popup, set **Server URL** to `http://localhost:4321` and click **Save Settings**.
3. No Clerk sign‑in is required for local testing.

## Badge States

- **ON**: Cookies synced successfully.
- **WAIT**: Missing required cookies (`sat`/`reese84`).
- **AUTH**: Sign in required or token expired.
- **PERM**: Host permission not granted (open the popup and save settings).
- **ERR/OFF**: Server error or server offline.

## Security

- Remote mode requires Clerk auth and the server stores cookies per user.
- Local mode only sends cookies to `http://localhost:4321`.
- The extension stores a short‑lived Clerk session token in `chrome.storage.local`.
- Clerk JS is bundled locally under `packages/cookie-bridge-extension/vendor/clerk` to comply with extension store policies that prohibit remote code.
