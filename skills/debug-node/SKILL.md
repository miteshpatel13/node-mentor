---
name: debug-node
description: Use whenever the user reports an error message, stack trace, crash, hang, memory leak, or unexpected behavior in a Node.js/TypeScript Express or NestJS service or its Jest tests — including NestJS dependency-injection errors ("Nest can't resolve dependencies"), unhandled promise rejections, ESM/CommonJS module errors, event-loop blocking, TypeORM connection issues, and tests that hang. Finds the root cause with evidence before changing code and adds a regression test.
argument-hint: "[error message or symptom]"
---

# Debug Node

Find the cause before changing code. Each fix gets a test that fails without it.

## Workflow

1. **Capture the evidence:** the exact error and full stack trace, Node version (`node -v`), how it's started (`nest start`, `ts-node`, compiled `dist/`), environment differences, and when it started (`git log` around that time).
2. **Reproduce it**, ideally as a failing Jest test; otherwise as the smallest command or request that triggers it.
3. **Match the symptom** to the playbook below, and form one hypothesis at a time.
4. **Confirm the hypothesis with evidence** — a log line, a breakpoint, a profile — before editing.
5. **Fix the cause, not the symptom.** A `try/catch` that swallows the error, or a `?.` that hides a null, isn't a fix unless null is genuinely valid there.
6. **Add a regression test**, run the related tests, and state the root cause in one sentence.

## Symptom playbook

| Symptom | Likely causes | How to confirm |
|---|---|---|
| `TypeError: Cannot read properties of undefined/null` | Missing `await`, optional data treated as required, wrong shape from an API or database | Trace the value back to its source; check `await` on every promise in the path |
| `UnhandledPromiseRejection` / process exits | A promise not awaited or caught (fire-and-forget calls, `forEach(async …)`, event handlers) | Run with `--unhandled-rejections=strict --trace-uncaught`; enable `@typescript-eslint/no-floating-promises` |
| `Nest can't resolve dependencies of X (?, …)` | The provider isn't in the module's `providers`, not exported by its module, or its module isn't imported; a circular import; a missing `@Injectable()`; an interface used as an injection token | Read the index in the error; check that module's `imports`/`exports`; `madge --circular src` if available |
| `ERR_REQUIRE_ESM`, `Cannot use import statement outside a module` | An ESM-only dependency in a CommonJS build, or a mismatch between `"type"` in `package.json` and `module` in tsconfig | Check the dependency's `package.json` `"type"`/`"exports"`; pin to its last CJS major or change the module settings deliberately |
| Stack traces point into `dist/*.js` | No source maps | Run with `node --enable-source-maps`; ensure `sourceMap: true` |
| Latency spikes; all requests slow at once | Event-loop blocking: sync crypto/fs/zlib, large `JSON.parse`/`stringify`, heavy regex, CPU loops | `node --cpu-prof` or Clinic.js (`clinic doctor`/`flame`); `perf_hooks.monitorEventLoopDelay` |
| Memory grows until crash | Unbounded caches or maps, listeners added per request, closures holding requests, timers never cleared | Two heap snapshots under load (`--inspect` or `--heapsnapshot-signal=SIGUSR2`), compare retained objects |
| DB timeouts / "too many connections" | Pool exhaustion from long transactions or leaked query runners, N+1 queries, missing indexes | Log pool stats; TypeORM `logging: ['query']` in dev; `EXPLAIN ANALYZE` on the slow query; `queryRunner.release()` in `finally` |
| Jest hangs or "did not exit" | Open handles: DB connections, servers, timers, queues not closed | `jest --detectOpenHandles`; close the app/module in `afterAll`; use fake timers deliberately |
| Works locally, fails in CI/prod | Env vars, Node version, timezone/locale, file-path case sensitivity, a race hidden by timing | Diff the environments; `TZ=UTC`; run tests with `--runInBand` to rule races in or out |

For performance problems that need measurement and targets, hand over to `/engineering-mentor:performance-review`. For data-integrity bugs, check the fix with `/engineering-mentor:database-review`.

## Output

Report: the root cause (one sentence, with evidence), the fix, the regression test and its result, and whether the same pattern exists elsewhere (`grep` for it and list the other occurrences).
