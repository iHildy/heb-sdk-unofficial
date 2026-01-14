# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files for dependency installation
COPY packages/heb-auth/package.json ./packages/heb-auth/
COPY packages/heb-client/package.json ./packages/heb-client/
COPY packages/heb-mcp/package.json ./packages/heb-mcp/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/heb-auth/ ./packages/heb-auth/
COPY packages/heb-client/ ./packages/heb-client/
COPY packages/heb-mcp/ ./packages/heb-mcp/
COPY tsconfig.json ./

# Build dependencies first
WORKDIR /app/packages/heb-auth
RUN pnpm build

WORKDIR /app/packages/heb-client
RUN pnpm build

# Build heb-mcp
WORKDIR /app/packages/heb-mcp
RUN pnpm build

# ─────────────────────────────────────────────────────────────
# Production stage
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configuration and lockfile
COPY --from=builder /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/package.json ./

# Copy built package artifacts for workspace dependencies
COPY --from=builder /app/packages/heb-auth/package.json ./packages/heb-auth/
COPY --from=builder /app/packages/heb-auth/dist ./packages/heb-auth/dist

COPY --from=builder /app/packages/heb-client/package.json ./packages/heb-client/
COPY --from=builder /app/packages/heb-client/dist ./packages/heb-client/dist

# Copy built package artifacts for heb-mcp
COPY --from=builder /app/packages/heb-mcp/package.json ./packages/heb-mcp/
COPY --from=builder /app/packages/heb-mcp/dist ./packages/heb-mcp/dist
COPY --from=builder /app/packages/heb-mcp/public ./packages/heb-mcp/public
COPY --from=builder /app/packages/heb-mcp/favicon.ico ./packages/heb-mcp/favicon.ico

# Install production dependencies for the workspace, focused on heb-mcp
# We use --prod to skip devDependencies and --ignore-scripts to avoid heavy post-installs
RUN pnpm install --prod --frozen-lockfile --filter heb-mcp --ignore-scripts

# Default to remote mode for container deployment
ENV MCP_MODE=remote
ENV PORT=3000
ENV NODE_ENV=production
ENV MCP_OAUTH_CLIENTS_FILE=/data/oauth/clients.json
ENV MCP_OAUTH_TOKENS_FILE=/data/oauth/tokens.json
ENV HEB_SESSION_STORE_DIR=/data/sessions

# Ensure persistent storage path exists in the image
RUN mkdir -p /data/oauth /data/sessions

VOLUME ["/data"]

# The working directory should be the package directory for running
WORKDIR /app/packages/heb-mcp

EXPOSE 3000

CMD ["node", "dist/server.js"]
