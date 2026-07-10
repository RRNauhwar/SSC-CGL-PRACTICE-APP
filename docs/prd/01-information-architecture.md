# 01 — Information Architecture

Defines how the product is structured and navigated: the mental model, navigation shell, sitemap, screen inventory, content taxonomy, and URL scheme. Design goal: **zero clutter, one primary action per screen, everything findable in ≤ 2 taps.**

## 1. Mental Model

The product has three "surfaces" the user moves between:

1. **Do** — where studying happens (Today, Practice, Tests, Revision).
2. **Know** — where content lives (PYQ Library, Chapters/Weightage, Notebooks, Search).
3. **Grow** — where progress + motivation live (Analytics, Planner, Gamification, Community, AI Mentor).

The **AI Mentor** is an omnipresent layer (a persistent, dismissible assistant) accessible from any screen, not a buried tab.

## 2. Navigation Shell

### Mobile (primary) — bottom tab bar (5 items)
1. **Today** (home / daily loop)
2. **Practice** (modes + PYQ entry)
3. **Tests** (mock/test ecosystem)
4. **Insights** (analytics + planner)
5. **Profile** (gamification, settings, notebooks, community entry)

- **Floating Mentor button** (bottom-right, above tab bar) → opens AI Mentor chat/coach.
- **Global search** accessible from a top bar on Today/Practice/Library.

### Desktop / tablet — left sidebar + top bar
- Left sidebar mirrors the five sections plus expandable sub-nav (Library, Community, Notebooks, Settings).
- Top bar: global search, streak/XP, notifications bell, profile menu, Mentor toggle.
- Right rail (contextual): shows relevant analytics or Mentor suggestions on wide screens.

### Admin — separate app shell (see doc 11)
- Distinct URL namespace and layout; not mixed with learner UI.

## 3. Sitemap

```
/                         Landing (marketing, logged-out) / redirect to /today if logged in
/auth                     Sign in / sign up / OTP / reset
/onboarding               Exam selection, diagnostic, plan setup

/today                    Daily dashboard (the home loop)
  /today/challenge        Daily challenge

/practice                 Practice hub (all modes)
  /practice/chapter/:id   Chapter/topic practice
  /practice/adaptive      Adaptive practice session
  /practice/weak          Weak-topic practice
  /practice/wrong         Wrong-question practice
  /practice/bookmarks     Bookmarked questions
  /practice/custom        Custom practice generator
  /practice/ai            AI-generated practice
  /practice/session/:id   Live practice session runtime
  /practice/session/:id/review  Session review

/tests                    Test ecosystem hub
  /tests/mock             Mocks / grand / marathon
  /tests/pyp              Previous year papers
  /tests/sectional        Sectional / subject / topic tests
  /tests/live             Live tests (scheduled)
  /tests/daily            Daily/weekly/monthly tests
  /tests/attempt/:id      Test runtime (exam-simulation engine)
  /tests/attempt/:id/review  Test review + analytics

/library                  PYQ + content library
  /library/exams/:exam    Exam landing (CGL, CHSL, ...)
  /library/subjects/:id   Subject → chapters
  /library/chapters/:id   Chapter (weightage, heatmap, PYQs, concepts)
  /library/questions/:id  Single question detail
  /library/formulas       Formula reference
  /library/concepts       Concept explanations

/revision                 Smart revision engine
  /revision/queue         Today's SRS queue
  /revision/calendar      Revision calendar
  /revision/decks         Flashcard decks

/insights                 Analytics platform
  /insights/overview      Summary dashboard
  /insights/accuracy      Accuracy & speed
  /insights/mistakes      Mistake taxonomy
  /insights/mastery       Mastery & retention
  /insights/prediction    Score / percentile / AIR prediction
  /insights/consistency   Streaks, heatmaps, focus

/planner                  Study planner
  /planner/plan/:id       Active plan
  /planner/calendar       Plan calendar

/mentor                   AI Mentor full view (chat + coaching feed)

/community                Community hub
  /community/forums       Forums / discussions
  /community/groups       Study groups
  /community/battles      Mock battles / challenges
  /community/leaderboards Leaderboards
  /community/u/:handle    Public profile

/notebooks                Notes / flashcards / formula & concept notebooks
/productivity             Pomodoro, focus mode, habit tracker, journal, mood

/profile                  User profile + gamification
  /profile/achievements   Badges, trophies, season pass
  /profile/settings       Account, language, theme, notifications, privacy
  /profile/subscription   Plan, billing, referrals

/search                   Global search results

/admin/*                  Admin panel (separate shell; see doc 11)
```

