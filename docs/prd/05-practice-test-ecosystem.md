# 05 — Practice & Test Ecosystem

Two engines sharing one runtime and one analytics pipeline:

- **Practice Engine** — low-stakes, feedback-rich, per-question learning.
- **Test Engine** — high-fidelity, exam-realistic simulation with ranks and percentiles.

Both emit the same event stream (per-question timing, correctness, error-type) into analytics (doc 07), SRS (doc 08), and mastery — so every attempt improves personalization.

---

## Part A — Practice Engine

### A.1 Practice modes (complete list)

| Mode | Description | Selection logic | Phase |
|------|-------------|-----------------|-------|
| Chapter Test | Questions from a chapter | taxonomy filter | P0 |
| Topic / Subtopic Test | Narrower scope | taxonomy filter | P0 |
| Mixed Practice | Cross-chapter/subject blend | weighted random | P0 |
| Adaptive Practice | Difficulty adjusts live to ability θ | IRT-driven (see A.3) | P1 |
| Weak-Topic Practice | Targets lowest-mastery concepts | mastery ascending | P0 |
| Wrong-Question Practice | Previously-wrong items | error log | P0 |
| Revision Practice | Items due in SRS | SRS queue (doc 08) | P0 |
| Bookmarked / Favourite | User-saved items | user overlay | P0 |
| Time / Speed Challenge | Solve under tight time budget | timed | P1 |
| Accuracy Challenge | Maximize accuracy; penalize wrong | scored | P1 |
| Daily Challenge | Curated daily set (streak-linked) | daily job | P0 |
| Random Practice | Pure random within scope | random | P0 |
| PYQ Only / Latest / Oldest PYQ | Only PYQs, sorted by recency | provenance filter | P0 |
| Exam-Pattern Practice | Mirrors real section mix/timing | pattern template | P0 |
| Custom Practice Generator | User filters (subject/topic/difficulty/tag/year/shift/time) | query builder | P1 |
| AI-Generated Practice | Model-generated items on a concept | AI generator + validation | P1→P2 |
| Formula / Concept / Difficulty-Based | Grouped by aid or level | tag/difficulty filter | P1 |

### A.2 Practice session runtime

- **Question card:** stem, options, optional scratchpad/calculator (as allowed), timer (per-question + total), flag, skip.
- **Immediate feedback (practice only):** on submit → correct/incorrect, solution, alt-solution, video, tricks, your-time vs. ideal-time.
- **Inline error tagging:** if wrong, user can (optionally, one-tap) tag why (careless / calculation / didn't-know / misread / guessed) — feeds mistake taxonomy; if skipped, system auto-infers (doc 07).
- **Post-session summary:** accuracy, avg time, weak concepts touched, items auto-added to SRS + wrong-question pool, next-best-action.
- **Pause/resume**, offline-capable, syncs later (doc 12).

### A.3 Adaptive practice algorithm

- Maintain per-user ability estimate `θ_concept` per concept (and a global `θ`).
- Select next item to maximize information near `θ` (IRT): pick difficulty `b ≈ θ`, avoid recently-seen items, respect concept-focus.
- Update `θ` after each answer (Bayesian/Elo-style update). Correct on hard → θ up faster; wrong on easy → θ down.
- Stop conditions: target session length, mastery threshold reached, or fatigue signal (declining accuracy + rising time).
- Interleaving: mix concepts to strengthen discrimination (spacing/interleaving beats blocking for retention).

### A.4 Custom & AI-generated practice

- **Custom generator:** query builder over all metadata (subject/chapter/topic/difficulty/tags/year/shift/success-rate/time). Save as reusable templates.
- **AI-generated items:** generate variants on a target concept, then **validate** (solvability, single correct answer, difficulty estimate, plagiarism/near-dup check vs. PYQ) before serving. Clearly labeled "AI practice — not a PYQ". Never used in ranked tests.

---

## Part B — Test Engine (Exam Simulation)

### B.1 Test types (complete list)

Mini, Chapter, Subject, Sectional, Combined, Previous-Year-Paper (PYP), Topic-wise, Daily, Weekly, Monthly, Mock, Grand, Marathon, Live, Adaptive, and Unlimited AI-Generated tests.

- **PYP** replays an actual paper exactly (same questions, order, timing, marking).
- **Grand/Full Mock** mirrors full exam pattern; **Marathon** is extended multi-section endurance; **Live** is scheduled and synchronized across users for real ranks.

### B.2 Exam-simulation runtime — must match SSC CBT exactly

Non-negotiable fidelity requirements:

- **Question palette** (numbered grid: not-visited / not-answered / answered / marked-for-review / answered-&-marked) with exact SSC color semantics.
- **Global countdown timer** + per-section timing where the exam enforces it.
- **Negative marking** exactly per exam rules (e.g., typically −0.5 for CGL Tier I) configured per test template.
- **Language switch** (English/Hindi) toggling without losing state.
- **Navigation:** Save & Next, Mark for Review & Next, Clear Response, section tabs; scroll and question jump identical to SSC UI.
- **Pause/Resume** (for practice-style tests; disabled for Live/ranked timed integrity where appropriate).
- **Full-screen / anti-distraction** and (P2) proctoring hooks for high-stakes.
- **Instructions screen** replicating SSC's pre-exam instructions and consent.

### B.3 Scoring & results

- **Score** = `(correct × marks) − (wrong × negative_marks)`; unattempted = 0; per-section subtotals.
- **Percentile** vs. the test's attempt population; **rank** (all-time or, for Live, within the live cohort).
- **Normalization** hooks (SSC normalizes across shifts) — configurable per test to reflect official method when applicable.
- Results delivered instantly on submit; ranks update as more users attempt.

### B.4 Post-test review & analytics

- **Question-by-question review:** your answer vs. correct, solution(s), video, time-spent vs. ideal & vs. topper-median, correctness, and **auto-classified error type**.
- **Section analytics:** accuracy, attempts, time distribution, marks lost to negative marking, "time sinks" (high-time low-return questions).
- **Strategy insights:** e.g., "you spent 4.2 min on 3 Quant questions worth 3 marks — capping at 2 min would have freed time for 5 easy GA questions."
- **Auto-actions:** wrong/slow items → SRS + wrong-question pool; weak concepts → planner rebalance; predicted score updated (doc 07).
- **Comparisons:** vs. your past attempts, vs. topper patterns, vs. cohort.

### B.5 Adaptive & AI-generated tests

- **Adaptive test:** item selection by IRT to estimate ability efficiently in fewer questions (great for quick placement).
- **Unlimited AI-generated tests:** assemble fresh, pattern-accurate tests from PYQ pool + validated AI items; never mix unvalidated AI items into ranked/percentile tests.

### B.6 Test lifecycle & state

```
CREATED → IN_PROGRESS ⇄ PAUSED → SUBMITTED → SCORED → REVIEWED
```
- Autosave every answer + palette change (offline-safe, conflict-resolved on sync — doc 14).
- Time integrity: server-authoritative end time for Live/ranked; client timer reconciled on reconnect.

---

## Shared concerns

- **One event schema** for practice + tests → consistent analytics, SRS, mastery.
- **Offline-first:** download tests, attempt offline, sync + rank on reconnect.
- **Accessibility:** font scaling, high contrast, language switch, keyboard nav on desktop.

## Score-impact justification
Realistic simulation (exact SSC UI + negative marking + timing) builds exam temperament and reveals strategy leaks (time management, guess discipline). Targeted practice modes (weak/wrong/PYQ/adaptive) maximize score-per-hour. Passes the north-star filter on all five criteria.
