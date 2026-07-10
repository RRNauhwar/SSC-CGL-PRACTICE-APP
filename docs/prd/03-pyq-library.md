# 03 — Previous Year Question (PYQ) Library

The PYQ library is the platform's foundational moat: the **largest, cleanest, richest, most correctly-classified organized PYQ database** for SSC exams. Everything else (weightage, analytics, adaptive practice, prediction) is only as good as this data.

## 1. Goals

- **Coverage:** Every paper, every shift, every language, spanning **20+ years** for CGL & CHSL first, then CPO, MTS, GD, JE, Stenographer, Selection Post.
- **Correctness:** Verified answers, verified classification, deduped, versioned, with error-reporting feedback loops.
- **Richness:** Each question carries the full metadata set below so it can power practice, revision, analytics, and AI.

## 2. Coverage Matrix (tracking model)

Coverage is tracked as a grid so ops always knows what's missing:

```
Exam × Tier × Year × Shift × Language × Section  →  status
status ∈ { missing, ingested_raw, ocr_done, classified, verified, published }
```

- A **coverage dashboard** (admin) shows completeness % per exam/year and highlights gaps (e.g., "CHSL 2018 Tier I, Shift 3, Hindi — missing").
- Priority backfill order (P0→P2): recent 5 years CGL/CHSL → 6–10 years → 11–20 years → other exams.

## 3. Per-Question Data Model

Every question is a first-class entity with the following fields (see doc 14 for storage):

### Core content
- `id` (stable UUID), `canonical_hash` (for dedup)
- `stem` (question text, rich: math via LaTeX/MathML, tables, images)
- `question_type` (single-correct MCQ, multi-select, numeric-entry, match, comprehension-linked, statement/assertion-reason)
- `options[]` (with per-option text/image), `correct_option(s)`
- `passage_id` (nullable — for comprehension/RC clusters), `question_group_id` (for linked sets)
- `language` and `translations[]` (each translation linked to same canonical question)

### Solutions & learning aids
- `solution` (primary, step-by-step)
- `alternative_solutions[]` (e.g., shortcut vs. conventional)
- `video_explanation` (url + provider + duration + language)
- `tricks[]`, `common_mistakes[]`, `formula_refs[]` (link to formula library)
- `ai_explanation` (generated, cached; regenerable) + `ai_explain_differently` variants

### Classification (see doc 04)
- `section`, `subject`, `chapter`, `subchapter`, `topic`, `subtopic`, `concepts[]`
- `difficulty` (Easy/Medium/Hard + numeric `difficulty_score` 0–100, IRT-calibrated over time)
- `tags[]` (calculation-heavy, conceptual, memory-based, statement-based, shortcut-friendly, time-consuming, etc.)
- `mistake_types_likely[]`
- `ai_confidence` (0–1, classifier confidence), `classification_status`

### Provenance
- `exam`, `tier`, `year`, `shift`, `exam_date`, `source` (official paper / verified compilation), `source_ref`
- `version`, `created_by`, `verified_by`, `verified_at`

### Live/derived statistics (computed, not authored)
- `avg_solving_time` (community), `ideal_time_required` (expert/AI estimate)
- `success_rate` (community accuracy), `attempt_count`
- `discrimination_index` (how well it separates strong/weak users — for IRT)

### Per-user overlay (stored separately, keyed by user)
- `bookmarked`, `personal_notes`, `flag/report`, `last_attempt`, `attempt_history[]`, `srs_state`

### Relationships
- `similar_pyqs[]` (embedding-based nearest neighbors), `repeats_of[]` (near-duplicate across years — a key SSC signal)
- `discussion_thread_id` (community)

## 4. Ingestion & Enrichment Pipeline

A staged pipeline moves a raw paper to a published, enriched question set. Each stage is a background worker with ret/idempotency (see doc 12).

```
1. INTAKE        Upload official PDF/image/scan or structured import; register in coverage grid.
2. OCR/PARSE     OCR (math-aware) + layout parsing → raw question blocks (stem, options, answer key).
                 Handle multi-column, Hindi/English, tables, figures.
3. STRUCTURE     Split into question entities; detect passages/linked groups; extract options + answer key.
4. DEDUP         Compute canonical_hash + embeddings; detect repeats across years/shifts; link repeats_of[].
5. CLASSIFY      Auto-classify (doc 04): taxonomy, difficulty, tags, mistake-types, concepts. Emit ai_confidence.
6. ENRICH        Generate/attach solutions, alt-solutions, tricks, common-mistakes, formula refs, AI explanation.
                 Attach/queue video explanations.
7. HUMAN REVIEW  Expert queue (admin): verify answer key, classification, solution quality.
                 Low ai_confidence or flagged repeats prioritized. Approve/reject/edit → version bump.
8. PUBLISH       Mark verified→published; index in search + embeddings; recompute weightage; make live.
9. MONITOR       Track error reports + success-rate anomalies → auto-reopen for review.
```

- **Idempotent + resumable:** re-running any stage is safe; each stage writes status to the coverage grid.
- **AI-assisted, human-verified:** AI accelerates classification/enrichment; humans own final correctness. `classification_status` gates publishing.
- **Feedback loop:** user error reports and statistical anomalies (e.g., success_rate wildly off predicted difficulty) reopen questions for review.

## 5. Question Detail Screen (learner-facing)

A single, consistent object page (`/library/questions/:id`) presenting:

- Stem + options; on answer: correctness, primary solution, "show alternative", video, tricks, common mistakes, formulas used.
- **Meta strip:** difficulty, ideal time, your time, success rate, year/shift/exam, tags.
- **Actions:** bookmark, add note, add to a deck, report, share.
- **Similar PYQs** and **repeats across years** (strong motivator: "this exact concept appeared 6 times").
- **Community discussion** thread (P1).
- **Ask Mentor** ("explain this differently", "why is my approach wrong").

## 6. Quality & Governance

- **Golden set:** a human-verified benchmark set used to measure classifier + OCR accuracy each release.
- **Answer-key confidence:** questions with conflicting sources flagged until resolved; never silently guess.
- **Versioning:** edits create versions; user attempts reference the version they saw.
- **Error SLA:** reported errors triaged within a defined SLA (admin dashboard, doc 11).
- **Licensing/attribution:** track `source` and rights; official SSC PYQs are factual exam content but provenance is recorded for transparency.

## 7. Success Metrics

- Coverage completeness % per exam/year (target: 100% recent 10 yrs CGL/CHSL by end of P1).
- Classification accuracy vs. golden set (target ≥ 95% subject/chapter, ≥ 90% topic).
- OCR extraction accuracy (target ≥ 98% char accuracy for typed papers).
- Error-report rate per 1k attempts (target trending down); dedup precision/recall.

## 8. Score-impact justification (north-star filter)

PYQ practice on real, correctly-classified questions with repeats-across-years surfacing is the single highest-leverage activity for SSC: it trains on exam-truth, exposes exactly what tends to be asked, and feeds weightage/prediction. Passes the filter on **all five** criteria.
