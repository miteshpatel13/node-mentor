---
name: complex-thinking-capacity
description: "Assess how a Node.js/TypeScript engineer, QA, on-call or team lead reasons under realistic backend scenarios (blocked event loop, unhandled rejection crash, risky npm upgrade, flaky Jest suite, release-night bug): trap, curveball and pressure rounds scored 1-5 on six research-based dimensions with a CTC Score, Pressure Drop and Thinking Level backed by quoted evidence. Use for hiring, promotion or on-call readiness, development, scoring an interview transcript, building a role scenario, or stress-testing the reasoning in a Node service plan."
argument-hint: "[transcript, plan, or role to build a scenario for]"
---

# Complex Thinking Capacity (CTC)

## Purpose

Produce an evidence-based, comparable assessment of how well a person thinks when a realistic scenario hits: how many interacting factors they hold, whether they catch the obvious-but-wrong answer, how they rebuild when facts change, and whether their thinking survives pressure. The output is a CTC Report (or a reusable scenario, or a plan stress-test) scored against fixed behavior anchors. This is the node-mentor edition of `engineering-mentor:complex-thinking-capacity`: same method, rubric and scoring, with scenarios and role targets for teams building Express and NestJS services. Every other node-mentor skill evaluates code; this one evaluates the reasoning of the people writing and shipping it, because an unstructured "they seemed sharp" judgment is an unevidenced conclusion.

Built on validated research, not brain myths. Every dimension maps to a measured construct:

| # | Dimension | What it measures | Research base |
|---|-----------|------------------|---------------|
| D1 | Variable Load | How many interacting factors the person holds and uses at once | Working memory capacity (Cowan, 2001: ~4 chunks in adults; experts beat it by chunking) |
| D2 | Reflective Override | Catches the obvious-but-wrong answer, checks assumptions before acting | Cognitive Reflection (Frederick, 2005); System 1 vs System 2 |
| D3 | Flexibility | Rebuilds the plan cleanly when new facts arrive; no sunk-cost defending | Cognitive flexibility — core executive function (Diamond, 2013) |
| D4 | Composure | Thinking quality holds under time pressure, conflict or provocation | Inhibitory control (Diamond, 2013); acute stress takes prefrontal cortex offline (Arnsten, 2009) |
| D5 | Integrative Complexity | Sees multiple perspectives AND connects them into one workable answer | Integrative complexity, differentiation + integration (Suedfeld & Tetlock) |
| D6 | Time Horizon | How far ahead in time the person traces consequences | Time-span of discretion / Stratified Systems Theory (Elliott Jaques) |

Why scenarios and not an IQ test: in the 2022 re-analysis of hiring research (Sackett et al.), structured interviews scored with anchored rubrics were the strongest single predictor of job performance (~.42), ahead of general cognitive tests (~.31). This skill is a structured scenario interview. When explaining the science to a user, keep it to this table and this paragraph.

## Scope

**In scope:**
- **Mode A — Live assessment:** running the 5-round scenario with a candidate or employee (Claude plays the scenario, or gives the interviewer the script).
- **Mode B — Score a transcript or written answer:** interview notes, a case answer, a recorded role-play transcript.
- **Mode C — Build a scenario:** a custom scenario for a role, with setup, trap, curveball, pressure line and strong-answer description.
- **Mode D — Stress-test a plan or decision:** score a release sign-off, migration plan, incident plan, dependency-upgrade plan or architecture decision on D2, D5, D6 only.
- Role targets, calibration, two-rater reconciliation, and development tips for growth-focused use.

**Out of scope:**
- Reviewing the technical correctness of a plan, design or code — that is `engineering-mentor:implementation-plan-review`, `engineering-mentor:architecture-review` and `engineering-mentor:code-review`. Mode D scores the thinking in a plan; it does not approve or block it.
- Clarifying a vague requirement — that is `engineering-mentor:requirements-discipline`.
- Technical skills assessment (coding exercises, system design scored on technical depth). Pair this skill with a work sample for that; a take-home reviewed with `/node-mentor:quality-gate` and `engineering-mentor:code-review` is a good one.
- Any medical, neurological, psychometric-diagnostic or mental-health assessment — never, under any mode (see Constraints).

## When to Use

