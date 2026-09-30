#!/usr/bin/env node
// PostToolUse(Write|Edit): format and lint the one file Claude just changed, using
// the project's own Prettier and ESLint (legacy .eslintrc or flat config). Errors
// ESLint can't fix are handed back to Claude (exit 2) so it fixes them now rather
// than at review time. The file is also recorded for the Stop checks.
import {
  findPackageRoot, hasEslintConfig, hasPrettierConfig, hooksDisabled, isLintableCode, isMain,
  loadState, localBin, readInput, readPackageJson, run, saveState, targetFile, truncate,
} from './lib/hook-io.mjs';

export function lintFile(file, limit) {
  const root = findPackageRoot(file, limit);
  if (!root) return { status: 'no-package' };
  const pkg = readPackageJson(root);

  const prettier = localBin(root, 'prettier');
  if (prettier && hasPrettierConfig(root, pkg)) {
    run(prettier, ['--write', '--log-level', 'warn', file], root, 20_000);
  }

  const eslint = localBin(root, 'eslint');
  if (!eslint || !hasEslintConfig(root, pkg)) return { status: 'no-eslint', root };

  const r = run(eslint, ['--fix', '--no-warn-ignored', file], root, 45_000);
  // --no-warn-ignored exists only in ESLint 9 flat config; retry without it on older versions.
  const res = r.status === 2 && /no-warn-ignored/.test(r.output)
    ? run(eslint, ['--fix', file], root, 45_000)
    : r;
  if (res.timedOut) return { status: 'timeout', root };
  if (res.status === 0) return { status: 'clean', root };
  if (res.status === 1) return { status: 'errors', root, output: truncate(res.output) };
  return { status: 'eslint-failed', root, output: truncate(res.output, 15) };
}

if (isMain(import.meta.url)) {
  if (hooksDisabled('LINT')) process.exit(0);
  const input = readInput();
  const file = targetFile(input);
  if (!file || !isLintableCode(file) || input.success === false) process.exit(0);

  const limit = process.env.CLAUDE_PROJECT_DIR || input.cwd;
  const state = loadState(input.session_id);
  if (!state.edited.includes(file)) state.edited.push(file);
  // A new edit re-arms the Stop checks (they run and report again), but the block
  // counter only resets when the checks pass, so edit → block → edit can't loop forever.
  state.gaveUp = false;
  saveState(input.session_id, state);

  const result = lintFile(file, limit);
  if (result.status === 'errors') {
    process.stderr.write(`node-mentor: ESLint found problems it could not auto-fix in ${file}. Fix them before moving on:\n${result.output}\n`);
    process.exit(2);
  }
  if (result.status === 'eslint-failed') {
    // A broken ESLint setup is the project's problem, not this edit's: report without blocking.
    process.stderr.write(`node-mentor: ESLint could not run on ${file} (check the project's ESLint setup):\n${result.output}\n`);
    process.exit(1);
  }
  process.exit(0);
}
