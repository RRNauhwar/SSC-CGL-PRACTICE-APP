# 02 — Feature Modules & Prioritization

The complete module breakdown with feature hierarchy, prioritization (MoSCoW), and phase tags (P0 MVP → P3). Each module has its own deep-dive doc; this is the master map and the source of truth for scope.

Legend — **MoSCoW:** M=Must, S=Should, C=Could, W=Won't-now. **Phase:** P0 (MVP), P1, P2, P3.

## Module Overview

| # | Module | Core value (score-impact filter) | Deep dive |
|---|--------|----------------------------------|-----------|
| M1 | PYQ Library | Largest organized PYQ base = practice on real exam-truth | doc 03 |
| M2 | Classification & Weightage | Study the *right* things first | doc 04 |
| M3 | Practice Engine | High-efficiency, targeted practice | doc 05 |
| M4 | Test Ecosystem | Realistic simulation + ranks | doc 05 |
| M5 | AI Mentor | Personalized coaching > human tutor | doc 06 |
| M6 | Recommendation Engine | Always know the best next action | doc 06 |
| M7 | Analytics Platform | See weaknesses; reduce mistakes | doc 07 |
| M8 | Revision Engine (SRS) | Durable retention | doc 08 |
| M9 | Study Planner | Confidence via a plan that adapts | doc 08 |
| M10 | Gamification | Consistency & motivation | doc 09 |
| M11 | Community | Accountability & peer learning | doc 09 |
| M12 | Productivity Suite | Focus + notes = time saved | doc 10 |
| M13 | Search | Find anything instantly | doc 10 |
| M14 | Accessibility & i18n | Reach every aspirant | doc 10 |
| M15 | Notification Engine | Timely nudges = consistency | doc 11 |
| M16 | Admin Panel | Content quality + ops | doc 11 |
| M17 | Monetization | Sustainable + accessible | doc 11 |
| M18 | Platform/Infra | Fast, offline-first, secure | docs 12–15 |

---

## M1 — PYQ Library
- **M1.1** Multi-exam PYQ store (CGL, CHSL first; CPO/MTS/GD/JE/Steno/Selection Post schema-ready) — **M / P0**
- **M1.2** 20+ years, every shift, every language coverage matrix — **M / P0→P2** (backfill continuous)
- **M1.3** Rich per-question metadata (solution, alt-solution, video, difficulty, timing, success rate, tricks, common mistakes, formulas) — **M / P0**
- **M1.4** Bookmark, personal notes, similar-PYQ links, community discussion — **M / P0 (bookmark/notes), P1 (similar/discussion)**
- **M1.5** AI explanation + "explain differently" — **S / P1**
- **M1.6** Question quality/error reporting + versioning — **M / P0**

## M2 — Classification & Weightage Engine
- **M2.1** Auto-classification (subject→concept, difficulty, tags, mistake-type) — **M / P0 (assisted), P1 (auto)**
- **M2.2** Weightage per chapter across 1/3/5/10/15/20 yrs — **M / P0**
- **M2.3** Trend graphs + heatmaps — **M / P0**
- **M2.4** Probability of appearance + importance score — **S / P1**
- **M2.5** Predictive future weightage (ML) — **S / P1→P2**

## M3 — Practice Engine (all modes)
- **M3.1** Chapter/topic/subtopic/mixed practice — **M / P0**
- **M3.2** Weak-topic, wrong-question, bookmarked, revision practice — **M / P0**
- **M3.3** Adaptive practice (difficulty adjusts live) — **M / P1**
- **M3.4** Challenges: time/accuracy/speed/daily/random — **S / P0 (daily), P1 (rest)**
- **M3.5** PYQ-only, latest/oldest PYQ, exam-pattern practice — **M / P0**
- **M3.6** Custom practice generator (filters) — **S / P1**
- **M3.7** AI-generated practice + formula/concept/difficulty-based — **S / P1→P2**

## M4 — Test Ecosystem
- **M4.1** Exam-simulation runtime (exact SSC CBT UI: palette, timer, negative marking, language switch, pause/resume) — **M / P0**
- **M4.2** Test types: mini/chapter/subject/sectional/combined/PYP/topic/daily/weekly/monthly/mock/grand/marathon — **M / P0 (core), P1 (marathon/monthly)**
- **M4.3** Live tests (scheduled, synchronized) — **S / P1**
- **M4.4** Adaptive tests + unlimited AI-generated tests — **S / P2**
- **M4.5** Post-test: score, percentile, rank, section analytics, solutions, review — **M / P0**

## M5 — AI Mentor
- **M5.1** Daily recommendations, weakness/strength analysis, chapter prioritization — **M / P0 (rules), P1 (LLM)**
- **M5.2** Schedule generation + revision reminders + motivation — **M / P0**
- **M5.3** Score prediction + exam strategy + time management advice — **S / P1**
- **M5.4** Concept explanations, alternative methods, personal tutoring (chat) — **S / P1**
- **M5.5** Learning-style adaptation, stress/confidence support — **C / P2**

