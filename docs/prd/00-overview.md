# 00 — Overview: Vision, Mission, Audience & Journeys

## 1. Vision

Become the single, indispensable destination for every SSC aspirant in India — a platform that combines the **largest organized Previous Year Question (PYQ) database ever built** with **AI coaching, deep analytics, adaptive learning, and a world-class, addictive-yet-focused experience** that measurably increases each student's final SSC score.

We are building the *"GitHub + LeetCode + Duolingo + Chess.com + Anki + Google Analytics"* of SSC preparation:

- **GitHub** — a serious, data-rich home base where progress is visible, versioned, and credible.
- **LeetCode** — structured, difficulty-tagged problem practice with success rates and discussion.
- **Duolingo** — habit-forming daily practice, streaks, and gentle motivation.
- **Chess.com** — competitive play, ranks, and post-game analysis that teaches.
- **Anki** — scientifically-grounded spaced repetition for durable memory.
- **Google Analytics** — a control room of insight into one's own performance.

## 2. Mission

Give every aspirant — regardless of city, coaching access, income, or device — an AI mentor and analytics engine more useful than a private tutor, so that preparation is **efficient, personalized, evidence-based, and confidence-building**.

## 3. Design Philosophy — the North-Star Filter

Every feature must answer **"Will this increase the student's final SSC score?"** A feature qualifies only if it does at least one of:

1. **Saves time** (faster practice, faster revision, less friction).
2. **Improves retention** (spaced repetition, active recall, interleaving).
3. **Identifies weaknesses** (analytics, mistake taxonomy, weak-topic detection).
4. **Reduces mistakes** (careless/calculation/reading/concept error correction).
5. **Increases confidence** (realistic simulation, predicted score, visible progress).

If a proposed feature does none of these, it is removed. This filter is repeated in every module doc.

### Product tenets

- **Exam-truth first.** Interface, timing, negative marking, and question palette must mirror the real SSC CBT exactly.
- **Offline-first.** The core loop (practice, tests, revision) works with zero/low connectivity and syncs later.
- **Fast & premium.** Sub-second interactions; clean, uncluttered, beautiful UI exceeding Notion/Linear/Duolingo standards.
- **Evidence over vanity.** Every number shown is actionable; no metric exists for decoration.
- **Personalized by default.** The platform adapts to each learner's pace, weaknesses, exam date, and style.
- **Trust & fairness.** Transparent AI, honest score predictions with confidence bands, strong anti-cheat, and privacy by design.

## 4. Target Audience

- **Primary:** SSC CGL and SSC CHSL aspirants (ages ~18–30), preparing for Tier I and Tier II.
- **Secondary (extensible):** SSC CPO, MTS, GD, Stenographer, JE, Selection Post aspirants.
- **Future:** Banking (IBPS/SBI), Railways (RRB), UPSC, State PCS aspirants.
- **Institutional:** Coaching institutes and schools wanting a white-labelable practice + analytics layer.

### Audience characteristics that shape design

- Predominantly **mobile-first**, often on **budget Android devices** and **intermittent data**.
- Multilingual: **English + Hindi** at launch, with regional-language roadmap.
- Highly **price-sensitive**; a strong free tier is essential for trust and virality.
- Motivated but prone to **burnout, inconsistency, and misallocated study time** — the platform's core value is fixing exactly this.

## 5. User Personas

### Persona A — "Focused Fresher" (Ankit, 21)
- Final-year graduate, first serious CGL attempt, 8–10 months to exam.
- Studies 4–6 hrs/day, has coaching notes but no clear plan.
- **Needs:** a structured 180-day plan, weak-area detection, exam-realistic mocks, motivation to stay consistent.
- **Success:** raises predicted score from 110 to 150+ and clears Tier I.

### Persona B — "Working Repeater" (Priya, 26)
- Employed, second attempt after narrowly missing cutoff, ~2 hrs/day, mostly evenings + commute.
- Knows her weak areas vaguely; limited time is the constraint.
- **Needs:** high-efficiency practice, spaced revision that fits a tight schedule, offline commute mode, targeted weak-topic drills.
- **Success:** maximizes score-per-hour; consistent revision streak; converts near-miss into selection.

### Persona C — "Rural Aspirant, Low Bandwidth" (Ravi, 23)
- Small-town, budget phone, expensive/patchy data, no coaching access.
- **Needs:** offline-first PYQ practice, downloadable tests, low-data mode, Hindi UI, free access to substantial content.
- **Success:** gets coaching-grade guidance and PYQ coverage without a coaching institute.

