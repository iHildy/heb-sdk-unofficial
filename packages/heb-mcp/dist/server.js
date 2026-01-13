#!/usr/bin/env node
/**
 * HEB MCP Server
 *
 * Exposes H-E-B grocery API functionality as MCP tools for AI assistants.
 *
 * Transport modes:
 * - STDIO (default): For Claude Desktop local development
 * - SSE: For remote deployment (Coolify, etc.)
 *
 * Set MCP_TRANSPORT=sse and PORT=3000 for SSE mode.
 *
 * Session Management:
 * - Cookies auto-reload when ~/.heb-client/cookies.json changes.
 * - No restart required when cookies are updated via the extension.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import { saveSessionToFile, sessionManager } from './session.js';
import { registerTools } from './tools.js';
const SERVER_NAME = 'heb';
const SERVER_VERSION = '0.1.0';
async function main() {
    // Initialize session manager (loads session + starts file watcher)
    sessionManager.initialize();
    // Start the Cookie Bridge listener (always runs)
    await startCookieBridgeServer();
    // Create MCP server
    const server = new McpServer({
        name: SERVER_NAME,
        version: SERVER_VERSION,
    });
    // Register tools with lazy client getter (supports hot-reload)
    registerTools(server, () => sessionManager.getClient());
    // Determine transport
    const transport = process.env.MCP_TRANSPORT?.toLowerCase();
    if (transport === 'sse') {
        // SSE transport for remote deployment
        await startSSEServer(server);
    }
    else {
        // STDIO transport (default) for Claude Desktop
        await startSTDIOServer(server);
    }
}
async function startCookieBridgeServer() {
    const app = express();
    const PORT = 4321;
    app.use(express.json());
    // CORS for the extension
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*'); // For local dev, allow all. In prod, restrict to extension ID.
        res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });
    app.post('/auth/callback', (req, res) => {
        try {
            const { sat, reese84 } = req.body;
            if (!sat || !reese84) {
                res.status(400).json({ error: 'Missing sat or reese84 cookies' });
                return;
            }
            console.error('[heb-mcp] Received new session cookies from extension.');
            saveSessionToFile({
                sat,
                reese84,
                // Add other logical defaults if needed, extension should send what it has
                ...req.body
            });
            // Session will auto-reload via file watcher
            res.json({ success: true, message: 'Cookies saved and session will reload automatically' });
        }
        catch (err) {
            console.error('[heb-mcp] Error saving cookies:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    // Start listening
    // We don't await this because we want it to run in background while main continues
    app.listen(PORT, () => {
        console.error(`[heb-mcp] Cookie Bridge listening on http://localhost:${PORT}`);
    }).on('error', (err) => {
        console.error(`[heb-mcp] Failed to start Cookie Bridge on port ${PORT}:`, err.message);
    });
}
async function startSTDIOServer(server) {
    console.error('[heb-mcp] Starting STDIO transport...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[heb-mcp] Server running on STDIO');
}
async function startSSEServer(server) {
    const { SSEServerTransport } = await import('@modelcontextprotocol/sdk/server/sse.js');
    const port = parseInt(process.env.PORT ?? '3000', 10);
    const app = express();
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', server: SERVER_NAME, version: SERVER_VERSION });
    });
    // SSE endpoint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let transport = null;
    app.get('/sse', (req, res) => {
        console.error('[heb-mcp] SSE client connected');
        transport = new SSEServerTransport('/messages', res);
        server.connect(transport);
    });
    app.post('/messages', express.json(), (req, res) => {
        if (!transport) {
            res.status(400).json({ error: 'No SSE connection established' });
            return;
        }
        transport.handlePostMessage(req, res);
    });
    app.listen(port, () => {
        console.error(`[heb-mcp] SSE server listening on http://localhost:${port}`);
        console.error(`[heb-mcp] SSE endpoint: http://localhost:${port}/sse`);
    });
}
// Run
main().catch((error) => {
    console.error('[heb-mcp] Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map