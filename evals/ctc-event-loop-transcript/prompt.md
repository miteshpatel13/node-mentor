---
description: A request to judge an on-call candidate's reasoning from an incident-scenario transcript must trigger complex-thinking-capacity, score with quoted evidence and correct round attribution, catch that the candidate took the "scale out" trap, and report the pressure result without diagnosing the person.
tags: [assessment, hiring]
max_turns: 20
timeout_seconds: 400
# node-mentor depends on engineering-mentor; eval runs load nothing else, so load both.
# Run scripts/prepare-evals.sh first to copy it into .eval-deps/.
plugins: ["../..", "../../.eval-deps/engineering-mentor"]
allowed_tools: [Read, Glob, Grep, Skill]
---

I interviewed someone for our on-call rotation with a scenario: p99 latency on our Express API went from 120 ms to 8 s after we shipped CSV import, CPU pinned at 100% per pod, memory normal. Here's what they said each round. Are they ready to carry the pager?

- Round 1 (what do you do?): "Scale out. Double the pods and bump the memory limit, that should absorb it."
- Round 2 (are you sure that fixes it?): "Hmm, CPU is pinned but memory is fine… maybe the import is synchronous and blocking the event loop. Then more pods won't help much."
- Round 3 (new fact: liveness probes are failing, pods restart mid-import, clients retry uploads): "So restarts cause retries and duplicate work. I'd turn the import off with a flag first, then move parsing to a worker."
- Round 4 (biggest customer is uploading now, fix it in 10 minutes): "I'd turn the flag off and tell the customer to upload in an hour. I won't hot-patch parsing under pressure."
- Round 5 (what would you change?): "I jumped to scaling at first. I should have looked at event-loop lag before deciding."
