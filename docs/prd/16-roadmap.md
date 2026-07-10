# 16 — Roadmap

Phased delivery from a credible MVP to a category-defining platform. Phases map to the prioritization in doc 02. Dates are relative (from build start) and indicative — scope is fixed by value, timelines flex with team size.

## Guiding sequencing principle
Build the **data + core loop** first (PYQ library → practice/tests → analytics → SRS/planner), because every intelligent feature depends on clean data and an event stream. Layer intelligence (AI/recsys/prediction), then engagement (gamification/community), then reach + advanced AI.

---

## Phase 0 — MVP ("Prove the core loop") · ~Months 0–4

**Goal:** a serious aspirant can practice real PYQs, take exam-realistic mocks, see their weaknesses, revise on schedule, and follow an adaptive plan — free.

- PYQ Library: CGL + CHSL, recent ~5 years, full metadata, weightage (historical), coverage dashboard, EN/HI.
- Practice: chapter/topic/mixed/PYQ/weak/wrong/bookmark + daily challenge; session review + inline error tagging.
- Tests: exam-sim runtime (exact SSC CBT palette/timer/negative-marking/language-switch/pause-resume), PYP + sectional + mock; results + review + section analytics.
- Analytics: overview, accuracy/speed, mistake taxonomy, chapter mastery.
- SRS: due-queue with base intervals; auto-enqueue wrong/weak items.
- Planner: presets (30–365) + dynamic re-plan.
- AI Mentor: rules-based proactive cards + prioritization + reminders; templated explanations.
- Recommender: heuristic next-best-action + daily goal.
- Gamification: XP + streaks + basic badges.
- Search: global keyword + faceted.
- Platform: PWA, offline core loop, dark/light, core notifications (push+in-app).
- Admin: ingestion + approval workflow + user management + coverage dashboard.
- Monetization: free + premium + coupons; payments (UPI/cards).
- Security foundation: AuthN/OTP, RBAC, encryption, audit logs.

**Exit criteria:** predicted-score calibration in place; a cohort completes onboarding→daily-loop→mock→review→revise; retention + coverage baselines measured.

---

## Phase 1 — Intelligence & Engagement · ~Months 4–9

- Adaptive practice (IRT/θ) + adaptive/live tests; marathon + monthly tests.
- ML weightage forecasting + probability-of-appearance; predicted future weightage UI.
- AI Mentor: LLM chat tutor + RAG explanations + "explain differently"; score-strategy narratives.
- Prediction: expected score + percentile + AIR with confidence bands; trajectory.
- Analytics depth: retention curves, learning velocity, consistency heatmaps, burnout detection.
- SRS: memory-decay model (FSRS-style) + forgotten-concept detection + revision calendar/streaks.
- Gamification depth: quests, weekly/monthly missions, leaderboards, challenge friends, season pass, certificates.
- Community: forums, question discussion, solution sharing, mock battles, peer comparison.
- Productivity: notes, flashcards→SRS, Pomodoro, habit/goal tracker, formula/concept notebooks.
- Search: voice search + natural-language search.
- Native apps (iOS/Android); more coverage years; coaching-partner basics + referral program.

**Exit criteria:** measurable mastery-gain-per-hour lift from recommendations (A/B); prediction within target calibration; premium conversion validated.

---

## Phase 2 — Depth, Reach & Advanced AI · ~Months 9–16

- Unlimited AI-generated tests + AI-generated practice (validated); formula/concept/difficulty-based practice.
- OCR/image question search + image-solution recognition; voice tutor.
- Advanced analytics: time-of-day performance, device usage, focus analytics, confidence calibration.
- Recsys → learning-to-rank on outcomes; deeper personalization + learning-style adaptation; stress/confidence support.
- Coverage: full 20-year CGL/CHSL; add CPO, MTS, GD, JE, Stenographer, Selection Post; more languages (regional).
- Growth: affiliate system, institution plans + white-label, scholarships at scale.
- Scale-out: extract heaviest services to microservices; dedicated vector DB; CDC→OLAP; shard hot tables.

---

## Phase 3 — Category-defining / Moonshots · ~Months 16+

- **Autonomous coaching agent:** plans, schedules, adapts, and tutors end-to-end with user oversight (tool-use over the user's data).
- **AI interview coach** (for interview-based recruitment stages) and doubt-solving agent.
- **Advanced anti-cheat / proctoring** for high-stakes partner exams.
- **Cross-exam expansion:** Banking (IBPS/SBI), Railways (RRB), UPSC, State PCS — reusing the exam-agnostic core.
- Predictive AIR/score before exam at population scale; national-level insights (aggregate, privacy-safe).

---

## Future AI features (target capabilities, mapped to phases)

| Feature | Phase |
|---------|-------|
| Predict expected score / percentile | P1 |
| Predict AIR before exam | P1→P2 |
| Burnout detection | P1 |
| Natural-language question search | P1 |
| Voice search | P1 |
| LLM-powered explanation engine + "explain differently" | P1 |
| Personalized coaching agent (assistive) | P1→P2 |
| OCR question scanner / image search | P2 |
| Image-solution recognition | P2 |
| Voice tutor | P2 |
| Cheating/anomaly detection | P2→P3 |
| Autonomous coaching agent | P3 |
| AI interview coach | P3 |

---

## North-star bets (what makes this uncopyable)

1. **The cleanest, most complete, correctly-classified PYQ database** in the market — the data moat everything else compounds on.
2. **Honest, calibrated prediction + weightage** aspirants actually trust — reputation moat.
3. **An AI mentor + analytics loop** that provably raises marks-per-hour — outcome moat.
4. **Offline-first + strong free tier + EN/HI** — reach moat into the underserved majority.
5. **Consistency engine** (SRS + adaptive planner + humane gamification) — habit moat that drives daily retention.

## Success gates between phases
Advance only when the prior phase's exit criteria + guardrail metrics (retention, calibration, unsubscribe/burnout, content-quality, unit economics) are green. Correctness and trust over speed.