## M6 — Recommendation Engine
- **M6.1** Next-best-action (questions, mocks, revision, videos, concepts) — **M / P0 (heuristic), P1 (ML)**
- **M6.2** Daily goals + study-plan + rest-period recommendations — **M / P0**
- **M6.3** Books/formula-sheets/resource suggestions — **C / P2**

## M7 — Analytics Platform
- **M7.1** Progress (daily/weekly/monthly/yearly), accuracy, speed, avg time — **M / P0**
- **M7.2** Mistake taxonomy (careless/calculation/reading/concept/guess) + trends — **M / P0**
- **M7.3** Chapter mastery, retention curves, consistency heatmaps — **M / P0 (mastery), P1 (retention curves)**
- **M7.4** Expected score, percentile & AIR prediction — **S / P1**
- **M7.5** Advanced: learning velocity, time-of-day performance, burnout, focus duration, device usage — **C / P1→P2**

## M8 — Smart Revision Engine (SRS)
- **M8.1** Spaced intervals (1/3/7/15/30/60/90) + adaptive intervals — **M / P0**
- **M8.2** AI-generated revision queues + forgotten-concept detection — **M / P0 (queue), P1 (decay model)**
- **M8.3** Memory-decay prediction, revision calendar + streaks — **S / P1**

## M9 — Study Planner
- **M9.1** Preset plans (30/60/90/120/180/365) + custom — **M / P0**
- **M9.2** Dynamic re-plan on missed days / backlog redistribution — **M / P0**
- **M9.3** Plan ↔ weightage ↔ weakness alignment — **M / P1**

## M10 — Gamification
- **M10.1** XP, levels, streaks, coins — **M / P0**
- **M10.2** Achievements, badges, trophies, certificates — **S / P0 (badges), P1 (certs)**
- **M10.3** Daily quests, weekly/monthly missions, season pass, rank progression — **S / P1**
- **M10.4** Leaderboards + challenge friends — **S / P1**

## M11 — Community
- **M11.1** Forums, question comments, solution sharing — **S / P1**
- **M11.2** Study groups, mentorship, friends/followers — **C / P1→P2**
- **M11.3** Competitive challenges, mock battles, peer comparison — **S / P1**

## M12 — Productivity Suite
- Pomodoro, focus mode, distraction blocker, goal/habit tracker, calendar, journal, mood, notes, flashcards, formula/concept/revision notebooks — **S/C / P1** (notes+flashcards+Pomodoro first)

## M13 — Search
- Global intelligent search (question/keyword/formula/chapter/topic/difficulty/exam/year/shift/tag/concept/bookmarks/wrong), autocomplete — **M / P0**
- Voice search, OCR/image search, AI/natural-language search — **S / P1→P2**

## M14 — Accessibility & i18n
- Dark/light, offline, PWA, low-internet mode, high contrast, font scaling, multi-language (EN/HI first) — **M / P0 (theme, offline, EN/HI), S / P1 (a11y refinements, more languages)**

## M15 — Notification Engine
- Daily goals, revision, weak-chapter, mock, streak, exam countdown, performance alerts, coaching, achievement unlocks — multi-channel (push/in-app/email), quiet hours — **M / P0 (core push+in-app), S / P1**

## M16 — Admin Panel
- Question management + approval workflow, content moderation, analytics, user management, reports, subscriptions/payments, coupons, roles, audit logs, system health, AI monitoring — **M / P0 (ingestion+approval+users), S / P1 (rest)**

## M17 — Monetization
- Free tier, premium, lifetime, institution plan, coaching-partner dashboard, referral, affiliate, scholarships, coupons, subscription analytics — **M / P0 (free+premium+coupons), S / P1, C / P2 (affiliate/partner)**

## M18 — Platform / Infra
- Frontend, backend, DB, caching, search, storage, auth, analytics pipeline, recsys, AI layer, notifications, logging, monitoring, CDN, queues, workers, scalability, security, backup/DR, CI/CD, API gateway, rate limiting, encryption, RBAC — **M / P0 (foundational subset), scaling P1→P2** (docs 12–15)

---

## Release Phasing Summary

- **P0 (MVP):** PYQ library (CGL+CHSL core years) with metadata + weightage; practice + wrong/weak/bookmark modes; exam-sim mock engine + PYP + review/analytics; SRS queue; presets + adaptive planner; rules-based Mentor + heuristic recommendations; core analytics + mistake taxonomy; streak/XP; global search; EN/HI + dark mode + offline core; core notifications; admin ingestion/approval; free+premium+coupons.
- **P1:** Adaptive practice/tests groundwork, AI explanations, ML weightage + prediction, retention curves, gamification depth (quests/leaderboards/season pass), community (forums/battles), productivity suite, voice/OCR search, live tests, notebooks, coaching partner basics.
- **P2:** Unlimited AI-generated tests, advanced analytics (burnout/velocity/time-of-day), LLM voice tutor, image-solution recognition, deeper personalization, affiliate/partner ecosystem, more languages, more exams.
- **P3:** Full autonomous coaching agent, AI interview coach, advanced anti-cheat/proctoring, cross-exam expansion (Banking/Railways/UPSC/State PCS).
