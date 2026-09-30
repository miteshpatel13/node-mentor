#!/usr/bin/env node
// Stop: before Claude reports it's done, typecheck the project and run the Jest
// tests related to the files Claude edited this session. Only problems in those
// files block the stop, so pre-existing errors elsewhere don't trap Claude; they
// are reported instead. Blocks at most MAX_BLOCKS times in a row, then lets Claude
// stop and tells the user what is still failing.
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import {
  clearState, emit, findPackageRoot, hooksDisabled, isMain, loadState, localBin, readInput,
  readPackageJson, run, saveState, truncate, tsBuildInfoPath,
} from './lib/hook-io.mjs';

const MAX_BLOCKS = 2;
const JEST_CONFIGS = ['jest.config.js', 'jest.config.ts', 'jest.config.mjs', 'jest.config.cjs', 'jest.config.json'];
const TS_ERROR = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/;

export function typecheck(root, editedFiles) {
  const tsc = localBin(root, 'tsc');
  if (!tsc || !existsSync(join(root, 'tsconfig.json'))) return { ran: false };
  const r = run(tsc, ['--noEmit', '-p', 'tsconfig.json', '--pretty', 'false', '--incremental', '--tsBuildInfoFile', tsBuildInfoPath(root)], root, 120_000);
  if (r.timedOut) return { ran: true, timedOut: true };
  if (r.status === 0) return { ran: true, ok: true };
  const edited = new Set(editedFiles.map((f) => resolve(f)));
  const inEdited = [];
  let elsewhere = 0;
  for (const line of r.output.split('\n')) {
    const m = TS_ERROR.exec(line.trim());
    if (!m) continue;
    if (edited.has(resolve(root, m[1]))) inEdited.push(line.trim());
    else elsewhere += 1;
  }
  if (!inEdited.length && !elsewhere) {
    // tsc failed without per-file errors: a configuration problem, not this change.
    return { ran: true, setupError: truncate(r.output, 10) };
  }
  return { ran: true, ok: inEdited.length === 0, inEdited, elsewhere };
}

export function relatedTests(root, editedFiles) {
  const jest = localBin(root, 'jest');
  const pkg = readPackageJson(root);
  const configured = Boolean(pkg.jest) || JEST_CONFIGS.some((f) => existsSync(join(root, f)));
  if (!jest || !configured) return { ran: false };
  const r = run(jest, ['--ci', '--passWithNoTests', '--findRelatedTests', ...editedFiles], root, 150_000);
  if (r.timedOut) return { ran: true, timedOut: true };
  if (r.status === 0) return { ran: true, ok: true };
  const lines = r.output.trim().split('\n');
  const failing = lines.filter((l) => /^\s*(FAIL|●)/.test(l)).slice(0, 25);
  const summary = lines.filter((l) => /^(Tests|Test Suites):/.test(l.trim()));
  return { ran: true, ok: false, detail: [...failing, ...summary].join('\n') || truncate(r.output, 30) };
}

export function checkRoot(root, files) {
  const problems = [];
  const notes = [];
  const tc = typecheck(root, files);
  if (tc.timedOut) notes.push('typecheck timed out (not blocking)');
  else if (tc.setupError) notes.push(`tsc could not run cleanly (not blocking):\n${tc.setupError}`);
  else if (tc.ran && !tc.ok) problems.push(`Type errors in files you changed:\n${truncate(tc.inEdited.join('\n'), 30)}`);
  if (tc.elsewhere) notes.push(`${tc.elsewhere} type error(s) in files this session didn't touch (pre-existing or knock-on; not blocking)`);

  const jt = relatedTests(root, files);
  if (jt.timedOut) notes.push('related Jest tests timed out (not blocking)');
  else if (jt.ran && !jt.ok) problems.push(`Related Jest tests are failing:\n${jt.detail}`);
  return { problems, notes };
}

if (isMain(import.meta.url)) {
  if (hooksDisabled('STOP_CHECKS')) process.exit(0);
  const input = readInput();
  const state = loadState(input.session_id);
  if (state.gaveUp) process.exit(0);
  const files = (state.edited || []).filter((f) => existsSync(f));
  if (!files.length) process.exit(0);

  const limit = process.env.CLAUDE_PROJECT_DIR || input.cwd;
  const byRoot = new Map();
  for (const f of files) {
    const root = findPackageRoot(f, limit);
    if (!root) continue;
    byRoot.set(root, [...(byRoot.get(root) || []), f]);
  }

  const problems = [];
  const notes = [];
  for (const [root, rootFiles] of byRoot) {
    const res = checkRoot(root, rootFiles);
    const label = byRoot.size > 1 ? `[${relative(limit || root, root) || '.'}] ` : '';
    problems.push(...res.problems.map((p) => label + p));
    notes.push(...res.notes.map((n) => label + n));
  }

  if (!problems.length) {
    clearState(input.session_id);
    if (notes.length) emit({ systemMessage: `node-mentor: typecheck and related tests passed for changed files. ${notes.join('; ')}` });
    process.exit(0);
  }

  if ((state.stopBlocks || 0) < MAX_BLOCKS) {
    state.stopBlocks = (state.stopBlocks || 0) + 1;
    saveState(input.session_id, state);
    emit({
      decision: 'block',
      reason: `node-mentor checks failed (attempt ${state.stopBlocks} of ${MAX_BLOCKS}). Fix these before finishing, or explain why they can't be fixed:\n\n${problems.join('\n\n')}${notes.length ? `\n\nAlso: ${notes.join('; ')}` : ''}`,
    });
    process.exit(0);
  }

  state.gaveUp = true;
  saveState(input.session_id, state);
  emit({ systemMessage: `node-mentor: still failing after ${MAX_BLOCKS} fix attempts — review before merging:\n${problems.join('\n\n')}` });
  process.exit(0);
}
