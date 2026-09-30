---
description: Adding an endpoint to a NestJS module must mirror the module's conventions - ParseUUIDPipe, the CurrentUser ownership check in the service, Nest exceptions - and add unit tests including the forbidden case.
tags: [smoke, nestjs, new-endpoint]
max_turns: 40
timeout_seconds: 600
# node-mentor depends on engineering-mentor; eval runs load nothing else, so load both.
# Run scripts/prepare-evals.sh first to copy it into .eval-deps/.
plugins: ["../..", "../../.eval-deps/engineering-mentor"]
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit]
---

Add an endpoint GET /orders/:id/invoice that returns the invoice details for an order: order id, invoice number, total, and paid date. Only paid orders have an invoice. Don't run anything, just write the code and tests.