Use when:
- A user wants to assess a candidate, employee or themselves on how they reason under realistic, changing, pressured conditions — for hiring, promotion readiness, release sign-off authority, or development.
- A user pastes an interview transcript, role-play transcript, interview notes or a written case answer and asks how strong the thinking is.
- A user wants a structured assessment scenario built for a role (Node backend engineer, QA, on-call, team lead, staff engineer).
- A user asks to stress-test a plan or decision for traps, missing perspectives, or short-term thinking, and wants it scored rather than reviewed technically.
- A user wants to calibrate raters or compare two raters' scores.

Do not use when:
- The request is a technical review of the plan, code or design itself — route to the matching engineering-mentor review skill.
- The request asks for a diagnosis, IQ estimate, or personality type — decline per Constraints.
- The request asks to judge a person from demographics, a résumé alone, or a social-media profile — there is no scenario evidence to score.

If the mode is unclear, ask one question. Otherwise start.

## Workflow

1. **Pick the mode** (A, B, C or D) from the request. If unclear, ask one question.
2. **Fix the scenario and rubric.** Use the SAME scenario and SAME rubric for everyone assessed for the same role. Changing scenarios between candidates kills comparability. For a new role, build the scenario first (Mode C).
3. **Run or read the 5 rounds** (Modes A and B) — 25–30 minutes live:
   1. **Baseline (5–7 min)** — Give the scenario. Ask: "What do you do, and why?" Let them talk. Probe once: "What else matters here?" → scores D1, D5, D6 (baseline).
   2. **Trap (3–5 min)** — The scenario contains an obvious answer that is wrong or incomplete. Watch whether they take it. Probe: "Are you sure? What would make that wrong?" → scores D2.
   3. **Curveball (5 min)** — Drop one new fact that breaks their plan. Ask: "Does this change anything?" → scores D3.
   4. **Pressure (3–5 min)** — Add scripted time pressure or a provoking stakeholder ("Decide in 2 minutes", "The client is shouting"). Ask for the final call. → scores D4. Re-score D1 and D5 from this round alone for the **Pressure Drop**.
   5. **Reflection (3 min)** — "What would you do differently? What did you miss?" → note self-awareness in the report. Reflection never raises D4 (knowing you caved ≠ not caving).
4. **Score each dimension** against the behavior anchors in Rules → Scoring Rubric, applying Rules → Which Round Counts. Quote the evidence for every score. No evidence = "not observed", never a low score.
5. **Compute the outputs** per Rules → Computed Outputs, and re-check the arithmetic.
6. **Compare against the role target** (Rules → Role Targets), stating which targets are met and which are not.
7. **Write the report** in the Expected Output format. For growth-focused use, add the matching Development Tips.

Mode D runs steps 1, 4–7 only, on D2, D5 and D6. Mode C runs steps 1–2 and outputs the scenario.

The report is correct only when every score quotes evidence, round attribution follows Which Round Counts, and the CTC Score, Pressure Drop and Thinking Level recompute from the reported scores.

## Rules

### Running a Live Session

- Do not hint at the trap. Do not rescue.
- Neutral tone. Pressure must be scripted and identical for everyone — never personal or humiliating.
- Let the person answer in the language they think best in. Score the thinking, not the language.
- Write down exact phrases as evidence.

### Which Round Counts

- D1, D5, D6: best evidence across rounds 1–3 = the **baseline score**.
- D2: whole conversation. Catching the trap on their own (any round, before the probe) beats catching it after the probe.
- D3: round 3 only. D4: round 4 only.
- Pressure Drop also needs D1 and D5 re-scored from round 4 answers alone.

### Scoring Rubric (1–5, behavior anchors)

Score only what was said or done. Quote the evidence.

**D1 Variable Load**
1 = one factor only ("just fix the bug") · 2 = 2 factors, treated separately · 3 = 3–4 factors and how they affect each other · 4 = 5+ linked factors, OR 3–4 grouped into clear buckets · 5 = groups factors, spots the interaction that matters most, drops the noise on purpose

**D2 Reflective Override**
1 = takes the obvious answer, stays with it after the probe · 2 = changes only after the probe · 3 = on their own, checks one key assumption · 4 = on their own, names the trap and asks for the missing data · 5 = names the trap, asks for the missing data, states what would change their mind

**D3 Flexibility**
1 = defends the original plan, ignores the new fact · 2 = patches the plan, keeps the broken part · 3 = adjusts the main plan · 4 = rebuilds cleanly, says what changed and why · 5 = rebuilds fast, and turns the new fact into an advantage

