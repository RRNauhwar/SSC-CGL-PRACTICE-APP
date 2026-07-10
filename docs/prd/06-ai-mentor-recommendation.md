# 06 — AI Mentor & Recommendation Engine

The AI layer that makes the platform feel like a personal coach who knows every question the student has ever attempted. Two cooperating systems: the **AI Mentor** (conversational + proactive coaching) and the **Recommendation Engine** (the always-on "next best action" brain). Implementation of the model stack lives in doc 13; this doc defines behavior, capabilities, inputs/outputs, and guardrails.

---

## Part A — AI Mentor

### A.1 Capabilities

1. **Daily study recommendations** — the day's prioritized tasks with rationale ("You did 12 Quant questions yesterday; Reasoning mastery dropped, and syllogisms are high-weightage — start there").
2. **Weakness & strength analysis** — surfaces lowest-mastery concepts, error patterns, and time sinks; also reinforces strengths so they don't decay.
3. **Chapter prioritization** — ranks what to study using `weightage × weakness × difficulty × exam-proximity`.
4. **Schedule generation & revision reminders** — builds/adjusts the plan (doc 08); reminds about due SRS items.
5. **Score prediction & exam strategy** — predicted score with confidence band (doc 07), plus attempt-order/time-allocation strategy per section.
6. **Concept explanations & alternative methods** — explains any concept/question at the user's level; offers shortcut vs. conventional approaches; "explain differently".
7. **Personal tutoring (chat)** — grounded Q&A on concepts, questions, and the user's own performance data.
8. **Time management & confidence/stress support** — practical pacing advice; supportive, non-judgmental nudges; burnout-aware (doc 07); learning-style adaptation.
9. **Motivation** — context-aware encouragement tied to real progress (never empty hype).

### A.2 Interaction model

- **Proactive coaching feed** on Today: 1–3 concise, actionable cards/day (not a wall of text). Each card = insight + one CTA.
- **Conversational chat** (`/mentor`, floating button): grounded in the user's data + the PYQ/concept corpus via RAG (doc 13).
- **Contextual invocation:** "Ask Mentor" on any question/chapter/analytics screen passes that context in.
- **Tone:** calm, credible, concise, encouraging. Uses the user's language (EN/HI). No guilt-tripping; framed around progress.

### A.3 Inputs (the Mentor's context)

- Mastery map per concept; recent attempts (correctness, time, error types); SRS state; streak/consistency; plan + backlog; exam date; weightage/predicted-weightage; predicted score; session fatigue signals; learning-style signals; user goals/preferences.

### A.4 Grounding & guardrails

- **Always grounded:** performance claims come from the analytics store; content answers are retrieved from the verified corpus (RAG). The model must **cite the concept/question** it used.
- **No hallucinated facts:** for GA/factual content, answer only from verified sources; if unknown, say so and point to a resource.
- **Honesty about predictions:** always show confidence bands and "estimate, not guarantee".
- **Safety:** if a user expresses self-harm/severe distress, respond with brief empathy + direct them to emergency services (India: 112) and a mental-health helpline, then gently return to support — do not attempt clinical counseling.
- **Privacy:** the Mentor uses the user's own data only; never leaks other users' data. Explainable: every recommendation can show "why am I seeing this?".
- **Cost/latency controls:** rules-based layer handles the majority of proactive cards; LLM used for explanation/chat/complex reasoning (doc 13). Cached explanations reused.

### A.5 Phasing

- **P0:** rules/heuristics-driven proactive cards + prioritization + reminders; templated explanations.
- **P1:** LLM chat tutor + RAG explanations + score-strategy narratives.
- **P2:** learning-style adaptation, stress/confidence modeling, voice tutor.
- **P3:** autonomous coaching agent that plans, schedules, and adapts end-to-end with user oversight; AI interview coach.

---

## Part B — Recommendation Engine

### B.1 What it recommends

Questions, question sets, videos, concepts, mocks, revision items, daily goals, study-plan adjustments, books/formula-sheets/resources, practice sessions, and **rest periods** (recovery is part of performance).

### B.2 Signals (inputs)

Accuracy, speed, per-concept mastery, weaknesses, exam date/proximity, consistency/streak, full learning history, retention (SRS), time available today, time-of-day performance, fatigue/burnout signals, and weightage/predicted-weightage.

### B.3 Method

- **Candidate generation → scoring → constraints → diversification.**
- **Score for a candidate action `a`:**
  ```
  Utility(a) = expected_score_gain(a) / expected_time_cost(a)
             × urgency(a)            // exam proximity, SRS due-ness, decay risk
             × novelty(a)            // avoid over-repetition; encourage interleaving
             × confidence(a)         // data sufficiency
  ```
  - `expected_score_gain` ≈ `weightage(concept) × (1 − mastery) × p(improvement | practice)`.
  - `urgency` spikes for SRS items near forgetting threshold and high-weightage weak areas as exam nears.
- **Constraints:** today's time budget, fatigue cap, section balance, and "don't recommend 10 hard items in a row".
- **Diversification:** interleave concepts/sections for retention; blend a "stretch" item with reinforcement.
- **Cold start:** use diagnostic + population priors by persona until enough personal data accrues.
- **Learning-to-rank (P2):** train a ranker on outcomes (did recommended items lead to mastery gain / retention / engagement) to refine weights.

### B.4 Outputs & surfaces

- **Today screen:** ranked task list (each with expected gain + time).
- **Contextual "recommended next"** at end of every session/test.
- **Daily goal** = a small, achievable, high-utility bundle sized to the user's time budget.
- **Rest recommendation** when fatigue/burnout risk is high.

### B.5 Evaluation

- Offline: replay/counterfactual estimates of utility; ranking metrics (NDCG) against outcome labels.
- Online: A/B on mastery-gain-per-hour, retention rate, daily-goal completion, and predicted-score trajectory. Guardrail metrics: burnout signals, churn.

## Score-impact justification
The Mentor + recommender exist purely to answer "what should I do right now to gain the most marks per minute?" — the literal embodiment of the north-star filter. Every recommendation is score-gain-per-time optimized with fatigue guardrails.
