---
type: llm
---

PASS if the response describes an implemented GET /orders/:id/invoice that (1) validates the id as a UUID like the existing route, (2) enforces the same ownership/admin rule as findOneForUser (for example by calling it), (3) returns a 404 or 409-style Nest exception when the order is not paid / has no invoice, and (4) adds unit tests covering at least the owner success case, another customer's order (forbidden), and an unpaid order.
FAIL if ownership is not enforced, if the order is fetched by id without a user check, or if no tests were added.
