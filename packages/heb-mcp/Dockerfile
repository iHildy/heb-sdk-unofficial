# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy package.json files for dependency installation
COPY packages/heb-client/package.json ./packages/heb-client/
COPY packages/heb-mcp/package.json ./packages/heb-mcp/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY packages/heb-client/ ./packages/heb-client/
COPY packages/heb-mcp/ ./packages/heb-mcp/
COPY tsconfig.json ./

# Build heb-client first (dependency)
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

# Copy built artifacts
COPY --from=builder /app/packages/heb-mcp/dist ./dist
COPY --from=builder /app/packages/heb-mcp/package.json ./
COPY --from=builder /app/packages/heb-client/dist ./node_modules/heb-client/dist
COPY --from=builder /app/packages/heb-client/package.json ./node_modules/heb-client/

# Install production dependencies only
RUN pnpm install --prod --ignore-scripts

# Default to remote mode for container deployment
ENV MCP_MODE=remote
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server.js"]
