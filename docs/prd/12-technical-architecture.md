# 12 — Technical Architecture

Production-ready, offline-first, scalable, secure. Designed to start as a **modular monolith** (fast to build, easy to reason about) with **clean service boundaries** so it can peel into microservices as load demands. Cloud-agnostic in principle; examples use common building blocks.

## 1. High-level architecture

```
                         ┌─────────────────────────────────────────┐
   Clients               │  PWA (primary)  •  iOS/Android  •  Web   │
                         │  Offline store + Sync engine (doc 14)    │
                         └───────────────┬─────────────────────────┘
                                         │ HTTPS / WSS
                                   ┌─────▼──────┐
                                   │  CDN / Edge│  (static, media, cache)
                                   └─────┬──────┘
                                   ┌─────▼──────┐
                                   │ API Gateway│  auth, rate-limit, routing, WAF
                                   └─────┬──────┘
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
   ┌────▼───┐    ┌─────▼────┐    ┌──────▼─────┐   ┌─────▼─────┐   ┌────▼────┐
   │ Core   │    │ Content/ │    │ Assessment │   │ Analytics │   │  AI /   │
   │ /User/ │    │ PYQ svc  │    │ (practice/ │   │ & Recsys  │   │ Mentor  │
   │ Auth   │    │          │    │  tests)    │   │           │   │ svc     │
   └────┬───┘    └────┬─────┘    └─────┬──────┘   └────┬──────┘   └────┬────┘
        │             │                │                │              │
        └─────────────┴──────┬─────────┴────────────────┴──────────────┘
                             │  (async) Event bus / Queue (Kafka/SQS)
        ┌───────────────┬────┴───────┬────────────────┬────────────────┐
   ┌────▼────┐    ┌─────▼────┐   ┌────▼─────┐    ┌─────▼────┐    ┌──────▼─────┐
   │Postgres │    │  Redis   │   │ Search   │    │ Vector   │    │ Object     │
   │(OLTP)   │    │ (cache/  │   │(OpenSrch)│    │ DB       │    │ storage    │
   │         │    │ realtime)│   │          │    │(pgvector)│    │(S3/media)  │
   └─────────┘    └──────────┘   └──────────┘    └──────────┘    └────────────┘
        │
   ┌────▼─────┐   Background workers: ingestion pipeline, rollups, SRS scheduling,
   │ Data lake│   notifications, prediction batch, recompute weightage/mastery.
   │ + OLAP   │
   └──────────┘
```

## 2. Frontend

- **Framework:** React (Next.js) for web/PWA; **React Native** (or Flutter) for native apps sharing logic where practical.
- **State/data:** typed API client (tRPC/GraphQL/REST — REST+OpenAPI at MVP for simplicity), query cache (React Query), offline persistence layer.
- **PWA:** service worker for caching + offline; installable; push via Web Push. Skeleton loading, optimistic UI, code-splitting per route.
- **Exam-sim runtime:** isolated, deterministic module (timer authority reconciled with server for ranked tests) — see doc 05.
- **Design system:** shared component library + design tokens (theming, dark/light/high-contrast, font scaling) — doc 10.

## 3. Backend services (bounded contexts)

1. **Core/User/Auth** — accounts, profiles, RBAC, subscriptions/billing hooks, preferences.
2. **Content/PYQ** — questions, taxonomy, weightage, formulas/concepts, search indexing, ingestion pipeline orchestration.
3. **Assessment** — practice sessions + test attempts, scoring, palette/state, ranks/percentiles.
4. **Analytics & Recsys** — event ingestion, rollups, mastery, mistake taxonomy, prediction, recommendations, planner, SRS scheduling.
5. **AI/Mentor** — LLM orchestration, RAG, embeddings, explanation cache, classification/generation workers (doc 13).
6. **Notifications** — eligibility, timing, channel adapters, tracking (doc 11).
7. **Community** — forums, groups, battles, moderation.
8. **Admin/Ops** — internal APIs for admin panel.

- **Style:** modular monolith at MVP with per-context modules + separate deployables for the heaviest/most independent (AI, notifications, analytics workers). Extract to microservices when scaling pressure justifies it. **API-first** (OpenAPI contracts), **microservices-ready** boundaries from day one.

