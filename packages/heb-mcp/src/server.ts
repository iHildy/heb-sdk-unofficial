#!/usr/bin/env node
/**
 * HEB MCP Server
 *
 * Exposes H-E-B grocery API functionality as MCP tools for AI assistants.
 *
 * Transport modes:
 * - SSE (default): Remote, multi-tenant deployments (OAuth for MCP + Clerk for cookie ingestion)
 * - STDIO: Local testing (set MCP_MODE=local or MCP_TRANSPORT=stdio)
 *
 * Cookie ingestion:
 * - Remote: POST /api/cookies with Clerk auth (Authorization: Bearer <token>)
 * - Local: POST http://localhost:4321/api/cookies
 */

import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import { getOAuthProtectedResourceMetadataUrl, mcpAuthRouter } from '@modelcontextprotocol/sdk/server/auth/router.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import type { HEBClient, HEBCookies, HEBSession } from 'heb-client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { requireAuth, requireClerkAuth } from './auth.js';
import {
  exchangeHebCode,
  isUpsertEnabled,
  maybeUpsertHebUser,
  resolveHebOAuthConfig,
} from './heb-oauth.js';
import { createSessionStoreFromEnv, MultiTenantSessionManager } from './multi-tenant.js';
import {
  ClerkOAuthProvider,
  createAuthorizeContextMiddleware,
  resolveIssuerUrl,
  resolveOAuthScopes,
  resolvePublicUrl,
} from './oauth.js';
import { LOCAL_COOKIE_FILE, saveSessionToFile, sessionManager } from './session.js';
import { registerTools } from './tools.js';

const SERVER_NAME = 'heb';
const SERVER_VERSION = '0.1.0';

const transportOverride = process.env.MCP_TRANSPORT?.toLowerCase();
const mode = (process.env.MCP_MODE ?? 'remote').toLowerCase();
const transport = transportOverride ?? (mode === 'local' ? 'stdio' : 'sse');
const isLocal = transport === 'stdio';

async function main(): Promise<void> {
  if (isLocal) {
    // Local testing: STDIO + local cookie bridge + file-backed session manager
    sessionManager.initialize();
    await startLocalCookieBridgeServer();

    const server = createMcpServer(() => sessionManager.getClient(), saveSessionToFile, undefined, 'Local File');
    await startSTDIOServer(server);
    return;
  }

  // Remote mode: SSE + Clerk auth + multi-tenant session store
  const sessionStore = createSessionStoreFromEnv({ requireEncryption: true });
  const multiTenantManager = new MultiTenantSessionManager(sessionStore);
  await startRemoteServer(multiTenantManager);
}

function createMcpServer(
  getClient: () => HEBClient | null,
  saveCookies?: (cookies: HEBCookies) => Promise<void> | void,
  saveSession?: (session: HEBSession) => Promise<void> | void,
  sessionStatusSource?: string
): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerTools(server, getClient, {
    saveCookies,
    saveSession,
    sessionStatusSource,
  });

  return server;
}

