# 10 — Productivity Suite, Search & Accessibility

Three supporting pillars that remove friction: help users **focus** (productivity), **find anything instantly** (search), and **use the product regardless of device, bandwidth, language, or ability** (accessibility/i18n).

---

## Part A — Productivity Suite

Tools that keep study time focused and knowledge organized. All integrate with analytics (focus duration, consistency) and the planner.

### A.1 Focus tools
- **Pomodoro timer** — configurable focus/break cycles; logs focus minutes into analytics; can wrap a practice/study block.
- **Focus mode** — hides gamification/social/notifications; single-task UI.
- **Distraction blocker** — (mobile) optional in-app blocker/reminder during scheduled study blocks; (web) tab-focus nudges. Non-invasive, opt-in.

### A.2 Tracking & reflection
- **Goal tracker** — daily/weekly goals synced with the planner and recommender.
- **Habit tracker** — study habits (e.g., "morning revision") with streaks.
- **Calendar** — unified view of plan tasks, mocks, live tests, revision load, and exam countdown.
- **Study journal + daily reflection** — quick end-of-day notes; feeds Mentor context.
- **Mood tracking** — lightweight daily mood check-in; feeds burnout detection (doc 07) and Mentor tone.

### A.3 Knowledge capture (notebooks)
- **Notes** — free-form + attached to questions/concepts.
- **Flashcards** — user-created or auto-generated from wrong answers/concepts; plug directly into the SRS engine (doc 08).
- **Formula notebook** — personal + curated formula collection, searchable, linked to concepts.
- **Concept notebook** & **Revision notebook** — organized personal knowledge base; exportable (PDF) for offline/print.
- **Bookmarks** — unified across questions, concepts, and formulas.

### A.4 Metrics
- Focus minutes/day, habit adherence, notebook usage vs. retention, reflection completion.

---

## Part B — Search

A global, intelligent search that makes the entire corpus + the user's own data instantly reachable.

### B.1 Search scopes / facets
Search by: question text, keyword, formula, chapter, topic, subject, difficulty, exam, year, shift, tag, concept — plus personal scopes: bookmarked, wrong-questions, notes.

### B.2 Capabilities
- **Instant autocomplete** + typo tolerance + synonyms (e.g., "profit loss" ↔ "profit & loss").
- **Faceted filtering** (combine exam + year + difficulty + tag) with result counts.
- **Bilingual search** (EN/HI), including transliteration (Hinglish queries).
- **AI / natural-language search (P1→P2):** "medium profit-and-loss PYQs from CGL 2019 I got wrong" → parsed into structured filters + semantic retrieval.
- **Voice search (P1):** speech-to-text query.
- **OCR / image search (P2):** snap or upload a question image → OCR + embedding match to find that question or similar PYQs and its solution.
- **Semantic "similar questions"** everywhere via embeddings (doc 13).

### B.3 Architecture (summary; detail in doc 12/13)
- Full-text + faceted index (e.g., OpenSearch/Elasticsearch) for keyword/facet search.
- Vector index for semantic/similar/NL search (doc 13/14).
- Hybrid ranking (keyword score + semantic score + personalization: boost user's exam/weak areas).

### B.4 Metrics
- Search success rate (result clicked / query), zero-result rate, NL-query parse accuracy, OCR match precision.

---

## Part C — Accessibility, Devices & Internationalization

Reach every aspirant — the rural/low-bandwidth persona (doc 00) is a first-class citizen.

### C.1 Devices & platforms
- **Responsive web (PWA)** as the universal client: installable, offline-capable, push-enabled.
- **Native mobile apps** (iOS/Android) for best offline + notifications + performance (P1; PWA covers P0 mobile).
- **Tablet & desktop** optimized layouts (doc 01).

### C.2 Offline & low-bandwidth (see doc 12 for architecture)
- **Offline mode:** download PYQ sets, tests, SRS queue, and notebooks; attempt fully offline; sync on reconnect.
- **Low-internet mode:** text-first, defer images/videos, aggressive caching, smaller payloads.
- **Data-saver:** on-demand media, adjustable video quality, prefetch only on Wi-Fi.

### C.3 Themes & readability
- **Dark / light / high-contrast** themes; **font scaling**; dyslexia-friendly font option.
- Respect OS-level reduced-motion and text-size settings.

### C.4 Accessibility (a11y) standards
- Target **WCAG 2.1 AA**: keyboard navigation, screen-reader labels, sufficient contrast, focus states, semantic markup.
- Exam-sim runtime remains accessible (keyboard palette navigation, readable timer).

### C.5 Internationalization (i18n)
- **EN + HI at launch**, full UI + content translations; architecture supports adding regional languages (Bengali, Tamil, Telugu, Marathi, etc.) via the translation layer (doc 03 stores per-question translations).
- Locale-aware number/date formatting; RTL-ready framework even though launch languages are LTR.

### C.6 Metrics
- Offline-session share, low-data-mode adoption, a11y audit pass rate, language-split usage, PWA install rate.

## Score-impact justification
Productivity tools convert available hours into *focused* hours and organized recall (time saved + retention). Search removes friction from finding the right practice/solution (time saved). Accessibility/offline/i18n ensure the highest-need aspirants can actually use the platform at all — the largest reach-to-impact lever.
