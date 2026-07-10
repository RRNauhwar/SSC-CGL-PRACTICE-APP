# 11 — Notification Engine, Admin Panel & Monetization

Three operational pillars: keep users **consistent** (notifications), keep content + platform **healthy** (admin), and keep the business **sustainable yet accessible** (monetization).

---

## Part A — Notification Engine

Timely, personalized nudges that drive consistency without becoming spam. Every notification must be **useful, relevant, and respectful of attention.**

### A.1 Notification types
- Daily goals ready; **revision due** (SRS); **weak-chapter alert**; scheduled **mock reminder**; **streak reminder** (before it breaks); **exam countdown** milestones; **performance alerts** (e.g., accuracy drop in a section); **study suggestions** & **AI coaching** cards; **achievement unlocks**; live-test start; community replies (opt-in).

### A.2 Channels & delivery
- **In-app inbox** (always), **push** (PWA/native), **email** (digests + important), optional **WhatsApp/SMS** (P2, transactional/opt-in per regulations).
- **Priority tiers:** critical (exam/live-test), high (streak-at-risk, revision due), normal (suggestions), low (social) — routed to appropriate channel.

### A.3 Intelligence & controls
- **Best-time delivery:** send around the user's high-performance / usual-study time (from analytics, doc 07).
- **Frequency capping + bundling:** avoid notification fatigue; bundle related nudges into one card.
- **Quiet hours** + full granular preferences per type/channel; easy global mute.
- **Personalized copy:** generated from the user's actual state ("2 revisions + 1 weak topic due — 15 min will do it").
- **A/B + guardrails:** optimize open→action, but a guardrail on unsubscribe/mute rate prevents over-sending.

### A.4 Architecture (summary; doc 12)
- Event-driven: domain events → notification service → rules/ML for eligibility + timing → channel adapters → delivery + tracking (sent/delivered/opened/actioned).

### A.5 Metrics
- Action rate per type, streak-save rate, revision-completion lift, mute/unsubscribe rate (guardrail), notification-attributed retention.

---

## Part B — Admin Panel

A separate, secure app (doc 01, doc 15) for content, moderation, ops, and business. Role-gated (RBAC, doc 15).

### B.1 Modules
- **Question management** — CRUD, bulk import, versioning, media, translations (doc 03).
- **Question approval workflow** — ingestion review queue: verify answer key, classification, solution quality; approve/reject/edit; low-AI-confidence + flagged repeats prioritized; SLA tracked.
- **Content moderation** — community reports queue, toxicity/spam review, ban/mute tools, reputation adjustments.
- **Coverage dashboard** — PYQ completeness grid (doc 03) with gap highlighting.
- **Analytics dashboard** — platform KPIs: usage, retention, funnel, content quality, prediction calibration, AI cost.
- **User management** — search, view, support actions, impersonate-for-support (audited), account/data controls (GDPR/DPDP requests).
- **Subscriptions & payments** — plans, transactions, refunds, dunning, revenue reports.
- **Coupon management** — create/track discount + scholarship codes.
- **Role management (RBAC)** — admin, content-editor, reviewer, moderator, support, finance, read-only analyst.
- **Audit logs** — every privileged action logged (who/what/when/before-after).
- **System health** — service status, queue depths, error rates, ingestion pipeline status.
- **AI monitoring** — model usage, cost, latency, classification-accuracy vs. golden set, prediction calibration, guardrail/safety incidents, drift alerts.

### B.2 Workflows
- **Ingestion → review → publish** (doc 03) with assignment, dual-review for low-confidence, and re-open on error reports.
- **Moderation** with escalation tiers and appeal handling.

### B.3 Metrics
- Review throughput + SLA, error-report resolution time, moderation SLA, admin action auditability = 100%.

---

## Part C — Monetization

Sustainable business with a **strong free tier** (trust + reach + virality) and clear premium value. Never paywall core exam-truth (basic PYQ access + baseline analytics stay free).

### C.1 Tiers
- **Free** — substantial: large PYQ access, basic practice, limited mocks/month, core analytics, SRS basics, EN/HI, offline basics. This is the trust + acquisition engine.
- **Premium** (monthly/quarterly/annual) — unlimited mocks + AI-generated tests, full analytics + prediction, full AI Mentor chat, advanced planner, unlimited SRS/notebooks, priority live tests, ad-free.
- **Lifetime** — one-time plan (until target exam or lifetime, defined clearly).
- **Institution plan** — cohort seats, assignment tools, admin/cohort analytics, white-label options.

### C.2 Partner & growth
- **Coaching partner dashboard** — assign tests, track batches/cohorts, branded experience, revenue share/licensing.
- **Referral program** — both sides get premium days/coins; drives K-factor.
- **Affiliate system** (P2) — creators/educators earn on conversions.
- **Scholarships** — free/discounted premium for financially-constrained aspirants (funded partly by donated coins + CSR), applied via coupon/scholarship flow.
- **Coupons** — flexible discounts, campaign tracking.

### C.3 Payments & billing
- Multiple methods (UPI, cards, netbanking, wallets), regional pricing, GST invoicing, subscription lifecycle (trials, renewals, dunning, refunds), fraud checks.

### C.4 Subscription analytics
- MRR/ARR, conversion by cohort/source, churn + reasons, LTV/CAC, trial→paid, referral/affiliate performance, price-experiment results.

### C.5 Ethical monetization guardrails
- Free tier must remain genuinely useful (no crippling).
- Transparent pricing, easy cancellation, no dark patterns, honest "premium" value claims.
- Predictions/marketing never guarantee selection.

## Score-impact justification
Notifications convert intent into consistent daily action (the top real-world failure mode). Admin keeps content correct and trustworthy — the foundation of every score-relevant feature. Monetization's free tier maximizes reach to the aspirants who need it most, while premium funds the AI/analytics that drive score gains.
