// Shared helpers for node-mentor hooks. Dependency-free: runs on the Node.js
// the project already uses. Never downloads anything — tools are used only when
// the project has them installed in node_modules/.bin.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

/** True when the calling module is the process entry point (robust to spaces in paths). */
export function isMain(metaUrl) {
  return Boolean(process.argv[1]) && metaUrl === pathToFileURL(process.argv[1]).href;
}

export const CODE_FILE = /\.(c|m)?(t|j)sx?$/;
const SKIPPED_DIR = /(^|[\\/])(node_modules|dist|build|coverage|\.git)([\\/]|$)/;

export function hooksDisabled(name) {
  const all = (process.env.NODE_MENTOR_HOOKS || '').toLowerCase();
  const one = (process.env[`NODE_MENTOR_${name}`] || '').toLowerCase();
  return all === 'off' || all === '0' || one === 'off' || one === '0';
}

export function readInput() {
  try {
    const raw = readFileSync(0, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Absolute path of a file an Edit/Write targeted, or null. */
export function targetFile(input) {
  const p = input?.tool_input?.file_path;
  if (typeof p !== 'string' || !p) return null;
  return resolve(input.cwd || process.cwd(), p);
}

export function isLintableCode(file) {
  return CODE_FILE.test(file) && !SKIPPED_DIR.test(file) && !/\.d\.[cm]?ts$/.test(file);
}

/** Nearest directory at or above `start` that holds a package.json, not above `limit`. */
export function findPackageRoot(start, limit) {
  let dir = resolve(start);
  const stop = limit ? resolve(limit) : null;
  for (;;) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    const parent = dirname(dir);
    if (parent === dir || (stop && !(dir + sep).startsWith(stop + sep))) return null;
    dir = parent;
  }
}

export function readPackageJson(root) {
  try {
    return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  } catch {
    return {};
  }
}

export function localBin(root, name) {
  const candidates = process.platform === 'win32' ? [`${name}.cmd`, name] : [name];
  for (const c of candidates) {
    const p = join(root, 'node_modules', '.bin', c);
    if (existsSync(p)) return p;
  }
  return null;
}

const ESLINT_CONFIGS = [
  'eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs', 'eslint.config.ts', 'eslint.config.mts', 'eslint.config.cts',
  '.eslintrc', '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc.yaml', '.eslintrc.yml',
];
const PRETTIER_CONFIGS = [
  '.prettierrc', '.prettierrc.json', '.prettierrc.yaml', '.prettierrc.yml', '.prettierrc.json5', '.prettierrc.js',
  '.prettierrc.cjs', '.prettierrc.mjs', '.prettierrc.toml', 'prettier.config.js', 'prettier.config.cjs', 'prettier.config.mjs',
];

export function hasEslintConfig(root, pkg) {
  return ESLINT_CONFIGS.some((f) => existsSync(join(root, f))) || Boolean(pkg.eslintConfig);
}

export function hasPrettierConfig(root, pkg) {
  return PRETTIER_CONFIGS.some((f) => existsSync(join(root, f))) || Boolean(pkg.prettier);
}

export function run(cmd, args, cwd, timeoutMs) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 16 * 1024 * 1024, shell: process.platform === 'win32' });
  return {
    status: r.status,
    timedOut: r.error?.code === 'ETIMEDOUT' || r.signal === 'SIGTERM',
    error: r.error && r.error.code !== 'ETIMEDOUT' ? r.error.message : null,
    output: `${r.stdout || ''}${r.stderr || ''}`,
  };
}

export function truncate(text, maxLines = 40) {
  const lines = text.trim().split('\n');
  if (lines.length <= maxLines) return lines.join('\n');
  return `${lines.slice(0, maxLines).join('\n')}\n… (${lines.length - maxLines} more lines)`;
}

// Per-session state: which files Claude edited, and how many times Stop blocked.
function stateDir() {
  const base = process.env.CLAUDE_PLUGIN_DATA || join(tmpdir(), 'node-mentor');
  const dir = join(base, 'sessions');
  mkdirSync(dir, { recursive: true });
  return dir;
}

function statePath(sessionId) {
  const key = createHash('sha256').update(String(sessionId || 'no-session')).digest('hex').slice(0, 24);
  return join(stateDir(), `${key}.json`);
}

export function loadState(sessionId) {
  try {
    return { edited: [], stopBlocks: 0, ...JSON.parse(readFileSync(statePath(sessionId), 'utf8')) };
  } catch {
    return { edited: [], stopBlocks: 0 };
  }
}

export function saveState(sessionId, state) {
  try {
    writeFileSync(statePath(sessionId), JSON.stringify(state));
  } catch {
    /* state is best-effort; hooks must never fail a tool call because of it */
  }
}

export function clearState(sessionId) {
  rmSync(statePath(sessionId), { force: true });
}

export function tsBuildInfoPath(root) {
  const key = createHash('sha256').update(root).digest('hex').slice(0, 16);
  return join(stateDir(), '..', `tsbuildinfo-${key}`);
}

export function emit(obj) {
  process.stdout.write(JSON.stringify(obj));
}
