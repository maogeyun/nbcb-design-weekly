---
name: musk-five-steps
description: Use when simplifying a process or product by eliminating unnecessary complexity
user-invokable: true
args:
  - name: target
    description: The process/product to simplify (optional)
    required: false
---

Use Musk’s five-step, first-principles engineering process to radically simplify a process or product: question requirements, delete unnecessary parts, simplify what remains, then accelerate and automate (in that order).

## Steps

1. **Question the requirements**
   - Challenge every requirement: who set it, why, and what evidence supports it.
   - Treat “smart-sounding” requirements as especially risky and worthy of scrutiny.

2. **Delete**
   - Remove any part or step you can.
   - If you aren’t adding back at least ~10% of what you delete, you probably didn’t delete enough.

3. **Simplify and optimize**
   - Only after deletion, simplify what remains.
   - Do not optimize a step that should not exist.

4. **Accelerate cycle time**
   - Speed up the process only after steps 1–3.
   - Going faster on a broken process just produces waste faster.

5. **Automate**
   - Automate last, never first.
   - Automating a flawed process locks in the flaw.

## Output Format

Return a before/after comparison table showing for each component/step:
- Whether it was **Questioned / Deleted / Simplified / Accelerated / Automated**
- **Rationale**
- **Resulting improvement**
