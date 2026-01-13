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
export {};
//# sourceMappingURL=server.d.ts.map