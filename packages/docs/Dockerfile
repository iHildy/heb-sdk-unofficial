# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy docs package.json
COPY packages/docs/package.json ./packages/docs/

# Install dependencies
RUN pnpm install --frozen-lockfile --filter @heb-sdk-unofficial/docs

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
