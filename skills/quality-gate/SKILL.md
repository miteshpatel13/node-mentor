---
name: quality-gate
description: Run the full quality gate for a Node.js/TypeScript (Express or NestJS) project in one pass — typecheck, lint, Jest unit tests, optional e2e tests, and a dependency security audit — and report a single pass/fail summary with the first actionable errors. Use when asked whether a change is done, ready to commit, ready for a PR, or "does everything pass?".
allowed-tools: Bash(./node_modules/.bin/tsc *) Bash(./node_modules/.bin/eslint *) Bash(./node_modules/.bin/jest *) Bash(npm test*) Bash(npm run test*) Bash(npm run build*) Bash(npm audit *) Bash(git status*) Bash(git diff*)
---

# Quality Gate

Answer "is this ready?" with evidence. Run every check, don't stop at the first failure, don't fix anything unless asked, and report one summary.

## 1. Discover the project's own commands

Read `package.json` (scripts, devDependencies) and `tsconfig*.json` before running anything. Use the project's tools from `node_modules/.bin` — never `npx <tool>`, which can download a different version. If `node_modules` is missing, stop and say `npm ci` is needed.

## 2. Run the checks

Run these in order from the package root. Record exit code, duration, and the first errors of each.

| Check | Command | Notes |
|---|---|---|
| Typecheck | `./node_modules/.bin/tsc --noEmit -p tsconfig.json` | NestJS projects often have `tsconfig.build.json` for builds; typecheck with `tsconfig.json`, which includes tests. |
| Lint | `./node_modules/.bin/eslint <paths>` **without `--fix`** | NestJS's default `lint` script includes `--fix` and rewrites files — don't run it for a gate. Use the paths from the script (for example `"{src,apps,libs,test}/**/*.ts"`). |
| Unit tests | `./node_modules/.bin/jest --ci` | Add `--coverage` only if the project enforces thresholds (`coverageThreshold` in Jest config). |
| E2E tests | `npm run test:e2e` | Only if the script exists **and** the user confirms its dependencies (database, Redis, env vars) are available. Otherwise list it as "not run". |
| Build | `npm run build` | Only if typecheck can't cover it (for example SWC/webpack builds or `nest build` with assets). |
| Audit | `npm audit --omit=dev --audit-level=high` | Contacts the npm registry. Never run `npm audit fix --force`. |

Never run migrations, seeds, or anything with `prod` in the script name as part of the gate.

## 3. Report

```text
Quality gate: PASS | FAIL
Typecheck  PASS  12s
Lint       FAIL  3 errors (src/orders/orders.service.ts:41 no-floating-promises …)
Unit tests PASS  148 passed
E2E        not run (needs database — run `npm run test:e2e` when available)
Audit      PASS  0 high/critical
```

Then list the first actionable errors per failing check (file:line, rule or test name), and whether a failure is in files changed on this branch (`git diff --name-only $(git merge-base HEAD origin/main)`) or pre-existing. Recommend the next step: fix the failures, or — if everything passes — `/engineering-mentor:code-review` on the branch diff.

## Rules

- A check that didn't run is reported as "not run" with the reason — never as PASS.
- Don't weaken a check to make it pass (no `--passWithNoTests` on a gate run, no skipping tests, no `// eslint-disable`).
- Warnings don't fail the gate unless the project's lint script uses `--max-warnings 0`.