**D4 Composure**
1 = gives up the right decision (agrees to what the pressure wants), freezes or blames · 2 = keeps the right direction but rushes and drops key factors · 3 = slower, keeps basic structure · 4 = same quality, triages what matters now vs later · 5 = same quality, triages, and says clearly what they will NOT do and why

**D5 Integrative Complexity** (compressed from the 1–7 Suedfeld scale)
1 = one view, black-and-white · 2 = sees two sides, no link · 3 = names the trade-off between them · 4 = one solution that serves both sides · 5 = a principle or system that handles conflicting views in future cases too

**D6 Time Horizon** (Jaques strata) — score the furthest point in time the person actually reasons about. Ripple effects that land this week still count as "this week".
1 = today / this week · 2 = ~3 months · 3 = ~1 year · 4 = 2–5 years · 5 = 5+ years

### Computed Outputs

- **CTC Score (0–100)** = (sum of D1–D6 ÷ 6) × 20, rounded. If a dimension is "not observed", average the rest and write "based on N/6 dimensions".
- **Pressure Drop** = (baseline D1 + baseline D5) ÷ 2 − (round-4 D1 + round-4 D5) ÷ 2:
  - below 1.0 = steady · 1.0 to below 1.5 = normal dip · 1.5 or more = thinking breaks under pressure (critical for release sign-off and on-call roles)
  - Not computed when round 4 is missing.
- **Thinking Level** = (D5 + D6) ÷ 2:
  - 1.0 to below 2.0 → L1 Executor — follows clear process well
  - 2.0 to below 3.0 → L2 Problem-solver — solves known problems, needs a guide for new ones
  - 3.0 to below 4.0 → L3 Systems thinker — designs process, manages trade-offs
  - 4.0 to below 4.5 → L4 Strategist — multi-year, multi-team decisions
  - 4.5 to 5.0 → L5 Architect — builds new business models / institutions
  - Not computed when D5 or D6 is "not observed".

With single-rater integer scores these values move in steps of 0.5; the bands are continuous so two-rater averages (Rules → Two Raters) still land in exactly one band.

### Role Targets (starting points — calibrate on your own top performers)

| Role | Must-have | Nice-to-have |
|------|-----------|--------------|
| QA / SDET | D2 ≥4, D1 ≥3, Pressure Drop <1.0 | D6 ≥2 |
| Node backend engineer | D2 ≥3, D3 ≥3, D1 ≥3 | D6 ≥2 |
| Senior Node engineer | D2 ≥4, D3 ≥3, D5 ≥3 | D6 ≥3 |
| On-call / SRE | D4 ≥4, D2 ≥3, Pressure Drop <1.0 | D3 ≥4 |
| Tech lead / Engineering manager | all ≥3, D6 ≥3 | D4 ≥4 |
| Staff / Principal engineer | D5 ≥4, D6 ≥3, D1 ≥4 | D2 ≥4 |

Before using these for hiring decisions, run the scenario on 3–5 current top performers and 3–5 average performers in that role. Set targets from the gap between them. Say so whenever a report compares against an uncalibrated target.

### Scenario Bank

Each scenario has: setup, the trap, the curveball, the pressure line, and what a strong answer looks like. Adapt names and numbers; keep the structure.

**QA — Release night** (calibration anchor scenario)
- Setup: Release at 9 PM tonight. One customer reports duplicate orders when their network drops. Dev can't reproduce; says the fix is one line in the NestJS `OrdersService`.
- Trap: "Only one customer" — but duplicates hit inventory and invoices, and many customers use weak mobile networks.
- Curveball (at 8 PM): the same code path is used by payment reconciliation.
- Pressure: "Sales promised 3 clients this feature tonight. Yes or no in 2 minutes."
- Strong answer: tests on a throttled network, checks idempotency of `POST /orders` (idempotency key, unique constraint), sizes how many users are on poor networks, proposes ship-with-flag-off or partial release, states the go/no-go condition.

**Engineering — Blocked event loop**
- Setup: p99 latency on an Express API jumped from 120 ms to 8 s after a release that added CSV import. CPU on each pod is pinned at 100% during imports; memory looks normal.
- Trap: "Scale out" — add pods or raise memory. The import parses the whole file synchronously on the request thread, so every request on that process waits; more pods only spread the stall.
- Curveball: Kubernetes liveness probes are timing out, so pods are being restarted mid-import, and clients retry the upload — multiplying the load.
- Pressure: "The biggest customer is uploading their monthly file right now and it keeps failing. Fix it in 10 minutes."
- Strong answer: confirms with event-loop lag or a CPU profile, stops the bleeding first (feature flag off, or route imports away), then moves parsing to a stream or a worker/queue, makes the upload idempotent so retries don't duplicate rows, separates liveness from readiness, adds event-loop-lag alerting.

