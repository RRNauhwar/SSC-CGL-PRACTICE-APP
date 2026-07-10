# @ssc/api — NestJS REST API

Backend for the SSC Prep Platform. Follows Clean Architecture and SOLID principles as mandated by the approved specs (`docs/prd/12-technical-architecture.md`).

## Architecture & folder conventions

The app is a modular monolith with clean service boundaries so it can be split into microservices later. Cross-cutting infrastructure lives at the top level; each business capability is a **bounded context** under `src/modules/<feature>`.

```
src/
├── main.ts                     # Bootstrap: tracing → app → security → validation → versioning → Swagger
├── app.module.ts               # Composition root (wires infra + feature modules)
├── app.constants.ts            # Static app metadata (name, version)
├── config/                     # Zod-validated env + typed AppConfigService (fail-fast at boot)
├── observability/              # OpenTelemetry bootstrap (opt-in via OTEL_ENABLED)
├── common/                     # Framework-level cross-cutting concerns
│   ├── dto/                    # Shared DTOs (e.g. canonical ErrorResponse)
│   ├── filters/                # Global exception filter (consistent error envelope)
│   └── logging/                # pino structured-logging config (redaction, request ids)
├── infrastructure/             # Adapters to external systems (DB, cache, storage, ...)
│   └── prisma/                 # PrismaService + module + health indicator
└── modules/                    # Feature bounded contexts
    └── <feature>/
        ├── domain/             # Entities, value objects, domain services (no framework deps)
        ├── application/        # Use cases, ports (interfaces), DTOs
        ├── infrastructure/     # Repository implementations, external adapters
        └── interface/          # Controllers, presenters (HTTP/WS entrypoints)
```

> The `health` module is intentionally flat — it has no domain logic. Feature modules introduced in later steps (auth, content, assessment, ...) use the full four-layer structure above.

## Local development

```bash
# From the repo root
cp .env.example .env
pnpm install
pnpm infra:up                       # start Postgres, Redis, OpenSearch, ClickHouse, MinIO
pnpm --filter @ssc/api prisma:generate
pnpm --filter @ssc/api prisma:migrate   # apply migrations to the local DB
pnpm --filter @ssc/api dev              # start the API in watch mode
```

- API base: `http://localhost:4000/api/v1`
- Swagger UI: `http://localhost:4000/api/docs`
- Health: `GET /api/v1/health` (readiness) and `GET /api/v1/health/live` (liveness)

## Testing

- **Unit** (`*.spec.ts`, Jest): `pnpm --filter @ssc/api test`
- **E2E** (`test/*.e2e-spec.ts`, Jest + Supertest): `pnpm --filter @ssc/api test:e2e`
- Integration tests against real datastores (Testcontainers) are added alongside the repositories that need them.

## Key decisions

- **Jest** for the API (NestJS-native, decorator/DI friendly). Vitest is used for the frontend and framework-agnostic packages per the approved stack.
- **Env validated with Zod at boot** — the process refuses to start with invalid config.
- **URI versioning** (`/api/v1`) so breaking changes ship under new versions without disrupting clients.
- **Secure defaults**: Helmet, strict CORS allow-list, global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`, unprivileged container user.
