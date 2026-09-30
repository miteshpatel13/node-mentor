#!/usr/bin/env node
// PreToolUse(Write|Edit): ask before Claude writes an environment file, which
// typically holds real credentials. Example/template env files are allowed.
import { basename } from 'node:path';
import { emit, hooksDisabled, isMain, readInput, targetFile } from './lib/hook-io.mjs';

const TEMPLATE = /\.(example|sample|template|dist|defaults)$/i;

export function isSecretEnvFile(file) {
  if (!file) return false;
  const name = basename(file);
  return (name === '.env' || name.startsWith('.env.')) && !TEMPLATE.test(name);
}

if (isMain(import.meta.url)) {
  if (hooksDisabled('GUARD')) process.exit(0);
  const input = readInput();
  const file = targetFile(input);
  if (isSecretEnvFile(file)) {
    emit({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `node-mentor: ${basename(file)} usually holds real credentials. Prefer updating .env.example and letting the developer fill in values. Confirm only if you intend this write.`,
      },
    });
  }
  process.exit(0);
}