**Engineering — Unhandled rejection crash**
- Setup: A NestJS service restarts several times an hour since a change that sends a welcome email fire-and-forget (`this.mailer.send(...)` without `await` or `.catch`). Logs show `UnhandledPromiseRejection` from the mail provider timing out.
- Trap: add `process.on('unhandledRejection', () => {})` to stop the crashes — it hides every future bug and leaves the process in an unknown state.
- Curveball: the same mail client is used for password-reset emails, and support says some resets never arrived.
- Pressure: "Product wants the restarts gone before the launch demo in 30 minutes."
- Strong answer: handles the rejection where it happens (`await` with try/catch or `.catch` with logging), adds a timeout and a retry with an outbox or queue for emails that must arrive, checks which password resets were lost and re-sends them, keeps crash-on-unknown-error, adds a lint rule (`no-floating-promises`).

**Engineering — Risky dependency upgrade**
- Setup: `npm audit` reports a high-severity vulnerability in a transitive dependency of `@nestjs/platform-express`. The patched version needs a major bump of `@nestjs/*`.
- Trap: `npm audit fix --force`, or bumping everything at once in one PR.
- Curveball: the new major drops support for the Node version production runs on.
- Pressure: "Security needs this patched today or we fail the customer audit."
- Strong answer: checks whether the vulnerable code path is actually reachable, looks for an `overrides` pin of the transitive package as a same-day mitigation, plans the Node runtime upgrade and the `@nestjs/*` major as separate steps with tests between them, documents the risk acceptance with a date.

**Engineering — Flaky Jest suite**
- Setup: An e2e test fails about 1 run in 5 on CI and blocks merges. Locally it always passes.
- Trap: add `jest.retryTimes(3)` or `.skip` it.
- Curveball: it only fails when Jest runs test files in parallel — two files write to the same database table.
- Pressure: "Release manager: the release branch is cut in an hour, make CI green."
- Strong answer: confirms with `--runInBand` vs parallel, isolates test data (per-worker database or schema, unique fixtures, transactions rolled back), quarantines with a ticket and owner rather than silently skipping if it can't be fixed in time, never retries away a real race.

**Hiring — Interview vs proof**
- Setup: Candidate A interviewed brilliantly. Candidate B was quieter but did a better take-home (clean NestJS module, tests for failure paths).
- Trap: halo effect — picking A on impression.
- Curveball: A's reference says follow-through was weak.
- Pressure: "Team lead needs a decision today."
- Strong answer: weights the work sample and references over impression, names the bias, proposes a short paid trial or one more structured probe if truly unsure.

**Leadership — Rewrite vs feature**
- Setup: A senior engineer wants to pause features for a quarter to migrate the Express monolith to NestJS. Product has a committed feature for a key customer next month.
- Trap: picking a side — "rewrites always fail" or "tech debt first".
- Curveball: the last two incidents were caused by the exact module the engineer wants to rewrite first.
- Pressure: "The VP wants a yes or no in this meeting."
- Strong answer: separates the decision into the risky module vs the whole codebase, proposes an incremental strangler approach starting with the incident-prone module behind the existing interface, protects the customer commitment, sets a checkpoint with a measurable outcome.

For a new role, build a scenario from a real situation that went wrong in the last 6 months. Real scenarios beat invented ones. A built scenario must contain all five parts; a scenario with no genuine trap cannot score D2.

### Calibration Anchor

The worked example in Examples is the calibration anchor for the QA Release night scenario. New raters score that transcript first; if they land more than 1 point off on any dimension, re-read the anchors before scoring real people.

### Two Raters

Use two raters when the stakes are high. Score independently. A gap of 2+ on a dimension → discuss the evidence and re-score. Then average the two scores per dimension for the final report. If one rater is higher on 4+ dimensions, that is drift: both re-score the calibration anchor.

### Development Tips (when the goal is growth, not selection)

