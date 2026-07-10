# Product Requirements Document — SSC Preparation Platform ("Prayaas")

> Codename: **Prayaas** — the "GitHub + LeetCode + Duolingo + Chess.com + Anki + Google Analytics" of SSC preparation.

This directory contains the complete, implementation-ready Product Requirements Document for a next-generation SSC CGL & CHSL preparation platform, with an extensible foundation for CPO, MTS, GD, Stenographer, JE, Selection Post, Tier-II exams, and later Banking, Railways, UPSC, and State PCS.

The PRD is intentionally split into focused documents so that product, design, data, and engineering teams can work in parallel. Read them in order for a full picture, or jump directly to the module you own.

## Document Map

| # | Document | Owners | What's inside |
|---|----------|--------|---------------|
| 00 | [Overview](./00-overview.md) | Product | Vision, mission, principles, target audience, personas, top user journeys, success metrics |
| 01 | [Information Architecture](./01-information-architecture.md) | Product, Design | Navigation model, sitemap, screen inventory, content taxonomy, URL scheme |
| 02 | [Feature Modules](./02-feature-modules.md) | Product | Full module breakdown, feature hierarchy, MoSCoW prioritization, release phasing |
| 03 | [PYQ Library](./03-pyq-library.md) | Content, Data | PYQ data model, ingestion pipeline, per-question metadata, coverage matrix |
| 04 | [Classification & Weightage Engine](./04-classification-weightage.md) | Data, AI | Auto-classification, weightage scoring, trend/heatmap, predictive weightage |
| 05 | [Practice & Test Ecosystem](./05-practice-test-ecosystem.md) | Product, Eng | All practice modes, test types, exam-simulation engine, scoring rules |
| 06 | [AI Mentor & Recommendation](./06-ai-mentor-recommendation.md) | AI | Mentor capabilities, recommendation engine, adaptive learning, prompts/guardrails |
| 07 | [Analytics Platform](./07-analytics-platform.md) | Data | Metric catalog, dashboards, mistake taxonomy, score/AIR prediction |
| 08 | [Revision Engine & Study Planner](./08-revision-planner.md) | AI, Product | Spaced repetition, memory decay model, adaptive planners |
| 09 | [Gamification & Community](./09-gamification-community.md) | Product | XP/levels, quests, leaderboards, forums, study groups, mock battles |
| 10 | [Productivity, Search & Accessibility](./10-productivity-search-accessibility.md) | Product, Design | Focus tools, notebooks, global/OCR/voice search, a11y, i18n |
| 11 | [Notifications, Admin & Monetization](./11-notifications-admin-monetization.md) | Product, Growth | Notification engine, admin panel, subscription/payments, referrals |
| 12 | [Technical Architecture](./12-technical-architecture.md) | Eng | System design, services, data flow, scaling, CI/CD, DR, offline-first |
| 13 | [AI Architecture](./13-ai-architecture.md) | AI, Eng | Model layer, RAG, embeddings, feature store, evaluation, cost controls |
| 14 | [Database Architecture](./14-database-architecture.md) | Eng, Data | Schemas, ERD, storage engines, partitioning, sync/CRDT model |
| 15 | [Security Architecture](./15-security-architecture.md) | Security | AuthN/Z, RBAC, encryption, anti-cheat, privacy, compliance |
| 16 | [Roadmap](./16-roadmap.md) | Product | Phased roadmap, milestones, future AI features, north-star bets |

## How to read this PRD

- **Everything is designed around one question:** *"Will this increase the student's final SSC score?"* If a feature does not save time, improve retention, surface weaknesses, reduce mistakes, or build confidence, it is cut.
- Data models are expressed as language-agnostic entities with field-level detail; SQL/NoSQL choices are justified in doc 14.
- Wherever an algorithm is described (weightage, spaced repetition, adaptive difficulty, score prediction), the intended formula and inputs are specified so engineering can implement without guesswork.
- Prioritization uses **MoSCoW** (Must / Should / Could / Won't-now) and a **phase tag** (P0 MVP, P1, P2, P3).

## Glossary (quick reference)

- **PYQ** — Previous Year Question.
- **Tier** — SSC exam stage (Tier I, Tier II, etc.).
- **Shift** — A specific sitting of an exam on a given date (SSC conducts multiple shifts per day).
- **Weightage** — Relative importance of a topic/chapter based on historical + predicted appearance.
- **Mastery** — A per-topic score (0–100) modeling how well a user has learned a concept.
- **SRS** — Spaced Repetition System.
- **AIR** — All India Rank.
- **Mastery decay** — Modeled loss of retention over time without revision.
