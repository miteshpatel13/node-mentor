// Deterministic tests for node-mentor's hook scripts. Run: node --test tests/
// Fixture projects use stub eslint/tsc/jest/prettier binaries, so no packages are
// installed and no network is used.
import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { evaluate } from '../scripts/guard-bash.mjs';
import { isSecretEnvFile } from '../scripts/guard-files.mjs';
import { lintFile } from '../scripts/lint-changed-file.mjs';
import { checkRoot } from '../scripts/stop-checks.mjs';

const SCRIPTS = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts');
const tmpRoots = [];
after(() => tmpRoots.forEach((d) => rmSync(d, { recursive: true, force: true })));

function stub(root, name, body) {
  const p = join(root, 'node_modules', '.bin', name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, `#!/usr/bin/env node\nconst fs = require('fs');\nconst args = process.argv.slice(2);\n${body}\n`);
  chmodSync(p, 0o755);
}

function project({ eslint = true, legacyEslint = false, prettier = true, tsc = true, jest = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'node-mentor-fixture-'));
  tmpRoots.push(root);
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture', jest: jest ? { testRegex: '.*\\.spec\\.ts$' } : undefined }));
  writeFileSync(join(root, 'tsconfig.json'), '{}');
  mkdirSync(join(root, 'src'));
  if (eslint) {
    writeFileSync(join(root, legacyEslint ? '.eslintrc.js' : 'eslint.config.mjs'), 'export default [];\n');
    stub(root, 'eslint', `
      if (${legacyEslint} && args.includes('--no-warn-ignored')) { console.error("Invalid option '--no-warn-ignored'"); process.exit(2); }
      const file = args[args.length - 1];
      if (fs.readFileSync(file, 'utf8').includes('LINT_ERROR')) { console.log(file + '\\n  1:1  error  no-unused-vars'); process.exit(1); }
      process.exit(0);`);
  }
  if (prettier) {
    writeFileSync(join(root, '.prettierrc'), '{}');
    stub(root, 'prettier', `fs.appendFileSync(${JSON.stringify(join(root, 'prettier.log'))}, args.join(' ') + '\\n');`);
  }
  if (tsc) {
    stub(root, 'tsc', `
      const out = [];
      for (const f of fs.readdirSync('src')) {
        if (fs.readFileSync('src/' + f, 'utf8').includes('TYPE_ERROR')) out.push('src/' + f + "(3,7): error TS2322: Type 'string' is not assignable to type 'number'.");
      }
      if (out.length) { console.log(out.join('\\n')); process.exit(2); }
      process.exit(0);`);
  }
  if (jest) {
    stub(root, 'jest', `
      const files = args.slice(args.indexOf('--findRelatedTests') + 1);
      const failing = files.filter((f) => fs.readFileSync(f, 'utf8').includes('TEST_FAIL'));
      if (failing.length) { console.log('FAIL src/app.spec.ts\\n  ● AppService › returns total\\nTests:       1 failed, 3 passed, 4 total'); process.exit(1); }
      console.log('Tests:       4 passed, 4 total'); process.exit(0);`);
  }
  return root;
}

function file(root, name, content) {
  const p = join(root, 'src', name);
  writeFileSync(p, content);
  return p;
}

function runHook(script, input, env = {}) {
  return spawnSync(process.execPath, [join(SCRIPTS, script)], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PLUGIN_DATA: env.CLAUDE_PLUGIN_DATA, ...env },
  });
}

describe('guard-bash', () => {
  const cases = [
    ['git push --force origin main', 'force-push'],
    ['git push -f', 'force-push'],
    ['git push origin +main', 'force-push'],
    ['git push --force-with-lease origin feature/x', null],
    ['git push -u origin feature/fix-auth', null],
    ['git reset --hard HEAD~1', 'git-discard'],
    ['git clean -fd', 'git-discard'],
    ['git checkout -- .', 'git-discard'],
    ['git checkout feature/x', null],
    ['npm publish --access public', 'publish'],
    ['npm run migration:run:prod', 'prod-db-script'],
    ['npm run seed:prod', 'prod-db-script'],
    ['npm run start:prod', null],
    ['npm run migration:run', null],
    ['npm run migration:revert', 'migration-revert'],
    ['npx prisma migrate reset', 'migration-revert'],
    ['npx knex migrate:rollback', 'migration-revert'],
    ['npx typeorm schema:drop -d src/data-source.ts', 'schema-drop'],
    ['psql "$DATABASE_URL" -c "DROP TABLE users"', 'sql-drop'],
    ['truncate -s 0 app.log', null],
    ['npm test', null],
    ['npm run lint && npm run build', null],
  ];
  for (const [cmd, expected] of cases) {
    test(`${expected ?? 'allowed'}: ${cmd}`, () => assert.equal(evaluate(cmd)?.id ?? null, expected));
  }

  test('asks (does not deny) through the hook protocol', () => {
    const r = runHook('guard-bash.mjs', { tool_input: { command: 'npm publish' } });
    assert.equal(r.status, 0);
    assert.equal(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision, 'ask');
  });

  test('prints nothing for safe commands', () => {
    const r = runHook('guard-bash.mjs', { tool_input: { command: 'npm test' } });
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });
});

