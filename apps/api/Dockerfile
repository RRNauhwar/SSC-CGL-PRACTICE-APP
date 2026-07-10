# syntax=docker/dockerfile:1
# -----------------------------------------------------------------------------
# Production image for the NestJS API.
# Build context MUST be the repository root so the pnpm workspace resolves:
#   docker build -f apps/api/Dockerfile -t ssc-api .
# -----------------------------------------------------------------------------

FROM node:20-alpine AS base
# OpenSSL is required by Prisma's query engine at runtime.
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

# --- Dependencies + build ----------------------------------------------------
FROM base AS builder
# Copy workspace manifests first to maximise Docker layer caching.
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile

# Copy the API source and build it.
COPY apps/api ./apps/api
RUN pnpm --filter @ssc/api prisma:generate \
  && pnpm --filter @ssc/api build

# --- Runtime -----------------------------------------------------------------
FROM base AS runtime
ENV NODE_ENV=production
# Copy the resolved workspace (node_modules + built dist + generated client).
# pnpm's symlinked layout is preserved, so module resolution from apps/api works.
COPY --from=builder /app ./
WORKDIR /app/apps/api

# Run as the unprivileged built-in `node` user (secure default).
USER node
EXPOSE 4000

# Container-level readiness signal for orchestrators/compose.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.API_PORT||4000)+'/api/v1/health/live').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/main.js"]
