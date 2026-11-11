---
name: heart
description: Define UX metrics using the HEART framework for user-centered measurement
user-invokable: true
args:
  - name: product
    description: The product/feature being measured (optional)
    required: false
---

Define user experience metrics using Google's HEART framework across five dimensions. For each dimension, produce a clear Goal, the Signals that indicate progress, and concrete Metrics that can be instrumented.

## Steps

1. **Clarify scope**
   - Identify the product/feature and primary user segment.
   - Note the primary user job-to-be-done and success outcome.

2. **Create a HEART table**
   - **Happiness** — user satisfaction and sentiment (e.g., NPS, CSAT, perceived ease-of-use).
   - **Engagement** — depth and frequency of interaction (e.g., sessions per user, actions per session).
   - **Adoption** — acquisition and initial uptake (e.g., new signups, feature activation rate).
   - **Retention** — repeat usage over time (e.g., D7/D30 retention, churn).
   - **Task Success** — efficiency and effectiveness (e.g., completion rate, time-on-task, error rate).

3. **Make metrics shippable**
   - Prefer metrics tied to specific events/properties.
   - Include a recommended cadence and likely tooling (e.g., analytics, surveys, logging).
   - Call out likely confounders (seasonality, cohort effects) when relevant.

## Output Format

Return a HEART table with one row per dimension and columns:
- **Goal**
- **Signal**
- **Metric**
- **Cadence**
- **Tooling**
