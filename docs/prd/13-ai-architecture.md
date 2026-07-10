# 13 — AI Architecture

The AI layer powers classification, enrichment, explanations, the Mentor, recommendations, prediction, and (later) voice/OCR/generation. Design goals: **grounded, accurate, cost-controlled, evaluable, and privacy-preserving.**

## 1. Capability → technique map

| Capability | Primary technique | Notes |
|-----------|-------------------|-------|
| Question classification (taxonomy/tags) | Embeddings + retrieval + constrained LLM classifier | Human-verified; confidence-gated (doc 04) |
| Difficulty estimation | Model prior + IRT calibration on attempts | Continuous recalibration (doc 04) |
| Solution / explanation generation | LLM (RAG-grounded) | Cached; "explain differently" variants (doc 03/06) |
| Similar-question / dedup | Sentence/math embeddings + ANN | pgvector → dedicated vector DB at scale |
| AI Mentor chat & coaching | LLM orchestration + RAG over user data + corpus | Grounded, guardrailed (doc 06) |
| Recommendations / next-best-action | Heuristic utility model → learning-to-rank | Utility formula in doc 06 |
| Score/percentile/AIR prediction | Statistical model + calibration | Confidence bands (doc 07) |
| Weightage forecasting | Time-series + gradient boosting | Backtested (doc 04) |
| Mistake-type inference | Heuristics → supervised classifier | Trained on self-tag labels (doc 07) |
| SRS scheduling | Memory model (FSRS-style) | Not an LLM; statistical (doc 08) |
| Voice search / tutor | ASR + LLM (P1/P2) | EN/HI |
| OCR / image-question search | Math-aware OCR + embeddings (P2) | Doc 03/10 |
| AI question generation | LLM + validation pipeline | Never in ranked tests (doc 05) |

## 2. Model strategy

- **Tiered models:** small/cheap model for classification/tagging/short tasks; larger model for complex explanation/chat/reasoning. Route by task complexity + confidence.
- **Provider-abstraction layer:** a thin gateway so models (hosted API or self-hosted open-weights) are swappable; avoids lock-in and enables cost/latency routing + fallback.
- **Self-hosted option** for high-volume, cost-sensitive tasks (classification, embeddings) using open-weight models; managed APIs for frontier reasoning where quality matters.
- **Fine-tuning / adapters (P2):** domain-tune on SSC content + verified explanations for better cheap-model quality.

## 3. Retrieval-Augmented Generation (RAG)

- **Two knowledge sources:** (a) verified content corpus (PYQs, solutions, concepts, formulas); (b) the user's own performance data (mastery, attempts, errors, plan).
- **Flow:** query → retrieve relevant concepts/questions (vector + keyword hybrid) + relevant user stats → construct grounded prompt → generate → post-check (grounding/citation) → cache.
- **Grounding enforcement:** responses must reference retrieved concept/question IDs; a verifier step rejects/repairs ungrounded factual claims. For GA/factual answers, answer only from verified sources.

## 4. Embeddings & feature store

- **Embeddings:** questions, concepts, and (optionally) user "knowledge vectors" for similarity + recommendation. Math-aware embedding handling (LaTeX normalized before embedding).
- **Feature store:** centralizes features used by recsys/prediction/mistake-classifier (mastery, accuracy/speed by concept, recency, time-of-day, streak, weightage) — consistent between training and serving.

## 5. Orchestration & prompting

- **Prompt templates** versioned in code/registry; each has an eval suite.
- **Structured outputs:** classifiers/generators return validated JSON (schema-checked); invalid outputs retried/repaired.
- **Guardrail middleware:** input/output moderation (safety, doc 06/15), PII scrubbing, jailbreak resistance, refusal on unsafe requests.
- **Caching:** explanation + classification results cached by content hash; user-chat responses not cached across users.

## 6. Evaluation & quality

- **Golden sets** (doc 03) for classification/OCR accuracy; regression-tested each release.
- **Explanation quality:** automated checks (grounded? correct final answer matches key?) + human spot-review + user "was this helpful?" signal.
- **Prediction calibration:** predicted vs. actual mock scores (doc 07); report calibration error + reliability curves.
- **Recsys eval:** offline ranking metrics + online A/B on mastery-gain-per-hour (doc 06).
- **Drift monitoring:** track accuracy/calibration over time; alert on degradation (admin AI monitoring, doc 11).

## 7. Cost, latency & reliability controls

- **Rules-first:** the majority of proactive coaching/recommendations use deterministic logic; LLMs reserved for genuine language/reasoning tasks.
- **Cache + batch + small-model routing** to cap per-user AI cost; per-user fair-use quotas on premium AI chat.
- **Fallbacks:** if LLM unavailable/slow → templated explanations + rules-based Mentor (graceful degradation, doc 12).
- **Budgets & alerts:** per-feature AI spend tracked; hard ceilings with alerting.

## 8. Safety, privacy & ethics

- User data used only for that user's personalization; **no training on private data without explicit consent**; PII scrubbed from any logs/eval sets.
- Transparent AI: every recommendation/explanation can show its basis ("why am I seeing this?").
- Honest predictions (bands, never guarantees); safety guardrails incl. self-harm handling (doc 06); bias checks so difficulty/recommendations don't systematically disadvantage any group.

## 9. Future AI (P2–P3) — architecture readiness
- Voice tutor (ASR+TTS+LLM), image-solution recognition, natural-language question search, autonomous coaching agent (planning loop with tool-use over the user's data, under user oversight), AI interview coach, and cheating/anomaly detection models. The provider-abstraction + feature-store + RAG foundations make these incremental, not rewrites.
