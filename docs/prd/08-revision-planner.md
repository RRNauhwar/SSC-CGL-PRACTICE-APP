# 08 — Smart Revision Engine & Study Planner

Two systems that turn effort into durable, well-timed retention and a plan that survives real life. Both are score-impact-critical: SSC success is as much about *not forgetting* and *consistent execution* as about learning new material.

---

## Part A — Smart Revision Engine (SRS)

A world-class spaced-repetition system operating at the **concept** level (and item level for specific hard questions).

### A.1 Intervals

- Base ladder: **1 → 3 → 7 → 15 → 30 → 60 → 90 days** (and beyond), advancing on successful recall, contracting on failure.
- **Adaptive intervals:** the ladder is a default; actual next-interval is computed per concept from the user's memory model (A.3), not fixed globally.

### A.2 What enters the queue

- Concepts touched in practice/tests, weighted by error and difficulty.
- **Wrong/slow items** auto-enqueued (from doc 05).
- **Forgotten-concept detection:** concepts whose predicted recall probability drops below threshold (even without a recent wrong answer) are surfaced *before* they're forgotten.
- Mentor/AI-generated revision queues bundle related weak concepts.

### A.3 Memory model & decay prediction

- Model recall probability with a forgetting curve: `R(t) = exp(−t / S)`, where `t` = time since last successful review and `S` = memory stability for that user×concept.
- **Stability `S` grows** with each successful, well-spaced recall and with mastery; **shrinks** on lapse. Difficulty of the concept modulates growth.
- **Schedule** the next review when `R(t)` is predicted to fall to a target retention (e.g., ~85–90%) — this is the optimal spacing point (SM-2/FSRS-style, tuned on our retention-curve data from doc 07).
- **Priority within the due queue:** most-decayed × highest-weightage × exam-proximity first.

### A.4 Revision experience

- **`/revision/queue`:** today's due items, sized to available time; each review = quick recall (question or concept prompt) → self/auto-graded → interval updated.
- **Revision calendar:** upcoming load per day; the planner smooths spikes so no day is overloaded.
- **Revision streaks** + completion analytics; "forgotten before exam" risk list.
- Fully **offline-capable**; grades sync later.

### A.5 Metrics
- Retention rate at each interval; % due-items completed; reduction in re-lapse; correlation of SRS adherence with mastery/score.

---

## Part B — Study Planner

An adaptive plan that always knows "what to do today" and **self-heals** when the user falls behind.

### B.1 Plan presets & custom

- Presets: **30 / 60 / 90 / 120 / 180 / 365 days** to exam; plus fully **custom** (pick length, daily hours, off-days, target sections).
- Plan derived from: syllabus coverage need, **weightage/predicted-weightage** (doc 04), current **mastery** (doc 07), SRS load, and daily time budget.

### B.2 Plan generation (algorithm)

```
1. Compute per-concept "gap" = weightage_share × (1 − mastery) × difficulty_factor.
2. Total available study-minutes = days_to_exam × daily_budget − reserved_revision_time.
3. Allocate learning time to concepts in priority order (highest gap first), respecting
   section balance and prerequisite ordering (teach fundamentals before dependent topics).
4. Reserve daily slots for: SRS revision, at least one weekly full/sectional mock, and rest.
5. Sequence into a day-by-day calendar with interleaving (mix sections for retention).
6. Leave buffer days (esp. final 2–3 weeks = revision + mocks heavy, minimal new topics).
```

### B.3 Dynamic re-planning (self-healing) — a core promise

- **On missed day / backlog:** redistribute missed tasks across upcoming days **without overloading** (cap daily load; if backlog exceeds capacity, deprioritize lowest-weightage items and tell the user honestly what's being dropped).
- **On performance change:** if a concept masters faster/slower than expected, reallocate time.
- **On exam-date change:** recompute the whole plan.
- **Streak-protection:** a missed day triggers a gentle recovery path, not a guilt spiral.
- **Final-phase shift:** as exam nears, automatically tilt from "learn new" to "revise + mock + fix mistakes".

### B.4 Planner experience

- **Today** shows the plan's tasks first (integrated with recommender, doc 06).
- **Plan calendar** (`/planner/calendar`): visual day-by-day, drag to reschedule (manual override respected, then plan adapts around it).
- **Progress vs. plan:** ahead/behind indicator; projected completion; "if you keep this pace, predicted exam-day score = X".
- Plan changes are explained ("Moved 2 GA topics later because syllogisms are higher-weightage and weaker for you").

### B.5 Metrics
- Plan adherence rate; backlog recovery success; correlation between adherence and predicted-score trajectory; % users who keep an active plan to exam day.

## Score-impact justification
SRS directly attacks forgetting (retention); the adaptive planner ensures consistent, weightage-aligned execution and removes the demotivation of a broken plan (confidence + consistency). Both are among the highest-leverage, most-neglected levers in real SSC prep.
