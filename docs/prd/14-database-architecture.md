# 14 — Database Architecture

Storage design across relational, cache, search, vector, object, and analytics stores, plus the offline **sync/conflict model**. Choices favor a strong relational core (correctness, relationships, transactions) with specialized stores for search, vectors, real-time, and analytics.

## 1. Store selection & rationale

| Store | Tech | Holds | Why |
|-------|------|-------|-----|
| OLTP | PostgreSQL | users, content metadata, taxonomy, attempts, subscriptions, community | Relational integrity, transactions, JSONB flexibility |
| Cache / realtime | Redis | sessions, hot reads, counters, leaderboards, rate limits | Sub-ms, sorted sets for ranks |
| Search | OpenSearch | full-text + faceted question/content search | Text relevance + facets (doc 10) |
| Vector | pgvector → dedicated | embeddings: similar questions, RAG, dedup | ANN similarity (doc 13) |
| Object | S3-compatible | images, video, PDFs, exports | Cheap, CDN-fronted |
| Analytics/OLAP | ClickHouse/BigQuery | event lake, rollups, ML training data | Columnar, heavy aggregation |

## 2. Core relational schema (entities & key fields)

Language-agnostic; PK = `id` (UUID) unless noted. Timestamps (`created_at`, `updated_at`) on all.

### Identity & access
- **users**(id, phone, email, name, handle, locale, created_at, status)
- **auth_credentials**(user_id, provider, provider_uid, password_hash?, mfa_enabled)
- **roles**(id, name), **user_roles**(user_id, role_id) — RBAC (doc 15)
- **user_preferences**(user_id, theme, language, notification_prefs JSONB, quiet_hours, data_saver)
- **subscriptions**(id, user_id, plan, status, started_at, expires_at, source, coupon_id)
- **payments**(id, user_id, amount, currency, method, gateway_ref, status, invoice_no, gst_details JSONB)

### Content & taxonomy
- **exams**(id, code, name), **tiers**(id, exam_id, name)
- **taxonomy_nodes**(id, parent_id, level ∈ {section,subject,chapter,subchapter,topic,subtopic}, name, exam_id) — self-referential tree
- **concepts**(id, taxonomy_node_id, name, description, prerequisites JSONB)
- **questions**(id, canonical_hash, stem, question_type, language, passage_id?, group_id?, exam_id, tier_id, year, shift, exam_date, source, difficulty, difficulty_score, ai_confidence, classification_status, version, verified_by, status) — see doc 03
- **question_options**(id, question_id, text, media_ref, is_correct, order)
- **question_translations**(id, question_id, language, stem, options JSONB)
- **question_concepts**(question_id, concept_id, weight) — many-to-many
- **question_tags**(question_id, tag) — nature tags (calc-heavy, etc.)
- **question_assets**(id, question_id, type ∈ {solution,alt_solution,video,trick,common_mistake,ai_explanation}, content, language)
- **formulas**(id, concept_id, name, expression, notes), **question_formulas**(question_id, formula_id)
- **question_relations**(question_id, related_id, type ∈ {similar, repeat_of})
- **question_stats**(question_id, attempt_count, success_rate, avg_time, ideal_time, discrimination_index) — derived, refreshed
- **weightage**(taxonomy_node_id, window, appearance_count, share, importance_score, predicted_share, updated_at) — per chapter/topic × window (doc 04)

### Assessment
- **tests**(id, type, exam_id, tier_id, title, section_config JSONB, marking_scheme JSONB, duration, is_live, live_at, status)
- **test_questions**(test_id, question_id, section, order)
- **attempts**(id, user_id, test_id?, mode, started_at, submitted_at, status, score, section_scores JSONB, percentile, rank) — **partitioned by month** (high volume)
- **attempt_answers**(id, attempt_id, question_id, chosen JSONB, is_correct, time_spent_ms, flagged, palette_state, error_type?, answered_at)
- **practice_sessions**(id, user_id, mode, config JSONB, started_at, ended_at, summary JSONB)

### Learning state
- **concept_mastery**(user_id, concept_id, mastery, theta, last_practiced_at, attempts, updated_at) — PK(user_id, concept_id)
- **srs_state**(user_id, concept_id, stability, difficulty, due_at, last_review_at, lapses, interval) — SRS memory model (doc 08)
- **user_question_overlay**(user_id, question_id, bookmarked, note, last_result, last_time_ms, report_flag) — PK(user_id, question_id)
- **plans**(id, user_id, length_days, exam_date, daily_budget_min, status, created_at)
- **plan_tasks**(id, plan_id, date, type, ref_id, est_minutes, status)
- **predictions**(id, user_id, generated_at, predicted_score JSONB, percentile, air_range, confidence)