## 4. Data flow: an attempt event (illustrative)

```
User answers question (online or offline)
  → client records event locally (offline-safe)
  → on connectivity: batched sync → Assessment svc validates + persists (versioned)
  → publishes AttemptRecorded event on the bus
      → Analytics: update real-time counters (Redis) + enqueue rollup
      → SRS: update memory model / schedule next review
      → Mastery: update concept mastery + ability θ
      → Recsys: invalidate/refresh next-best-action
      → Gamification: award XP, update streak/quests
  → client receives updated summary (or reconciles on next sync)
```

## 5. Storage & caching (detail in doc 14)

- **PostgreSQL** — primary OLTP (users, content metadata, attempts, subscriptions). Read replicas for scale; partition large tables (attempts) by time/user.
- **Redis** — cache, session, real-time counters, leaderboards (sorted sets), rate-limit buckets, queues (light).
- **Search** — OpenSearch/Elasticsearch for full-text + faceted search (doc 10).
- **Vector DB** — pgvector (start) / dedicated vector store (scale) for embeddings/similar-questions/RAG (doc 13).
- **Object storage** — S3-compatible for media (images, videos, PDFs), served via CDN.
- **Data lake + OLAP** — columnar warehouse (e.g., ClickHouse/BigQuery) for heavy analytics + ML training sets.

## 6. Async processing

- **Event bus / queue:** Kafka (or managed SQS/PubSub) for domain events; workers for ingestion, rollups, SRS scheduling, notifications, batch predictions, weightage/mastery recompute, embeddings.
- **Scheduling:** cron/temporal-style workflows for daily jobs (daily challenge, digests, plan re-balance, decay checks).
- **Idempotency + retries + DLQ** on every consumer.

## 7. Offline-first strategy (core requirement)

- **Local store** on client (IndexedDB/SQLite) holds: downloaded PYQ sets, tests, SRS queue, notebooks, and a queue of unsynced events.
- **Sync engine:** bi-directional; **last-write-wins for user overlays** (notes/bookmarks) and **append-only, server-authoritative for attempts/scores**; conflict resolution rules per entity (doc 14 covers CRDT/versioning).
- **Ranked/live tests** require server time authority; offline attempts of ranked tests are either disallowed or clearly marked "unranked until synced".
- **Low-bandwidth mode** (doc 10): defer media, compress payloads, delta sync.

## 8. Scalability & performance

- Stateless services behind the gateway → horizontal autoscaling.
- Cache-aside for hot reads (question/chapter/weightage), CDN for static + media.
- Precomputed rollups + leaderboards so dashboards are O(1) reads.
- Target p95 API latency < 300 ms for core reads; instant (optimistic) answer submission.
- Load-test surges around exam-notification/live-test events.

## 9. Observability

- **Logging** (structured, centralized), **metrics** (RED/USE), **tracing** (OpenTelemetry), **dashboards + alerting** (Grafana/Prometheus/Loki or managed).
- Product analytics events separate from ops metrics; PII-scrubbed.
- SLOs + error budgets per service.

## 10. Reliability, backup & DR

- Automated DB backups + point-in-time recovery; periodic restore drills.
- Multi-AZ; documented **RPO/RTO** targets; DR runbooks.
- Graceful degradation: if AI service is down, fall back to rules-based Mentor/recommendations; if search is down, fall back to DB queries.

## 11. CI/CD & environments

- Envs: local → dev → staging → prod. Trunk-based with feature flags.
- CI: lint, unit, integration, contract tests, security scan (SAST/deps), build.
- CD: automated deploy to staging, gated prod; blue-green/canary; DB migrations versioned + backward-compatible.
- **Feature flags** for phased rollout + A/B experiments.

## 12. Security touchpoints (detail in doc 15)

- API gateway: authN, rate limiting, WAF, request validation.
- Encryption in transit (TLS) + at rest; secrets manager; least-privilege IAM; audit logging; RBAC.

## 13. Cross-cutting NFRs
- Availability target (e.g., 99.9% core), p95 latency budgets, offline capability on core loop, accessibility (WCAG AA), data privacy (DPDP/GDPR), and cost ceilings on AI (doc 13).
