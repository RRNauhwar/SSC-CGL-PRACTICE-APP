# 04 — Intelligent Classification & Weightage Engine

Two tightly-coupled engines: (A) **Classification** — assigns every question its place in the taxonomy plus rich attributes; (B) **Weightage** — turns the classified corpus into "what to study first" via historical trends and predictive analytics.

---

## Part A — Intelligent Classification

### A.1 What gets classified

Every question receives:

| Dimension | Values / Notes |
|-----------|----------------|
| Section | Quant, Reasoning, English, General Awareness (per exam pattern) |
| Subject → Chapter → Subchapter → Topic → Subtopic | Full taxonomy path (doc 01) |
| Concept(s) | ≥1 atomic concept; links to SRS + mastery |
| Difficulty | Easy/Medium/Hard **and** `difficulty_score` 0–100 (IRT-calibrated) |
| Weightage tags | Importance, frequency (derived, see Part B) |
| Question-nature tags | calculation-heavy, conceptual, memory-based, statement-based, shortcut-friendly, time-consuming |
| Mistake-type propensity | calculation, reading/misinterpretation, concept-gap, careless, guess-prone |
| Expected probability | P(concept appears next exam) — from weightage engine |
| AI confidence | 0–1 classifier confidence; gates auto-publish vs. human review |

### A.2 Classification method

1. **Embedding + retrieval:** embed the question; nearest-neighbor against the labeled corpus to propose taxonomy + concepts.
2. **LLM classifier with taxonomy constraints:** the model must choose from the canonical taxonomy IDs (no free-text), returning path + concepts + tags + rationale + confidence.
3. **Difficulty:** initial estimate from model + features (length, steps, options similarity); continuously **re-calibrated via IRT** using real attempt data (`success_rate`, `discrimination_index`).
4. **Mistake-type propensity:** learned from aggregated per-user error tagging (doc 07) — which error types cluster on this question.
5. **Confidence gating:** `ai_confidence < threshold` OR conflicting neighbors → route to human review (doc 03 stage 7).

### A.3 Difficulty calibration (IRT-lite)

- Start with a model estimate; treat each question with parameters `(a=discrimination, b=difficulty)`.
- Update `b` so that `difficulty_score` aligns with observed p(correct) across ability levels.
- Use ability estimate `θ` per user (from mastery/analytics) so difficulty is relative to population, not absolute — this feeds adaptive practice/tests (doc 05).

### A.4 Governance

- Taxonomy is owned by a **taxonomy service**; classification writes only valid IDs.
- Re-classification is versioned; changing a concept mapping triggers recompute of dependent weightage + user mastery links.

---

## Part B — Weightage Engine

### B.1 What the learner sees (per chapter/topic)

For every chapter (and drill-down to topic/concept):

- **Questions asked in:** last 20 / 15 / 10 / 5 / 3 / 1 years (counts + share of section).
- **Trend graph:** appearances per year (line/bar) with moving average.
- **Heatmap:** year × shift grid showing intensity of appearance.
- **Probability of appearing** next exam (with confidence band).
- **Importance score** (0–100) — a single number combining frequency, recency, and reliability.
- **Difficulty trend** — is this chapter getting harder over years?
- **Expected future weightage** — predicted count/share for the upcoming cycle.

### B.2 Importance score (specified formula)

For a chapter `c` within a section:

```
frequency(c)   = normalized appearance share over a window
recency(c)     = time-decayed appearance weight (recent years weigh more)
consistency(c) = 1 - variance of yearly appearance share (stable topics score higher)
trend(c)       = slope of appearance share over last N years (rising topics get a bump)

ImportanceScore(c) = 100 * (
      w_f * frequency(c)
    + w_r * recency(c)
    + w_c * consistency(c)
    + w_t * max(0, trend(c))
)
```

- Recency uses exponential decay: `recency = Σ_year appearances(year) * λ^(current_year - year)`, with `λ` tuned (e.g., ~0.8) so last-5-years dominate but history still counts.
- Weights `w_f, w_r, w_c, w_t` are tunable per exam/section and validated against held-out recent papers.
- Output is cached per chapter and recomputed on publish events (doc 03 stage 8).

### B.3 Probability of appearance

- Model P(concept/chapter appears next exam) using historical base rate + recency + trend, calibrated so that predicted probabilities match observed frequencies on held-out years (reliability/calibration curve tracked).
- Present as a band (e.g., "very likely 85–95%") rather than false-precision point estimates.

### B.4 Predictive future weightage (ML)

- **Task:** forecast next-cycle appearance count/share per chapter/topic.
- **Approach:** time-series + gradient-boosted features. Features: yearly appearance series, recency-decayed counts, trend slope, difficulty trend, section quota (SSC section sizes are fairly fixed), and cross-topic correlations (some topics co-vary).
- **Backtesting:** train on years ≤ Y, predict Y+1, compare to actual; report MAE on share and rank-correlation of chapter ordering.
- **Output feeds:** planner (allocate study time by expected weightage × user weakness), Mentor prioritization, and the "expected future weightage" UI. Always shown with a confidence band and an honest "prediction, not guarantee" note.

### B.5 How weightage drives the product (score-impact filter)

- **Planner** allocates time by `priority = f(expected_weightage, user_weakness, difficulty)` — study high-yield weak areas first.
- **Recommendations/Mentor** prioritize chapters by importance × weakness.
- **Practice generators** can bias question mix toward high-weightage concepts.
- Directly serves "study the right things" → **saves time + increases score**. Passes the filter.

### B.6 Success metrics

- Prediction backtest MAE (target: chapter-share MAE small enough that top-15 predicted chapters capture ≥ 90% of actual high-weight chapters).
- Rank-correlation (Spearman) between predicted and actual chapter importance on held-out years.
- Calibration error of appearance probabilities.
- Downstream: do users who follow weightage-guided plans improve predicted score faster than those who don't (A/B).