### Gamification & community
- **xp_ledger**(id, user_id, delta, reason, ref, created_at), **user_progress**(user_id, xp, level, coins, streak, longest_streak, last_active_date)
- **achievements**(id, code, name, criteria JSONB), **user_achievements**(user_id, achievement_id, earned_at)
- **quests**(id, scope, criteria JSONB, period), **user_quests**(user_id, quest_id, progress, status)
- **leaderboards** — materialized in Redis sorted sets; periodic snapshots to Postgres
- **forums/threads/posts**(...), **study_groups**(...), **group_members**(...), **battles**(...) — community
- **notes / flashcards / decks**(user_id, ...) — notebooks (doc 10); flashcards link to srs_state

### Ops
- **notifications**(id, user_id, type, channel, payload JSONB, scheduled_for, sent_at, opened_at, actioned_at)
- **audit_logs**(id, actor_id, action, entity, entity_id, before JSONB, after JSONB, created_at)
- **error_reports**(id, question_id, user_id, reason, status, resolved_by)
- **coverage_grid**(exam_id, tier_id, year, shift, language, section, status) — ingestion tracking (doc 03)

## 3. Simplified ERD (key relationships)

```
users 1───* attempts *───1 tests *───* questions
users 1───* concept_mastery *───1 concepts *───* questions
users 1───* srs_state *───1 concepts
users 1───* user_question_overlay *───1 questions
users 1───1 user_progress ; users 1───* xp_ledger
taxonomy_nodes (tree) 1───* concepts ; taxonomy_nodes 1───* weightage
questions 1───* question_options ; questions 1───* question_assets
plans 1───* plan_tasks ; users 1───* plans
```

## 4. Indexing & partitioning

- **attempts / attempt_answers:** partition by month (and/or hash by user) — largest tables; index on (user_id, submitted_at), (test_id), (question_id).
- **questions:** indexes on (exam_id, tier_id, year, shift), (canonical_hash), GIN on tags/JSONB; full-text mirrored to OpenSearch.
- **concept_mastery / srs_state:** composite PKs; index on (user_id, due_at) for fast due-queue queries.
- **weightage:** index on (taxonomy_node_id, window).
- Use covering indexes for hot dashboard reads; move heavy aggregation to OLAP.

## 5. Derived data & rollups

- Real-time counters in Redis (session accuracy, streaks, leaderboards).
- Batch rollups (daily/weekly) → analytics tables/OLAP for dashboards + ML.
- `question_stats`, `weightage`, `concept_mastery`, `predictions` recomputed via workers on relevant events (doc 12 §4).

## 6. Offline sync & conflict model

- **Client local DB** (SQLite/IndexedDB) mirrors: downloaded questions/tests, srs_state, overlays, notebooks, and an **outbox** of unsynced events.
- **Sync protocol:** each entity has `updated_at` + `version` (or vector clock for overlays). Delta sync by "changes since last cursor".
- **Conflict resolution per entity class:**
  - **Attempts / attempt_answers:** append-only, immutable once submitted; server-authoritative scoring. No conflicts (new rows).
  - **User overlays (notes/bookmarks/flashcards):** last-write-wins by timestamp, or field-level merge / CRDT for notes text to avoid clobbering concurrent edits.
  - **srs_state / mastery:** recomputed server-side from the authoritative event log, not merged blindly — client values are hints, server recomputation is truth.
  - **Plans:** server recomputes; client edits are intents replayed against latest plan.
- **Ranked/live tests:** require online + server time authority; offline attempts marked unranked until validated.

## 7. Data lifecycle, privacy & retention

- **Retention policies:** raw event granularity kept for a defined window then downsampled; user can request export/delete (DPDP/GDPR) — cascade + anonymize.
- **PII isolation:** PII columns separated/encrypted; analytics uses pseudonymized IDs.
- **Backups + PITR** (doc 12); tested restores.
- **Soft-delete + audit** for content; hard-delete workflows for user-data requests.

## 8. Scaling path
- Start single primary + read replicas; partition hot tables; add caching. Later: shard by user for assessment/learning-state; dedicated vector DB; CDC (Debezium) → OLAP/stream. Each store scales independently behind service boundaries (doc 12).
