#!/usr/bin/env node
// SubagentStart hook — injects a compact session brief when an architecture/planning
// agent spawns, so it doesn't have to re-discover branch state, recent history, or
// modified areas before thinking.
//
// Injects only for agents whose name matches high-reasoning patterns (opus tier).
// Keeps the brief under ~400 tokens to stay cheap.
//
// Input (stdin, JSON): { agent_name?, agent_type?, cwd?, ... }
// Output (stdout, JSON): { hookSpecificOutput: { hookEventName, additionalContext } }

import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

// ─── read stdin ──────────────────────────────────────────────────────────
let raw = '';
try { raw = readFileSync(0, 'utf8'); } catch { process.exit(0); }
let input;
try { input = JSON.parse(raw); } catch { process.exit(0); }

const name = (input.agent_name || input.agent_type || input.subagent_type || '').toLowerCase();
const cwd = input.cwd || process.cwd();

// ─── filter: only inject for heavy-reasoning agents ──────────────────────
const HEAVY = /architect|planner|analyst|critic|orchestrator|coordinator|researcher|strategist|advisor|reviewer/;
if (!HEAVY.test(name)) {
  process.exit(0); // no-op for light agents
}

// ─── gather a compact session brief ──────────────────────────────────────
function git(args, fallback = '') {
  try {
    return execSync(`git -C "${cwd}" ${args}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 2000,
    }).trim();
  } catch {
    return fallback;
  }
}

const branch = git('rev-parse --abbrev-ref HEAD', 'unknown');
const recent = git('log --oneline -5', '(no log)');
const dirty = git('status --short', '').split('\n').filter(Boolean);
const dirtyCount = dirty.length;

// Top 3 dir names touched in working tree (first path segment of each modified file)
const topDirs = {};
for (const line of dirty.slice(0, 60)) {
  const path = line.slice(3).trim();
  const first = path.split('/')[0] || path;
  topDirs[first] = (topDirs[first] || 0) + 1;
}
const top3 = Object.entries(topDirs)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 3)
  .map(([d, n]) => `${d}(${n})`)
  .join(' · ');

// CLAUDE.md headings only (h1/h2/h3), skipping body — gives the agent a map
let claudeMap = '';
const claudePath = join(cwd, 'CLAUDE.md');
if (existsSync(claudePath)) {
  try {
    const c = readFileSync(claudePath, 'utf8');
    const headings = c.split('\n').filter(l => /^#{1,3}\s/.test(l)).slice(0, 15);
    if (headings.length) {
      claudeMap = '\n\n**CLAUDE.md sections:**\n' + headings.join('\n');
    }
  } catch {}
}

// ─── assemble brief ──────────────────────────────────────────────────────
const brief = [
  `## Session Brief (injected by SubagentStart hook)`,
  ``,
  `You are running as \`${name}\` on this session.`,
  ``,
  `- **Branch:** \`${branch}\``,
  `- **Uncommitted:** ${dirtyCount} file(s)${top3 ? ` — focus: ${top3}` : ''}`,
  `- **Recent commits:**`,
  recent.split('\n').map(l => '  - `' + l + '`').join('\n'),
  claudeMap,
].filter(Boolean).join('\n');

// ─── emit ────────────────────────────────────────────────────────────────
process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SubagentStart',
    additionalContext: brief,
  },
}));