## 4. Screen Inventory (P0 = MVP)

| Area | Screens | Phase |
|------|---------|-------|
| Auth/Onboarding | Sign-in, OTP, exam select, diagnostic, plan setup | P0 |
| Today | Daily dashboard, daily challenge | P0 |
| Practice | Practice hub, session runtime, session review, weak/wrong/bookmark modes | P0; adaptive/AI/custom P1 |
| Tests | Test hub, PYP list, mock runtime (exam-sim), review + analytics | P0; live/marathon P1 |
| Library | Exam→subject→chapter→question, weightage/heatmap, formulas/concepts | P0 (browse+weightage); predicted weightage P1 |
| Revision | SRS queue, calendar, decks | P0 (queue); calendar/decks P1 |
| Insights | Overview, accuracy/speed, mistakes, mastery, prediction, consistency | P0 (overview+accuracy+mistakes); prediction P1 |
| Planner | Plan view, calendar, auto re-plan | P0 (plan+re-plan) |
| Mentor | Chat + coaching feed | P0 (rules+LLM-lite); full agent P1/P2 |
| Community | Forums, groups, battles, leaderboards, profiles | P1 |
| Notebooks/Productivity | Notes, flashcards, Pomodoro, habit, journal, mood | P1 |
| Profile/Gamification | Profile, achievements, season pass, settings, subscription | P0 (profile+streak+XP); season pass P1 |
| Admin | Ingestion, review, moderation, analytics, users, billing | P0 (ingestion+review); rest P1 |

## 5. Content Taxonomy

The canonical hierarchy used everywhere (search, weightage, analytics, planning):

```
Exam            (SSC CGL, SSC CHSL, CPO, MTS, GD, JE, Stenographer, Selection Post)
 └─ Tier        (Tier I, Tier II, ...)
     └─ Section (e.g., Quantitative Aptitude, Reasoning, English, General Awareness)
         └─ Subject
             └─ Chapter
                 └─ Subchapter
                     └─ Topic
                         └─ Subtopic
                             └─ Concept  (atomic learnable unit; tied to SRS + mastery)
```

- **Concept** is the atomic unit for mastery + spaced repetition. Every question maps to ≥1 concept.
- **Tags** are cross-cutting labels (e.g., `calculation-heavy`, `shortcut-friendly`, `statement-based`, `memory-based`) — see doc 04.
- A shared **taxonomy service** owns this tree so content, analytics, and AI agree on identifiers.

## 6. URL & Deep-Linking Scheme

- Stable, human-readable slugs: `/library/chapters/quant-time-and-work`.
- All entities addressable by ID for deep links + notifications: `sscprep://question/:id`, `sscprep://test/attempt/:id`.
- Shareable public links for questions, chapters, and profiles (respecting privacy settings).
- Deep links resume state (e.g., a notification "3 revisions due" opens `/revision/queue`).

## 7. Empty, Loading & Error States (global rules)

- **Loading:** skeleton screens, never spinners-on-blank; optimistic UI for answer submission.
- **Empty:** every empty state includes a single clear CTA (e.g., "No weak topics yet — take a diagnostic").
- **Offline:** a persistent, non-alarming banner + clear indication of what's cached vs. syncing (see doc 12).
- **Error:** human-readable message + retry + "report" that files a diagnostic bundle.

## 8. IA Principles (enforced in design review)

- One primary action per screen; secondary actions are visually subordinate.
- Depth ≤ 3 for any learning action from Today.
- Consistent object pages: every "chapter", "question", "test" page has the same layout grammar.
- Search is always reachable; the Mentor is always one tap away.