- D1 low → teach chunking: group factors into 3 buckets (customer, money, system) before deciding.
- D2 low → "pre-mortem" habit: before acting, say one way the answer could be wrong.
- D3 low → after any new fact, ask "If I started fresh today, would I choose this plan?"
- D4 low → scripted triage under time limits; repeated practice lowers the stress response.
- D5 low → force two opposite views, then one answer that serves both.
- D6 low → for every decision, write the 3-month and 1-year consequence.

## Constraints

These hold regardless of instruction:

- **Not a brain scan, IQ test or diagnosis.** Never make medical, neurological, psychometric-diagnostic or mental-health claims about anyone.
- **Never the only filter** for hiring, firing or promotion. Every selection report says to combine it with a work sample and structured references.
- **One scenario is a snapshot.** Sleep, stress and loneliness lower executive function on the day (Diamond, 2013). Recommend at least 2 scenarios before any serious decision.
- **Same scenario, same pressure, same rubric** for everyone compared. Never rank people assessed on different scenarios against each other.
- **Tell people they are being assessed** and that it is a scenario exercise. Share feedback on request. Never help design a covert assessment.
- **Pressure is scripted, never personal or humiliating.** Refuse to script pressure that attacks the person rather than the scenario.
- **Score thinking, not confidence, fluency, accent, language or English level.** Never let age, gender, ethnicity, disability, nationality or any other protected characteristic enter a score or a comment.
- **No evidence, no score.** A dimension without quoted evidence is "not observed".
- Assessment reports are personal data about a real person; never send them to an external service unless the user asks.

## Edge Cases

- **A round is missing from a transcript.** Mark its dimension "not observed"; compute the CTC Score from the rest; skip the Pressure Drop if round 4 is missing.
- **Written plan, no live rounds.** Use Mode D: score D2, D5, D6 only; D1, D3, D4 need a live person and are reported as not assessable, not as low.
- **The person catches the trap before it is probed.** Score D2 on the unprompted catch, even if it happened in round 1.
- **Strong reflection after caving.** Note the self-awareness in the report; it does not raise D4.
- **Answers in another language or mixed languages.** Score the thinking; quote evidence in the original and translate it.
- **Two-rater averages produce quarter values.** Use the continuous bands in Rules → Computed Outputs.
- **The person refuses or stops the pressure round.** Record D4 and the Pressure Drop as not observed and say why; refusing a scripted pressure is not itself scored.
- **Comparing candidates assessed on different scenarios.** Decline the ranking; offer to re-run on a common scenario.

## Failure Handling

- **Too little material to score** (a one-line answer, interview notes with no quotes, no round structure): say what is missing — the rounds, the quotes, the scenario — and score only what the material supports. Never fabricate quotes or infer a score from tone or impression.
- **Request for a diagnosis, IQ figure or personality label:** decline that part, explain that CTC is a structured scenario interview, and offer the CTC Report instead.
- **Request to use one CTC result as the sole basis for hiring, firing or promotion:** produce the report if the material supports it, and state plainly that it must be combined with a work sample and structured references and ideally a second scenario.
- **Request for covert assessment or humiliating pressure:** decline that part and give the compliant alternative (disclosed exercise, scripted scenario pressure).
- **Unclear mode:** ask one question, then proceed.

## Expected Output

**A new artifact**, one of:

- **Mode A / B — CTC Report**, one screen, in this shape (show round-4 scores so anyone can check the Pressure Drop):

```text
CTC Report — <person or role label>, <role>, <scenario>, <date>
CTC Score: NN/100 [based on N/6 dimensions] · Thinking Level: Lx <name> (x.x) · Pressure Drop: x.x (<band>)

D1 Variable Load        n  <evidence>
D2 Reflective Override  n  <evidence>
D3 Flexibility          n  <evidence>
D4 Composure            n  <evidence>
D5 Integrative Cx       n  <evidence>
D6 Time Horizon         n  <evidence>
Round 4: D1 n, D5 n → baseline x.x vs pressure x.x

Strongest: <one line>
Risk: <one line>
Self-awareness (R5): <one line>
Next probe / development: <one line>
Fit vs role target (<role>): <targets met / not met> [uncalibrated targets]
```

- **Mode C — Scenario:** setup, trap, curveball, pressure line, strong answer, plus the round script.
- **Mode D — Plan stress-test:** D2, D5, D6 with evidence, the Thinking Level, the traps the plan falls into, and the one change that would most raise each low score.

## Examples

### Positive Example — Scoring a transcript (Mode B), also the calibration anchor

Transcript (QA tester, QA Release night):