async function startLocalCookieBridgeServer(): Promise<void> {
  const app = express();
  const PORT = 4321;

  app.use(express.json({ limit: '250kb' }));

  const iconPath = mode === 'local' 
    ? join(__dirname, '..', 'icon16.png') // in src, icon is in ..
    : join(__dirname, '..', 'icon16.png'); // in dist, icon is also in .. if copied correctly

  app.get('/favicon.ico', (_req, res) => {
    res.sendFile(iconPath);
  });

  // CORS for the extension
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.post('/api/cookies', (req, res) => {
    try {
      const { sat, reese84 } = req.body;

      if (!sat || !reese84) {
        res.status(400).json({ error: 'Missing sat or reese84 cookies' });
        return;
      }

      saveSessionToFile({
        sat,
        reese84,
        ...req.body,
      });

      res.json({
        success: true,
        message: `Cookies saved to ${LOCAL_COOKIE_FILE} and session will reload automatically`,
      });
    } catch (err) {
      console.error('[heb-mcp] Error saving cookies:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.listen(PORT, () => {
    console.error(`[heb-mcp] Local Cookie Bridge listening on http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error(`[heb-mcp] Failed to start Local Cookie Bridge on port ${PORT}:`, err.message);
  });
}

async function startSTDIOServer(server: McpServer): Promise<void> {
  console.error('[heb-mcp] Starting STDIO transport (local mode)...');

  const transportInstance = new StdioServerTransport();
  await server.connect(transportInstance);

  console.error('[heb-mcp] Server running on STDIO');
}

async function startRemoteServer(sessionManagerRemote: MultiTenantSessionManager): Promise<void> {
  const { SSEServerTransport } = await import('@modelcontextprotocol/sdk/server/sse.js');

  const port = parseInt(process.env.PORT ?? '3000', 10);
  const publicUrl = resolvePublicUrl(port);
  const issuerUrl = resolveIssuerUrl(publicUrl);
  const oauthScopes = resolveOAuthScopes();
  const app = express();

  app.use(express.json({ limit: '250kb' }));
  app.set('trust proxy', 1); 

  app.get('/favicon.ico', (_req, res) => {
    res.sendFile(join(__dirname, '..', 'icon16.png'));
  });

  const oauthProvider = new ClerkOAuthProvider({ publicUrl, supportedScopes: oauthScopes });
  app.use('/authorize', createAuthorizeContextMiddleware({
    publicUrl,
    signInUrl: process.env.CLERK_SIGN_IN_URL,
  }));
  app.use('/connect', createAuthorizeContextMiddleware({
    publicUrl,
    signInUrl: process.env.CLERK_SIGN_IN_URL,
  }));
  app.use(mcpAuthRouter({
    provider: oauthProvider,
    issuerUrl,
    resourceServerUrl: publicUrl,
    scopesSupported: oauthScopes,
    resourceName: 'heb-mcp',
  }));

  const requireOAuth = requireBearerAuth({
    verifier: oauthProvider,
    requiredScopes: oauthScopes,
    resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(publicUrl),
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: SERVER_NAME, version: SERVER_VERSION });
  });

  app.get('/connect', (req, res) => {
    const auth = res.locals.clerkAuth as { userId: string } | undefined;
    const signInUrl = res.locals.clerkSignInUrl as string | undefined;

    if (!auth) {
      res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HEB MCP · Sign In</title>
  <link rel="icon" href="/favicon.ico" type="image/png">
  <style>
    :root {
      color-scheme: light;
      font-family: "IBM Plex Sans", "Space Grotesk", system-ui, sans-serif;
      --bg: #f7f5f0;
      --card: #fffaf3;
      --ink: #1b1b1b;
      --muted: #6a6a6a;
      --accent: #008753;
    }
    body {
      margin: 0;
      background: radial-gradient(circle at top, #ffffff 0%, var(--bg) 60%);
      color: var(--ink);
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
    }
    .card {
      max-width: 520px;
      background: var(--card);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.1);
      border: 1px solid #efe7da;
    }
    h1 { margin: 0 0 12px; font-size: 28px; }
    p { margin: 0 0 16px; color: var(--muted); line-height: 1.5; }
    a.button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px 22px;
      background: var(--accent);
      color: #fff;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
      box-shadow: 0 8px 20px rgba(0, 135, 83, 0.25);
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Sign in to connect H‑E‑B</h1>
    <p>You need to sign in with your HEB MCP account before linking H‑E‑B.</p>
    ${signInUrl ? `<a class="button" href="${signInUrl}">Continue to Sign In</a>` : `<p>Missing Clerk sign-in URL. Configure CLERK_SIGN_IN_URL.</p>`}
  </div>
</body>
</html>`);
      return;
    }

    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HEB MCP · Connect H‑E‑B</title>
  <link rel="icon" href="/favicon.ico" type="image/png">
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f1e8;
      --card: #fffaf2;
      --ink: #1a1a1a;
      --muted: #666;
      --accent: #008753;
      --accent-soft: rgba(0, 135, 83, 0.15);
      --border: #efe4d4;
    }
    body {
      margin: 0;
      font-family: "IBM Plex Sans", "Space Grotesk", system-ui, sans-serif;
      background: linear-gradient(160deg, #fffdf9 0%, var(--bg) 60%);
      color: var(--ink);
      min-height: 100vh;
      padding: 32px;
    }
    .wrap {
      max-width: 960px;
      margin: 0 auto;
      display: grid;
      gap: 24px;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .badge {
      background: var(--accent-soft);
      color: var(--accent);
      padding: 6px 12px;
      border-radius: 999px;
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.02em;
    }
    .card {
      background: var(--card);
      border-radius: 18px;
      border: 1px solid var(--border);
      padding: 24px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
    }
    h1 { font-size: 30px; margin: 0; }
    h2 { font-size: 20px; margin: 0 0 8px; }
    p { color: var(--muted); line-height: 1.5; }
    .grid {
      display: grid;
      gap: 16px;
    }
    .steps {
      display: grid;
      gap: 12px;
    }
    .step {
      display: grid;
      gap: 8px;
      padding: 16px;
      border-radius: 14px;
      border: 1px dashed #d7c8b3;
      background: #fffdf9;
    }
    .row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }
    .button {
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid transparent;
      font-weight: 600;
      cursor: pointer;
      background: var(--accent);
      color: #fff;
      box-shadow: 0 10px 20px rgba(0, 135, 83, 0.2);
    }
    .button.secondary {
      background: #fff;
      color: var(--accent);
      border-color: var(--accent);
      box-shadow: none;
    }
    input, textarea {
      width: 100%;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      font-size: 14px;
      font-family: inherit;
    }
    textarea { min-height: 90px; }
    .status {
      font-weight: 600;
      color: var(--accent);
    }
    .error { color: #b91c1c; }
    .success { color: #0f7a45; }
    .muted { color: var(--muted); font-size: 13px; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <div class="badge">HEB MCP</div>
        <h1>Connect your H‑E‑B account</h1>
        <p>Link H‑E‑B once to enable shopping, cart, and pickup actions.</p>
      </div>
      <div id="statusBadge" class="badge">Checking status…</div>
    </header>

    <div class="card">
      <h2>Step 1 · Sign in with H‑E‑B</h2>
      <p>We’ll open the H‑E‑B mobile login in a new tab. Complete login and OTP, then return here.</p>
      <div class="row">
        <button class="button" id="openAuth">Open H‑E‑B Login</button>
        <button class="button secondary" id="copyAuth">Copy Login URL</button>
        <span class="muted" id="authHint"></span>
      </div>
    </div>

    <div class="card">
      <h2>Step 2 · Paste the redirect code</h2>
      <p>After login, your browser will attempt to open <code>com.heb.myheb://oauth2redirect</code>. Copy the full URL or just the <code>code</code> value and paste it below.</p>
      <div class="grid">
        <textarea id="codeInput" placeholder="Paste redirect URL or code here"></textarea>
        <div class="row">
          <button class="button" id="exchangeBtn">Link H‑E‑B</button>
          <span class="muted" id="exchangeStatus"></span>
        </div>
        <p class="muted">Tip: If the browser says it can’t open the app, the URL is often still visible in the address bar or devtools Network tab.</p>
      </div>
    </div>

    <div class="card">
      <h2>Status</h2>
      <p id="statusText">Checking…</p>
      <div class="row">
        <button class="button secondary" id="refreshStatus">Refresh status</button>
      </div>
    </div>
  </div>

  <script>
    const statusBadge = document.getElementById('statusBadge');
    const statusText = document.getElementById('statusText');
    const authHint = document.getElementById('authHint');
    const exchangeStatus = document.getElementById('exchangeStatus');
    const codeInput = document.getElementById('codeInput');
    const openAuth = document.getElementById('openAuth');
    const copyAuth = document.getElementById('copyAuth');
    const exchangeBtn = document.getElementById('exchangeBtn');
    const refreshStatus = document.getElementById('refreshStatus');

    let codeVerifier = sessionStorage.getItem('heb_code_verifier');
    let authUrl = sessionStorage.getItem('heb_auth_url');

    function base64Url(bytes) {
      let binary = '';
      bytes.forEach(b => binary += String.fromCharCode(b));
      return btoa(binary).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/g, '');
    }

    async function sha256(message) {
      const data = new TextEncoder().encode(message);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return new Uint8Array(digest);
    }

    function randomString(bytes = 32) {
      const data = new Uint8Array(bytes);
      crypto.getRandomValues(data);
      return base64Url(data);
    }

    function extractCode(raw) {
      if (!raw) return null;
      const trimmed = raw.trim();
      if (trimmed.includes('code=')) {
        try {
          const url = new URL(trimmed);
          return url.searchParams.get('code');
        } catch {
          const match = trimmed.match(/code=([^&\\s]+)/);
          return match ? match[1] : null;
        }
      }
      return trimmed.length > 4 ? trimmed : null;
    }

    async function loadConfig() {
      const res = await fetch('/api/heb/oauth/config', { credentials: 'include' });
      if (!res.ok) throw new Error('Unable to load OAuth config');
      return res.json();
    }

    async function prepareAuth() {
      const config = await loadConfig();
      codeVerifier = randomString(32);
      const challengeBytes = await sha256(codeVerifier);
      const codeChallenge = base64Url(challengeBytes);

      const params = new URLSearchParams({
        client_id: config.clientId,
        response_type: 'code',
        redirect_uri: config.redirectUri,
        scope: config.scope,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: randomString(16),
        nonce: randomString(16),
        client_request_id: crypto.randomUUID(),
        clientAmpDeviceId: crypto.randomUUID(),
        clientAmpSessionId: String(Date.now()),
        prompt: 'login',
      });

      authUrl = config.authUrl + '?' + params.toString();
      sessionStorage.setItem('heb_code_verifier', codeVerifier);
      sessionStorage.setItem('heb_auth_url', authUrl);
      authHint.textContent = 'Ready';
    }

    async function refreshStatusUi() {
      try {
        const res = await fetch('/api/heb/oauth/status', { credentials: 'include' });
        const data = await res.json();
        if (data.connected) {
          statusBadge.textContent = 'Linked';
          statusText.textContent = data.expiresAt ? 'Connected · expires ' + new Date(data.expiresAt).toLocaleString() : 'Connected';
          statusBadge.style.background = 'rgba(0,135,83,0.15)';
          statusBadge.style.color = '#008753';
        } else {
          statusBadge.textContent = 'Not linked';
          statusText.textContent = 'Not connected yet.';
          statusBadge.style.background = '#f5e1e1';
          statusBadge.style.color = '#b91c1c';
        }
      } catch (err) {
        statusBadge.textContent = 'Unknown';
        statusText.textContent = 'Unable to check status.';
      }
    }

    openAuth.addEventListener('click', async () => {
      exchangeStatus.textContent = '';
      if (!authUrl) await prepareAuth();
      window.open(authUrl, '_blank', 'noopener');
    });

    copyAuth.addEventListener('click', async () => {
      if (!authUrl) await prepareAuth();
      await navigator.clipboard.writeText(authUrl);
      authHint.textContent = 'Copied login URL';
      setTimeout(() => authHint.textContent = '', 1500);
    });

    exchangeBtn.addEventListener('click', async () => {
      exchangeStatus.textContent = '';
      const code = extractCode(codeInput.value);
      if (!code) {
        exchangeStatus.textContent = 'Please paste a valid code or redirect URL.';
        exchangeStatus.className = 'error';
        return;
      }
      if (!codeVerifier) {
        exchangeStatus.textContent = 'Missing code verifier. Please click “Open H‑E‑B Login” again.';
        exchangeStatus.className = 'error';
        return;
      }
      exchangeBtn.disabled = true;
      exchangeStatus.textContent = 'Linking…';
      exchangeStatus.className = 'status';

      try {
        const res = await fetch('/api/heb/oauth/exchange', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, code_verifier: codeVerifier }),
        });
        if (!res.ok) {
          throw new Error('Exchange failed');
        }
        exchangeStatus.textContent = 'Linked successfully!';
        exchangeStatus.className = 'success';
        await refreshStatusUi();
      } catch (err) {
        exchangeStatus.textContent = 'Failed to link. Try again or re-open login.';
        exchangeStatus.className = 'error';
      } finally {
        exchangeBtn.disabled = false;
      }
    });

    refreshStatus.addEventListener('click', refreshStatusUi);
    refreshStatusUi();
  </script>
</body>
</html>`);
  });

  // Landing page for post-sign-in redirect from browser extension
  app.get('/extension-auth-success', (_req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HEB MCP - Signed In</title>
  <link rel="icon" href="/favicon.ico" type="image/png">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 480px;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #00c853 0%, #69f0ae 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      box-shadow: 0 4px 20px rgba(0, 200, 83, 0.3);
    }
    .icon svg {
      width: 40px;
      height: 40px;
      stroke: #fff;
      stroke-width: 3;
      fill: none;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }
    p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
      line-height: 1.6;
    }
    .hint {
      margin-top: 2rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .hint p {
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg viewBox="0 0 24 24">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <h1>Successfully Signed In</h1>
    <p>You're now authenticated with the HEB MCP server.</p>
    <div class="hint">
      <p>You can close this tab and return to the extension to sync your cookies.</p>
    </div>
  </div>
</body>
</html>`);
  });

  app.post('/api/cookies', async (req, res) => {
    const auth = await requireAuth(req, res);
    if (!auth) return;

    const { sat, reese84 } = req.body ?? {};
    if (!sat || !reese84) {
      res.status(400).json({ error: 'Missing sat or reese84 cookies' });
      return;
    }

    try {
      await sessionManagerRemote.saveCookies(auth.userId, { sat, reese84, ...req.body });
      res.json({ success: true, message: 'Cookies saved for user.' });
    } catch (error) {
      console.error('[heb-mcp] Failed to save user cookies:', error);
      res.status(500).json({ error: 'Failed to save cookies' });
    }
  });

  app.get('/api/heb/oauth/config', async (_req, res) => {
    const config = resolveHebOAuthConfig();
    res.json({
      clientId: config.clientId,
      redirectUri: config.redirectUri,
      scope: config.scope,
      authUrl: config.authUrl,
    });
  });

  app.post('/api/heb/oauth/exchange', async (req, res) => {
    const auth = await requireClerkAuth(req, res);
    if (!auth) return;

    const { code, code_verifier: codeVerifierRaw, codeVerifier: codeVerifierAlt } = req.body ?? {};
    const codeVerifier = codeVerifierRaw ?? codeVerifierAlt;
    if (!code || !codeVerifier) {
      res.status(400).json({ error: 'Missing code or code_verifier' });
      return;
    }

    try {
      const config = resolveHebOAuthConfig();
      const tokens = await exchangeHebCode({ code, codeVerifier, config });

      const existing = sessionManagerRemote.getSession(auth.userId);
      await sessionManagerRemote.saveTokens(auth.userId, tokens, existing?.cookies);

      if (isUpsertEnabled()) {
        const upsert = await maybeUpsertHebUser({
          accessToken: tokens.accessToken,
          idToken: tokens.idToken,
          enabled: isUpsertEnabled(),
          userAgent: config.userAgent,
        });
        if (upsert && !upsert.ok) {
          console.warn('[heb-mcp] UpsertUserMutation failed:', upsert.errors);
        }
      }

      res.json({
        success: true,
        expiresAt: tokens.expiresAt ? tokens.expiresAt.toISOString() : null,
      });
    } catch (error) {
      console.error('[heb-mcp] Failed to exchange HEB OAuth code:', error);
      res.status(500).json({ error: 'Failed to exchange HEB OAuth code' });
    }
  });

  app.post('/api/heb/oauth/refresh', async (req, res) => {
    const auth = await requireClerkAuth(req, res);
    if (!auth) return;

    const session = sessionManagerRemote.getSession(auth.userId);
    if (!session?.tokens?.refreshToken) {
      res.status(400).json({ error: 'No refresh token found for user' });
      return;
    }

    try {
      await session.refresh?.();
      res.json({
        success: true,
        expiresAt: session.expiresAt ? session.expiresAt.toISOString() : null,
      });
    } catch (error) {
      console.error('[heb-mcp] Failed to refresh HEB OAuth tokens:', error);
      res.status(500).json({ error: 'Failed to refresh tokens' });
    }
  });

  app.get('/api/heb/oauth/status', async (req, res) => {
    const auth = await requireClerkAuth(req, res);
    if (!auth) return;

    const session = sessionManagerRemote.getSession(auth.userId);
    if (!session || session.authMode !== 'bearer') {
      res.json({ connected: false });
      return;
    }

    res.json({
      connected: true,
      expiresAt: session.expiresAt ? session.expiresAt.toISOString() : null,
      hasRefreshToken: Boolean(session.tokens?.refreshToken),
    });
  });

  const transports = new Map<string, { transport: InstanceType<typeof SSEServerTransport>; server: McpServer; userId: string }>();

  app.get('/sse', requireOAuth, async (req, res) => {
    const authInfo = (req as { auth?: AuthInfo }).auth;
    const userId = typeof authInfo?.extra?.userId === 'string' ? authInfo.extra.userId : null;
    if (!userId) {
      res.status(401).json({ error: 'Missing user identity' });
      return;
    }

    try {
      await sessionManagerRemote.loadUser(userId);

      const transportInstance = new SSEServerTransport('/messages', res);
      const sessionId = transportInstance.sessionId;

      const server = createMcpServer(
        () => sessionManagerRemote.getClient(userId),
        (cookies) => sessionManagerRemote.saveCookies(userId, cookies),
        (session) => {
          if (session.authMode === 'bearer' && session.tokens) {
            return sessionManagerRemote.saveTokens(userId, session.tokens, session.cookies);
          }
          return sessionManagerRemote.saveCookies(userId, session.cookies);
        },
        'Remote Session Store'
      );

      transports.set(sessionId, { transport: transportInstance, server, userId });

      transportInstance.onclose = () => {
        transports.delete(sessionId);
      };

      await server.connect(transportInstance);
      console.error(`[heb-mcp] SSE client connected (${sessionId}) for user ${userId}`);
    } catch (error) {
      console.error('[heb-mcp] Error establishing SSE connection:', error);
      if (!res.headersSent) {
        res.status(500).send('Error establishing SSE stream');
      }
    }
  });

  app.post('/messages', requireOAuth, async (req, res) => {
    const sessionId = req.query.sessionId;
    if (!sessionId || typeof sessionId !== 'string') {
      res.status(400).json({ error: 'Missing sessionId parameter' });
      return;
    }

    const entry = transports.get(sessionId);
    if (!entry) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const authInfo = (req as { auth?: AuthInfo }).auth;
    const userId = typeof authInfo?.extra?.userId === 'string' ? authInfo.extra.userId : null;
    if (!userId || userId !== entry.userId) {
      res.status(401).json({ error: 'Unauthorized session' });
      return;
    }

    try {
      await entry.transport.handlePostMessage(req, res, req.body);
    } catch (error) {
      console.error('[heb-mcp] Error handling MCP message:', error);
      if (!res.headersSent) {
        res.status(500).send('Error handling request');
      }
    }
  });

  app.listen(port, () => {
    console.error(`[heb-mcp] SSE server listening on http://localhost:${port}`);
    console.error(`[heb-mcp] SSE endpoint: http://localhost:${port}/sse`);
  });
}

main().catch((error) => {
  console.error('[heb-mcp] Fatal error:', error);
  process.exit(1);
});
