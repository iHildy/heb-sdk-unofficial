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

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import { getOAuthProtectedResourceMetadataUrl, mcpAuthRouter } from '@modelcontextprotocol/sdk/server/auth/router.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import express from 'express';

import type { HEBClient, HEBCookies } from 'heb-client';
import { requireAuth } from './auth.js';
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

    const server = createMcpServer(() => sessionManager.getClient(), saveSessionToFile, 'Local File');
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
  sessionStatusSource?: string
): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerTools(server, getClient, {
    saveCookies,
    sessionStatusSource,
  });

  return server;
}

async function startLocalCookieBridgeServer(): Promise<void> {
  const app = express();
  const PORT = 4321;

  app.use(express.json({ limit: '250kb' }));

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