describe('guard-files', () => {
  for (const [p, expected] of [
    ['/app/.env', true], ['/app/.env.local', true], ['/app/.env.production', true],
    ['/app/.env.example', false], ['/app/.env.sample', false], ['/app/src/env.ts', false], ['/app/.envrc', false],
  ]) {
    test(`${p} → ${expected}`, () => assert.equal(isSecretEnvFile(p), expected));
  }
});

describe('lint-changed-file', () => {
  test('clean file passes, prettier runs first', () => {
    const root = project();
    const f = file(root, 'ok.ts', 'export const a = 1;\n');
    assert.equal(lintFile(f, root).status, 'clean');
    assert.match(readFileSync(join(root, 'prettier.log'), 'utf8'), /--write/);
  });

  test('unfixable lint errors are reported', () => {
    const root = project();
    const f = file(root, 'bad.ts', '// LINT_ERROR\n');
    const r = lintFile(f, root);
    assert.equal(r.status, 'errors');
    assert.match(r.output, /no-unused-vars/);
  });

  test('ESLint 8 legacy config: retries without --no-warn-ignored', () => {
    const root = project({ legacyEslint: true });
    const f = file(root, 'ok.ts', 'export const a = 1;\n');
    assert.equal(lintFile(f, root).status, 'clean');
  });

  test('no ESLint installed or configured → skipped', () => {
    const root = project({ eslint: false, prettier: false });
    assert.equal(lintFile(file(root, 'x.ts', 'x'), root).status, 'no-eslint');
  });

  test('hook exits 2 with feedback on errors and records the file', () => {
    const root = project();
    const data = mkdtempSync(join(tmpdir(), 'node-mentor-data-'));
    tmpRoots.push(data);
    const f = file(root, 'bad.ts', '// LINT_ERROR\n');
    const r = runHook('lint-changed-file.mjs', { session_id: 's1', cwd: root, tool_input: { file_path: f } }, { CLAUDE_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: root });
    assert.equal(r.status, 2);
    assert.match(r.stderr, /could not auto-fix/);
  });

  test('non-code files are ignored', () => {
    const r = runHook('lint-changed-file.mjs', { session_id: 's1', tool_input: { file_path: '/tmp/README.md' } });
    assert.equal(r.status, 0);
  });
});

describe('stop-checks', () => {
  test('passes when typecheck and related tests pass', () => {
    const root = project();
    const f = file(root, 'ok.ts', 'export const a = 1;\n');
    assert.deepEqual(checkRoot(root, [f]).problems, []);
  });

  test('type errors in edited files block; elsewhere only noted', () => {
    const root = project();
    const edited = file(root, 'edited.ts', '// TYPE_ERROR\n');
    file(root, 'untouched.ts', '// TYPE_ERROR\n');
    const res = checkRoot(root, [edited]);
    assert.equal(res.problems.length, 1);
    assert.match(res.problems[0], /edited\.ts\(3,7\): error TS2322/);
    assert.doesNotMatch(res.problems[0], /untouched/);
    assert.match(res.notes.join(' '), /1 type error\(s\) in files this session didn't touch/);
  });

  test('pre-existing type errors elsewhere do not block', () => {
    const root = project();
    const edited = file(root, 'edited.ts', 'export const a = 1;\n');
    file(root, 'legacy.ts', '// TYPE_ERROR\n');
    assert.deepEqual(checkRoot(root, [edited]).problems, []);
  });

  test('failing related tests block', () => {
    const root = project();
    const f = file(root, 'svc.ts', '// TEST_FAIL\n');
    const res = checkRoot(root, [f]);
    assert.match(res.problems.join('\n'), /Related Jest tests are failing[\s\S]*1 failed/);
  });

  test('blocks twice, then lets Claude stop and warns the user', () => {
    const root = project();
    const data = mkdtempSync(join(tmpdir(), 'node-mentor-data-'));
    tmpRoots.push(data);
    const env = { CLAUDE_PLUGIN_DATA: data, CLAUDE_PROJECT_DIR: root };
    const f = file(root, 'svc.ts', '// TEST_FAIL\n');
    runHook('lint-changed-file.mjs', { session_id: 's2', cwd: root, tool_input: { file_path: f } }, env);
    const first = JSON.parse(runHook('stop-checks.mjs', { session_id: 's2', cwd: root }, env).stdout);
    const second = JSON.parse(runHook('stop-checks.mjs', { session_id: 's2', cwd: root, stop_hook_active: true }, env).stdout);
    const third = JSON.parse(runHook('stop-checks.mjs', { session_id: 's2', cwd: root, stop_hook_active: true }, env).stdout);
    assert.equal(first.decision, 'block');
    assert.equal(second.decision, 'block');
    assert.equal(third.decision, undefined);
    assert.match(third.systemMessage, /still failing after 2 fix attempts/);
    const fourth = runHook('stop-checks.mjs', { session_id: 's2', cwd: root }, env);
    assert.equal(fourth.stdout, '', 'gave up: later stops stay quiet until the next edit');
  });

  test('no edits this session → no checks', () => {
    const data = mkdtempSync(join(tmpdir(), 'node-mentor-data-'));
    tmpRoots.push(data);
    const r = runHook('stop-checks.mjs', { session_id: 'none' }, { CLAUDE_PLUGIN_DATA: data });
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
  });

  test('NODE_MENTOR_HOOKS=off disables everything', () => {
    const r = runHook('guard-bash.mjs', { tool_input: { command: 'npm publish' } }, { NODE_MENTOR_HOOKS: 'off' });
    assert.equal(r.stdout, '');
  });
});
