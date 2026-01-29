# Build stage
FROM node:20-alpine AS builder

# Install pnpm - use version from package.json packageManager field
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy npmrc for timeout/retry configuration
COPY packages/docs/.npmrc ./packages/docs/

# Copy docs package.json
COPY packages/docs/package.json ./packages/docs/

# Install dependencies with verbose output
RUN pnpm install --frozen-lockfile --filter @heb-sdk-unofficial/docs --reporter=append-only

# Copy source files
COPY packages/docs/ ./packages/docs/

# Build the static site using Docker-specific config (no Cloudflare adapter)
WORKDIR /app/packages/docs
RUN pnpm astro build --config astro.config.docker.mjs

# Production stage - nginx to serve static files
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY packages/docs/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/packages/docs/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
