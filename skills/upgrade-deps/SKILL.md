---
name: upgrade-deps
description: Plan and carry out npm dependency upgrades for a Node.js/TypeScript (NestJS or Express) project safely — inventory outdated and vulnerable packages, group packages that must move together (NestJS, TypeORM, Jest/ts-jest, ESLint/typescript-eslint, TypeScript), read breaking changes, upgrade one group at a time, and verify each step. Use when asked to update, upgrade, or bump dependencies, fix npm audit findings, or move to a new NestJS, Node, TypeScript, or Jest major version.
argument-hint: "[package or 'all']"
disable-model-invocation: true
---

# Upgrade Dependencies

Upgrade in small, verified steps, so any breakage points to one change.

## 1. Inventory (read-only)

- `npm outdated --json` and `npm audit --json`.
- Record the Node version in use (`node -v`, `.nvmrc`, `engines`), and the package manager (a `package-lock.json` means npm; keep using it).
- Classify each package: patch, minor, or major; dependency or devDependency; security advisory yes/no.

## 2. Group packages that move together

Upgrade these families as one unit, or they end up mismatched:

- `@nestjs/*` (core, common, platform-express, testing, cli, schematics, swagger, typeorm, config…) — same major; follow the NestJS migration guide for each major.
- `typeorm` with `@nestjs/typeorm`, and your database driver (`pg`, `mysql2`).
- `jest`, `ts-jest`, `@types/jest` — same major.
- `eslint`, `typescript-eslint` (or `@typescript-eslint/*`), and ESLint plugins. ESLint 9 needs a flat config (`eslint.config.mjs`).
- `typescript`, against the TypeScript range that `ts-jest` and `typescript-eslint` support.
- `@types/node`, matching the Node major you run on.
- `rxjs` and `reflect-metadata`, as NestJS's peer dependencies require.

## 3. Plan and confirm

Present the plan before installing anything:
- security fixes first, then patch/minor updates in one batch, then each major family as its own step;
- for each major, its breaking changes, read from the package's release notes, CHANGELOG, or migration guide — never assumed.

Installing changes `package.json` and `package-lock.json` and downloads packages, so wait for the user's go-ahead.

## 4. Execute one step at a time

1. Install with an explicit version: `npm install <pkg>@<version>` (or `npm install -D` for devDependencies). Don't use `npm update` across majors, `--force`, or `--legacy-peer-deps` unless the user accepts the peer conflict it hides.
2. Apply the code changes the migration notes require.
3. Run `/node-mentor:quality-gate`.
4. Report the step's result. Suggest a commit per step (for example `chore(deps): upgrade @nestjs/* to 11`), but don't commit unless asked.
5. If a step fails and the fix isn't clear, revert that step (`git checkout -- package.json package-lock.json`, then `npm ci`) with the user's agreement, and report what blocked it.

## Rules

- Never run `npm audit fix --force`: it installs breaking majors silently.
- A vulnerability in a devDependency that never ships to production is lower priority; say so rather than forcing a risky major.
- If an `overrides` entry is needed to patch a transitive vulnerability, explain it and add a comment in the PR description; remove it once upstream fixes it.

## Output

The upgrade table (package: from → to, type, reason), breaking changes handled per step, quality-gate result per step, anything deferred and why, and a remaining `npm audit` summary.
