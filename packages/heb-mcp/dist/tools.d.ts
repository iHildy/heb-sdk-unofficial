/**
 * MCP Tool definitions for H-E-B grocery API.
 *
 * Each tool wraps functionality from the heb-client library.
 * Tools resolve the client lazily at call time to support hot-reload.
 */
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { HEBClient } from 'heb-client';
type ClientGetter = () => HEBClient | null;
/**
 * Register all HEB tools on the MCP server.
 *
 * @param server - MCP server instance
 * @param getClient - Function that returns the current HEBClient (may be null if no session)
 */
export declare function registerTools(server: McpServer, getClient: ClientGetter): void;
export {};
//# sourceMappingURL=tools.d.ts.map