### Persona D — "Analytics-Driven Topper Aspirant" (Sneha, 24)
- Strong student aiming for top ranks and best posts; treats prep like a data problem.
- **Needs:** deep analytics, percentile/AIR prediction, error taxonomy, sectional time optimization, competitive mock battles.
- **Success:** optimizes accuracy vs. attempts, minimizes negative marking, lands top AIR.

### Persona E — "Content/Ops Admin" (internal)
- Manages the PYQ pipeline, question approvals, moderation, and platform health.
- **Needs:** efficient ingestion + review workflow, quality dashboards, moderation tools, AI-assist for tagging/dedup.

### Persona F — "Coaching Partner" (institutional)
- Runs a coaching center; wants to assign tests, track cohorts, and brand the experience.
- **Needs:** cohort analytics, assignment tools, batch management, revenue share/licensing.

## 6. Primary User Journeys

### J1 — Onboarding → First Personalized Plan (new user)
1. Sign up (phone/OTP, Google, email) → pick target exam(s) + tier + **exam date**.
2. Choose language, daily time budget, and current level (self-rated + optional 15-min diagnostic).
3. Diagnostic test (adaptive, ~20 Q across subjects) → generates **baseline mastery map**.
4. AI Mentor presents: baseline predicted score, top 3 weak areas, and a recommended plan length (e.g., 120 days).
5. User accepts plan → lands on **Today** screen with the day's tasks. **Time-to-first-value < 5 minutes.**

### J2 — Daily Study Loop (retained user)
1. Open app → **Today** screen shows: due revisions (SRS), planned practice/tests, daily challenge, streak status.
2. Complete a weak-topic practice set → instant per-question analytics and mistake tagging.
3. SRS queue surfaces items due today; user clears them → mastery + retention updated.
4. Daily challenge + streak reinforce the habit; AI Mentor gives one concrete tip for tomorrow.

### J3 — Full Mock Test → Deep Review
1. Start a Grand/Full Mock in **exact SSC CBT interface** (palette, timer, negative marking, language switch).
2. Pause/resume supported; submit → immediate score, percentile, rank, section breakdown.
3. **Review screen:** every question with solution(s), video, time spent vs. average, why it was missed (auto-classified error type).
4. Weak items auto-added to SRS + "Wrong Question Practice"; plan auto-adjusts; predicted score updates.

### J4 — PYQ Deep Dive (targeted)
1. Search/browse PYQs by exam → year → shift → subject → chapter → topic → difficulty.
2. See weightage/heatmap for the chapter (last 1/3/5/10/15/20 years) + predicted future weightage.
3. Practice "PYQ Only" for the chapter; bookmark, add notes, view similar PYQs and community discussion.

### J5 — Weekly Reflection & Re-plan
1. Weekly digest: progress vs. plan, accuracy/speed trends, consistency, mistake trends, mastery movement.
2. AI Mentor proposes plan adjustments (rebalance toward weak/high-weightage areas, add revision).
3. User accepts → plan and SRS queues rebalance for the coming week.

### J6 — Missed-Day Recovery (resilience)
1. User misses 2 days → plan detects backlog, **redistributes tasks** without overloading, protects streak-recovery, and nudges gently (no guilt-tripping).

### J7 — Competitive & Social
1. Join a mock battle or challenge a friend on a topic set → head-to-head with post-match analysis.
2. Leaderboards (global/friends/cohort), study groups, and discussion drive accountability.

## 7. Success Metrics (how we know it works)

### North-star
- **Verified score improvement:** median increase in predicted score from baseline→exam for active users; and self-reported/verified selection rate.

### Learning-efficacy metrics
- Mastery growth velocity (mastery points/week), retention rate on SRS reviews, weak-topic conversion rate.
- Mock predicted-score vs. actual-score calibration error (target within ±8 marks for engaged users).

### Engagement metrics
- D1/D7/D30 retention, DAU/MAU ratio, streak length distribution, avg. focused study minutes/day.
- Daily challenge completion, SRS-due completion rate.

### Growth & monetization
- Free→Premium conversion, referral coefficient (K-factor), LTV/CAC, institutional seats.

### Quality & trust
- PYQ coverage completeness, question error-report rate, moderation SLA, AI explanation helpfulness rating, prediction calibration.

## 8. Non-Goals (for now)

- Live human-tutor marketplace (deferred; AI mentor is primary).
- Full LMS/course-video production studio (we curate/integrate, not primarily produce, at MVP).
- Non-SSC exams at launch (architecture is exam-agnostic, but content focus is CGL/CHSL first).