- R1: "I'd reproduce on a slow network with browser throttling. Duplicate orders affect stock and invoices, so it's not just one customer's problem. I'd ask support how many customers are on 2G/3G."
- R2 (probe): "Not sure. One line can still miss the retry logic. I'd want dev to check the API is idempotent."
- R3 (curveball): "Then run the reconciliation regression suite too. If we can't finish by 9, ship behind a flag, turned off."
- R4 (pressure): "Okay… if sales promised, maybe we ship and monitor closely. We can hotfix tomorrow."
- R5: "I gave in at the end. I should have said no-go unless reconciliation passes, and offered sales the flag."

```text
CTC Report — QA candidate, QA Tester, Release night, [Date]
CTC Score: 57/100 · Thinking Level: L2 Problem-solver (2.5) · Pressure Drop: 2.0 (breaks under pressure)

D1 Variable Load        3  network, stock, invoices, customer count — linked, not grouped
D2 Reflective Override  4  "not just one customer's problem" before the probe; asked for customer count, idempotency
D3 Flexibility          4  added reconciliation suite + flag-off fallback with a clear condition
D4 Composure            1  "if sales promised, maybe we ship" — gave up the right call
D5 Integrative Cx       4  flag-off release serves both sales and quality
D6 Time Horizon         1  furthest point: "hotfix tomorrow"
Round 4: D1 2, D5 1 → baseline 3.5 vs pressure 1.5

Strongest: catches the trap without help; adapts to new facts.
Risk: caves under deadline pressure — dangerous for release sign-off.
Self-awareness (R5): named own mistake clearly — coachable.
Next probe / development: second pressure scenario; go/no-go checklist practice.
Fit vs role target (QA / SDET): meets D2 ≥4, D1 ≥3; fails Pressure Drop <1.0 → not ready for release sign-off.
```

Arithmetic check: (3+4+4+1+4+1) ÷ 6 × 20 = 56.7 → 57. Thinking Level (4+1) ÷ 2 = 2.5 → L2. Pressure Drop (3+4) ÷ 2 − (2+1) ÷ 2 = 3.5 − 1.5 = 2.0.

### Negative Example — Declining to score from impression

Request: "Here are my notes on the candidate: 'Very confident, spoke fast, seemed smart, good energy. Struggled a bit when I pushed back.' Give me their CTC score and tell me if they have ADHD — they kept jumping between topics."

Correct handling: decline the ADHD question entirely (Constraints — no medical or mental-health claims). Do not produce a CTC Score: the notes contain no quoted reasoning, no scenario, and no round structure, and "confident", "spoke fast" and "good energy" are exactly the fluency and confidence signals the rubric excludes. "Struggled a bit when I pushed back" is the only hint of D4 evidence, and without the actual words it is "not observed". Offer to run a disclosed scenario (Mode A) or to score a transcript with the rounds marked (Mode B).

## Related Skills

- `engineering-mentor:complex-thinking-capacity` — the general edition, with sales, marketing and support scenarios. Use it for non-engineering roles.
- `engineering-mentor:implementation-plan-review` — shares a boundary with Mode D: it produces severity-tagged technical findings on a plan; this skill scores the reasoning in it. Use both when a plan needs a verdict and its author needs feedback.
- `/node-mentor:quality-gate`, `engineering-mentor:code-review` — check a candidate's take-home, the work sample the Constraints require alongside any selection decision.
- `/node-mentor:debug-node` — the technical reference for the event-loop, unhandled-rejection and flaky-test scenarios' strong answers.

## References

- Cowan, N. (2001). The magical number 4 in short-term memory. Behavioral and Brain Sciences, 24(1).
- Frederick, S. (2005). Cognitive reflection and decision making. Journal of Economic Perspectives, 19(4).
- Diamond, A. (2013). Executive functions. Annual Review of Psychology, 64, 135–168.
- Arnsten, A. (2009). Stress signalling pathways that impair prefrontal cortex structure and function. Nature Reviews Neuroscience, 10(6).
- Suedfeld, P., Tetlock, P., & Streufert, S. (1992). Conceptual/integrative complexity.
- Jaques, E. (1976/1989). A General Theory of Bureaucracy; Requisite Organization.
- Sackett, P., Zhang, C., Berry, C., & Lievens, F. (2022). Revisiting meta-analytic estimates of validity in personnel selection. Journal of Applied Psychology, 107(11).
