---
name: snap
description: Make faster product or sales decisions using SNAP criteria
user-invokable: true
args:
  - name: decision
    description: The decision to make and options to compare (optional)
    required: false
---

Make faster, higher-quality product or sales decisions using the SNAP framework: **Simple**, **iNvaluable**, **Aligned**, **Priority**. Use it to cut through complexity, compare options, and produce a clear recommendation.

## Steps

1. **List options**
   - Enumerate the viable options to choose from (including “do nothing” when relevant).
   - State constraints (time, budget, compliance, resourcing).

2. **Score each option with SNAP**
   - **Simple** — Easy to understand and implement; avoid unnecessary complexity.
   - **iNvaluable** — Delivers exceptional value that justifies attention and resources.
   - **Aligned** — Fits the customer’s / organization’s core objectives and beliefs.
   - **Priority** — Urgent and important enough to act on now versus other work.

3. **Pass/Fail gate**
   - Mark each dimension as **Pass/Fail** with short justification.
   - Advance only options that **pass all four** dimensions; call out risks and mitigations for borderline cases.

4. **Recommend**
   - Pick the top choice and provide a crisp rationale.
   - If no option passes, recommend what must change for a viable option to pass.

## Output Format

Return a SNAP scorecard for each option with:
- **Pass/Fail** per dimension (Simple/iNvaluable/Aligned/Priority)
- **Overall recommendation**
- **Rationale** for the top choice
