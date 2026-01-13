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
import { requireAuth } from './auth.js';
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

  app.post('/api/heb/oauth/exchange', async (req, res) => {
    const auth = await requireAuth(req, res);
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
    const auth = await requireAuth(req, res);
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
    const auth = await requireAuth(req, res);
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
