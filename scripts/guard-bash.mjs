#!/usr/bin/env node
// PreToolUse(Bash): ask the user before commands that can destroy work, data, or
// a published package. Nothing is denied outright — the user decides — and every
// other command falls through to the normal permission flow.
import { emit, hooksDisabled, isMain, readInput } from './lib/hook-io.mjs';

export const RULES = [
  { id: 'force-push', re: /\bgit\s+push\b(?=[^\n;&|]*(?:\s--force(?!-with-lease)\b|\s-[a-zA-Z]*f\b|\s\+\S))/, why: 'force-pushes and can overwrite remote history (use --force-with-lease if it is really needed)' },
  { id: 'git-discard', re: /\bgit\s+(?:reset\s+--hard\b|clean\s+-[a-zA-Z]*[fdx]|checkout\s+(?:--\s+)?\.(?:\s|$)|restore\s+(?:--\S+\s+)*\.(?:\s|$))/, why: 'discards uncommitted work in the working tree' },
  { id: 'publish', re: /\b(?:npm|pnpm|yarn)\s+publish\b/, why: 'publishes a package to a registry' },
  { id: 'prod-db-script', re: /\b(?:npm|pnpm|yarn)\s+(?:run\s+)?(?:run-script\s+)?[\w:.-]*(?:migrat|seed|schema|db|deploy)[\w:.-]*:(?:prod|production)\b/i, why: 'runs a database/deploy script against production' },
  { id: 'migration-revert', re: /\b(?:migration:revert|migrate[\s:]+(?:reset|down|rollback)|db\s+push\s+[^\n;&|]*--(?:force-reset|accept-data-loss))\b/, why: 'reverts or resets database migrations and can drop data' },
  { id: 'schema-drop', re: /\bschema:(?:drop|sync)\b|\bdropSchema\b/, why: 'drops or force-synchronizes the database schema' },
  { id: 'sql-drop', re: /\b(?:psql|mysql|mariadb|sqlite3?|mongosh|typeorm|prisma|knex|sequelize)\b[\s\S]*\b(?:DROP\s+(?:DATABASE|SCHEMA|TABLE)|TRUNCATE\s+(?:TABLE\s+)?\w|dropDatabase\(\))/i, why: 'runs a destructive statement through a database client' },
];

export function evaluate(command) {
  if (typeof command !== 'string') return null;
  return RULES.find((r) => r.re.test(command)) || null;
}

if (isMain(import.meta.url)) {
  if (hooksDisabled('GUARD')) process.exit(0);
  const input = readInput();
  const hit = evaluate(input?.tool_input?.command);
  if (hit) {
    emit({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `node-mentor: this command ${hit.why}. Confirm only if you intend it. (rule: ${hit.id})`,
      },
    });
  }
  process.exit(0);
}
