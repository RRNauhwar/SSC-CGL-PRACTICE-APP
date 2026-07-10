# 07 — Analytics Platform

A control room for the aspirant's performance — superior to GitHub Insights in usefulness, and always **actionable** (every metric maps to a next action). Powers the Mentor, recommender, planner, and SRS.

## 1. Principles

- **Actionable over decorative:** each chart answers "what do I do about it?".
- **Honest:** predictions show confidence bands; small-sample metrics are labeled low-confidence.
- **Fast:** pre-aggregated rollups (doc 12/14) so dashboards load instantly, even offline (last-synced snapshot).
- **Comparative:** vs. your past self, vs. cohort, vs. topper patterns.

## 2. Metric Catalog

### Progress & activity
- Daily / weekly / monthly / yearly progress (questions, tests, study minutes, mastery gained).
- Study consistency, streaks, activity heatmap (calendar), goal-completion rate, revision-success rate.

### Performance
- Accuracy (overall, per section/subject/chapter/topic/concept).
- Speed & average time per question (by section, difficulty, tag).
- Question-solving efficiency = accuracy per unit time; attempts vs. accuracy tradeoff.
- Negative-marking analysis: marks lost to wrong attempts; net vs. gross score.
- Guess accuracy (accuracy on flagged/very-fast answers) → guess discipline.

### Mistake taxonomy (core differentiator)
Classify every wrong answer into:
- **Careless** (knew it, slipped), **Calculation** (method right, arithmetic wrong), **Reading/Misinterpretation** (misread stem/options), **Concept-gap** (didn't know), **Guess** (no basis), **Time-pressure** (rushed/incomplete).

Classification method:
1. **Explicit:** optional one-tap self-tag at review time.
2. **Inferred:** heuristics — very short time + wrong = careless/guess; long time + wrong on calc-heavy = calculation; wrong across a whole concept with high time = concept-gap; wrong on statement-based with moderate time = reading. Refined by an ML classifier over time.
- **Mistake trends** over time per type; which type costs the most marks.

### Mastery & retention
- Chapter/topic/concept **mastery** (0–100) with progression over time.
- **Retention curves** per concept (accuracy vs. days-since-last-practice) → feeds SRS decay model (doc 08).
- Mastery progression timeline; concepts "at risk" of decay.

### Higher-order / behavioral
- Learning velocity (mastery points/week), improvement trends, time-utilization, focus duration (from Pomodoro/session data).
- **Time-of-day performance** (when are you sharpest?), **device usage** patterns.
- **Burnout detection** (see §4), confidence levels (self-rated + accuracy-vs-confidence calibration).
- Recommendation history + which recommendations led to gains.

### Prediction
- **Expected score** (per section + total), **percentile prediction**, **AIR prediction** — with confidence bands.

## 3. Score / Percentile / AIR Prediction

- **Expected score:** for each section, `E[score] = Σ_concept weightage_share × P(correct | mastery, difficulty) × marks − expected_negative`, where `P(correct)` comes from mastery + IRT difficulty and the user's guess/negative behavior. Aggregate to total.
- **Calibration:** continuously compare predicted vs. actual mock scores; fit a calibration function so predictions track reality (report calibration error; target ±8 marks for engaged users).
- **Percentile & AIR:** map predicted score → percentile using the platform's mock population distribution, adjusted toward the real exam distribution using historical cutoff data; AIR estimated from expected total applicants and historical score→rank curves. Always a **range**, never false precision.
- **Trajectory:** show predicted-score-over-time and "projected score on exam day if current pace continues".

## 4. Burnout & Wellbeing Detection

Signals: declining accuracy despite constant effort, rising avg time, dropping session length, late-night study spikes, streak-anxiety patterns, self-reported mood (doc 10). When risk is high → recommend rest, lighter load, or a confidence-building session; Mentor adjusts tone. Never punish rest.

## 5. Dashboards & Screens (doc 01)

- **Overview:** predicted score + trend, streak, top-3 weak areas, today's gains, one Mentor insight.
- **Accuracy & Speed**, **Mistakes**, **Mastery & Retention**, **Prediction**, **Consistency** — each with drill-downs to concept level and a clear CTA (e.g., "Practice these 8 weak concepts").
- Visuals: modern cards, trend lines, heatmaps, radar (section balance), sankey (time allocation) — accessible + fast.

## 6. Data Pipeline (summary; detail in doc 12/14)

- Attempt events → stream → real-time counters (Redis) for instant per-session summaries.
- Batch/rollup jobs → daily/weekly aggregates, mastery updates, retention curves, predictions.
- All aggregates cached per user; offline shows last-synced snapshot with a timestamp.

## 7. Success Metrics

- Prediction calibration error (mock vs. actual).
- % of users who view analytics weekly and act on ≥1 recommendation.
- Correlation between analytics-driven behavior and mastery-gain / score improvement (A/B).

## Score-impact justification
Analytics is how weaknesses become visible and mistakes become fixable — directly serving "identify weaknesses" and "reduce mistakes", while prediction + trajectory build confidence. Every screen ends in an action.
