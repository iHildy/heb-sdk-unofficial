#!/usr/bin/env node
/**
 * HEB MCP Server
 *
 * Exposes H-E-B grocery API functionality as MCP tools for AI assistants.
 *
 * Transport modes:
 * - Streamable HTTP (default): Remote, multi-tenant deployments (OAuth for MCP + Clerk for cookie ingestion)
 * - STDIO: Local testing (set MCP_MODE=local or MCP_TRANSPORT=stdio)
 *
 * Cookie ingestion:
 * - Remote: POST /api/cookies with Clerk auth (Authorization: Bearer <token>)
 * - Local: POST http://localhost:4321/api/cookies
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { mcpAuthRouter, getOAuthProtectedResourceMetadataUrl } from '@modelcontextprotocol/sdk/server/auth/router.js';
import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

import type { HEBClient, HEBCookies, HEBSession } from 'heb-sdk';
import { requireAuth, requireClerkAuth } from './auth.js';
import {
  exchangeHebCode,
  isUpsertEnabled,
  maybeUpsertHebUser,
  resolveHebOAuthConfig,
} from './heb-oauth.js';
import { createSessionStoreFromEnv, MultiTenantSessionManager } from './multi-tenant.js';
import { startClerkDeviceFlow, pollClerkDeviceToken } from './clerk-device.js';
import {
  ClerkOAuthProvider,
  createAuthorizeContextMiddleware,
  resolveIssuerUrl,
  resolveOAuthScopes,
  resolvePublicUrl,
} from './oauth.js';
import { LOCAL_COOKIE_FILE, saveSessionToFile, sessionManager } from './session.js';
import { registerTools } from './tools.js';
import { renderPage } from './utils.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = join(__dirname, '..', 'web', 'dist');




const SERVER_NAME = 'heb';
const SERVER_VERSION = '0.1.0';

const transportOverride = process.env.MCP_TRANSPORT?.toLowerCase();
const mode = (process.env.MCP_MODE ?? 'remote').toLowerCase();
const transport = transportOverride ?? (mode === 'local' ? 'stdio' : 'streamable_http');
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

  // Remote mode: Streamable HTTP + Clerk auth + multi-tenant session store
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
    ? join(__dirname, '..', 'favicon.ico') 
    : join(__dirname, '..', 'favicon.ico');

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
  const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');

  const port = parseInt(process.env.PORT ?? '3000', 10);
  const publicUrl = resolvePublicUrl(port);
  const issuerUrl = resolveIssuerUrl(publicUrl);
  const resourceServerUrl = new URL('/mcp', publicUrl);
  const oauthProvider = new ClerkOAuthProvider({ publicUrl: resourceServerUrl });
  const oauthScopes = resolveOAuthScopes();
  const app = express();

  const deviceStartSchema = z.object({
    scope: z.string().optional(),
    scopes: z.union([z.string(), z.array(z.string())]).optional(),
  });

  const devicePollSchema = z.object({
    device_code: z.string().optional(),
    deviceCode: z.string().optional(),
  }).refine((data) => Boolean(data.device_code || data.deviceCode), {
    message: 'Missing device_code',
    path: ['device_code'],
  });

  app.use(express.json({ limit: '250kb' }));
  app.set('trust proxy', 1); 

  app.get('/favicon.ico', (_req, res) => {
    res.sendFile(join(__dirname, '..', 'favicon.ico'));
  });

  const authorizeContextMiddleware = createAuthorizeContextMiddleware({
    publicUrl,
    signInUrl: process.env.CLERK_SIGN_IN_URL,
  });

  app.use('/connect', authorizeContextMiddleware);
  app.use('/authorize', authorizeContextMiddleware);

  app.use(mcpAuthRouter({
    provider: oauthProvider,
    issuerUrl,
    resourceServerUrl,
    scopesSupported: oauthScopes,
    resourceName: 'HEB MCP',
  }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: SERVER_NAME, version: SERVER_VERSION });
  });

  app.get('/', (_req, res) => {
    res.redirect('/connect');
  });

  app.use(express.static(PUBLIC_DIR));

  app.get('/connect', (req, res) => {
    const signInUrl = res.locals.clerkSignInUrl as string | undefined;
    const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY ?? '';
    const clerkFrontendApi = process.env.CLERK_FRONTEND_URL ?? '';
    const clerkJwtTemplate = process.env.CLERK_JWT_TEMPLATE_NAME ?? '';

    const connectConfig = JSON.stringify({
      signInUrl: signInUrl ?? null,
      clerkPublishableKey: clerkPublishableKey || null,
      clerkFrontendApi: clerkFrontendApi || null,
      clerkJwtTemplate: clerkJwtTemplate || null,
    });

    const configScript = `<script>window.__connectConfig = ${connectConfig};</script>`;

    const clerkScript = clerkPublishableKey 
      ? `<script id="clerkScript" async crossorigin="anonymous" data-clerk-publishable-key="${clerkPublishableKey}" data-clerk-frontend-api="${clerkFrontendApi}" src="${clerkFrontendApi ? `${clerkFrontendApi}/npm/@clerk/clerk-js@5/dist/clerk.browser.js` : 'https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js'}"></script>`
      : '';

    try {
      const html = renderPage(join(PUBLIC_DIR, 'index.html'), {
        CONFIG_SCRIPT: configScript,
        CLERK_SCRIPT: clerkScript,
      });

      res.status(200).send(html);
    } catch (err) {
      console.error('[heb-mcp] Error rendering connect page:', err);
      res.status(500).send('Internal server error');
    }
  });

  // Landing page for post-sign-in redirect from browser extension
  app.get('/extension-auth-success', (_req, res) => {
    try {
      const html = renderPage(join(PUBLIC_DIR, 'index.html'));

      res.status(200).send(html);
    } catch (err) {
      console.error('[heb-mcp] Error rendering success page:', err);
      res.status(500).send('Internal server error');
    }
  });

  app.post('/oauth/device/start', async (req, res) => {
    try {
      const parsed = deviceStartSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request body', issues: parsed.error.flatten() });
        return;
      }
      const scopeInput = parsed.data.scope ?? parsed.data.scopes;
      const result = await startClerkDeviceFlow(scopeInput);
      res.status(result.status).json(result.body);
    } catch (error) {
      console.error('[heb-mcp] Device flow start failed:', error);
      res.status(500).json({ error: 'device_flow_start_failed' });
    }
  });

  app.post('/oauth/device/poll', async (req, res) => {
    try {
      const parsed = devicePollSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request body', issues: parsed.error.flatten() });
        return;
      }
      const deviceCode = parsed.data.device_code ?? parsed.data.deviceCode;
      if (!deviceCode) {
        res.status(400).json({ error: 'Missing device_code' });
        return;
      }
      const result = await pollClerkDeviceToken(deviceCode);
      res.status(result.status).json(result.body);
    } catch (error) {
      console.error('[heb-mcp] Device flow poll failed:', error);
      res.status(500).json({ error: 'device_flow_poll_failed' });
    }
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

  const mcpAuthMiddleware = requireBearerAuth({
    verifier: oauthProvider,
    requiredScopes: [],
    resourceMetadataUrl: getOAuthProtectedResourceMetadataUrl(resourceServerUrl),
  });

  app.post('/mcp', mcpAuthMiddleware, async (req, res) => {
    const userId = typeof req.auth?.extra?.['userId'] === 'string'
      ? req.auth.extra['userId']
      : null;

    if (!userId) {
      res.status(401).json({ error: 'Missing user context' });
      return;
    }

    try {
      await sessionManagerRemote.loadUser(userId);

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

      const transportInstance = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      res.on('close', () => transportInstance.close());

      await server.connect(transportInstance);
      await transportInstance.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('[heb-mcp] Error handling MCP request:', error);
      if (!res.headersSent) {
        res.status(500).send('Error handling request');
      }
    }
  });

  app.listen(port, () => {
    console.error(`[heb-mcp] Streamable HTTP server listening on http://localhost:${port}`);
    console.error(`[heb-mcp] MCP endpoint: http://localhost:${port}/mcp`);
  });
}

main().catch((error) => {
  console.error('[heb-mcp] Fatal error:', error);
  process.exit(1);
});
