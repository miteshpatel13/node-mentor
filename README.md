# node-mentor

Claude Code plugin for Node.js + TypeScript services built with **NestJS** or **Express**, tested with **Jest**, and managed with **npm**. It shortens the edit → check → fix loop and automates recurring chores. Engineering standards and reviews come from [`engineering-mentor`](https://github.com/miteshpatel13/engineering-mentor), which node-mentor depends on and installs automatically.

## What you get

### Hooks (automatic)

| When | What happens | Blocks? |
|---|---|---|
| After Claude edits a `.ts`/`.js` file | Runs the project's Prettier (if configured) and `eslint --fix` on that file only. ESLint 8 (`.eslintrc*`) and 9 (`eslint.config.*`) both work. Errors ESLint can't fix go back to Claude immediately. | Hands errors back to Claude |
| Before Claude finishes | Runs `tsc --noEmit` (incremental) and `jest --findRelatedTests` for the files Claude edited this session. Only type errors **in those files** and failing related tests block; pre-existing errors elsewhere are reported, not blocking. Blocks at most twice in a row, then lets Claude stop and shows you what is still failing. | Yes, up to 2 times |
| Before a shell command | Asks you to confirm force-push, `reset --hard`/`clean -fd`/`checkout -- .`, `npm publish`, `*:prod` migration/seed/deploy scripts, migration revert/reset, `schema:drop`/`schema:sync`, and destructive SQL through a database client. | Asks; you decide |
| Before writing a file | Asks before writing `.env` / `.env.*` (templates such as `.env.example` are allowed). | Asks; you decide |

The hooks use only tools already installed in your project's `node_modules/.bin`. They never run `npx` or download anything. If a tool or config is missing, that check is skipped.

### Skills

| Skill | Use it for |
|---|---|
| `/node-mentor:quality-gate` | "Is it done?" — typecheck, lint (without `--fix`), Jest, optional e2e, `npm audit`, one PASS/FAIL summary |
| `/node-mentor:new-endpoint` | Add an endpoint the way your codebase already does it: DTO validation, per-resource authorization, service, errors, OpenAPI, unit and e2e tests, then Mentor API/security review |
| `/node-mentor:debug-node` | Crashes, unhandled rejections, Nest DI errors, ESM/CJS errors, event-loop blocking, memory leaks, TypeORM pool issues, hanging Jest |
| `/node-mentor:upgrade-deps` | Planned, grouped, one-step-at-a-time upgrades (`@nestjs/*`, TypeORM, Jest/ts-jest, ESLint/typescript-eslint, TypeScript) — user-triggered only |

### Agents

| Agent | Use it for |
|---|---|
| `node-mentor:test-writer` | Writes Jest tests following your conventions, covering failure and authorization paths; never edits production code |
| `node-mentor:pr-gate` | Read-only pre-PR verdict: quality gate plus the relevant Engineering Mentor reviews, combined into Ready / Ready with notes / Blocked |

## Install

```text
/plugin marketplace add miteshpatel13/mentors-marketplace
/plugin install node-mentor@mentors-marketplace
```

This also installs `engineering-mentor` if you don't have it. The marketplace lists this plugin; its source is this repository.

Machines whose GitHub SSH key isn't set up for `git@github.com` should set `CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1` so installs and updates clone over HTTPS. Develop locally with both plugins:

```bash
claude --plugin-dir /path/to/engineering-mentor --plugin-dir /path/to/node-mentor
```

## Configuration

Set these in your shell or in the project's `.claude/settings.json` `env` block:

| Variable | Effect |
|---|---|
| `NODE_MENTOR_HOOKS=off` | Disable all node-mentor hooks |
| `NODE_MENTOR_LINT=off` | Disable lint/format on edit |
| `NODE_MENTOR_STOP_CHECKS=off` | Disable the typecheck/test check before Claude finishes |
| `NODE_MENTOR_GUARD=off` | Disable the command and `.env` guards |

Per-session state (edited files, block count) and the TypeScript incremental cache live in the plugin's data directory (`${CLAUDE_PLUGIN_DATA}`), never in your repository.

## Performance notes

- Lint on edit runs ESLint on a single file. Typed lint rules (`parserOptions.project`) make that take a few seconds.
- The stop check measured about 4–5 seconds on a small NestJS project with ts-jest. Large projects take longer on the first run; later runs reuse the incremental TypeScript cache.
- If a check times out it's reported, not blocking.

## Releases

Claude Code users receive a new release only when `version` in `.claude-plugin/plugin.json` changes, so bump it on every release (semantic versioning). Optionally tag releases with `claude plugin tag --push` (creates `node-mentor--v<version>`), which lets other plugins depend on a version range.

## Development

```bash
node --test tests/hooks.test.mjs     # 44 deterministic hook tests (stub toolchain, no installs)
claude plugin validate . --strict
```

Behavioral evals (`evals/`) need engineering-mentor loaded beside node-mentor, and eval runs load only plugins inside the plugin under test. Copy it in first (git-ignored), then run:

```bash
./scripts/prepare-evals.sh                  # copies ../engineering-mentor, or set ENGINEERING_MENTOR_DIR
claude plugin eval . --scaffold --allow-tools Write Edit --runs 1 --ablation none
```

Baseline (2026-09-30, 2 runs each): `new-endpoint-nest-invoice` 1.00, with the skill firing in both runs. `debug-node-nest-di-error` 0.67: the diagnosis was correct both times (`exports: [PaymentsClient]`), but Claude answered this well-known error directly without loading `debug-node`.

In a headless session (`claude -p`), a guard's "ask" becomes a denial because there is no one to ask. Interactively you get a confirmation prompt.
