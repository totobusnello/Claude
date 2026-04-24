#!/usr/bin/env node
// PermissionRequest hook — auto-allow/deny tool calls based on pattern rules.
// Fired by Claude Code before permission UI. Returning {"decision": "allow"|"deny"}
// short-circuits the prompt. Returning nothing (or {"decision": "ask"}) falls
// through to the normal allowlist + user prompt.
//
// Philosophy: allow only when pattern is obviously safe. Deny only when
// obviously dangerous. When in doubt — ASK (let the user/allowlist decide).
//
// Input (stdin, JSON): { tool_name, tool_input, cwd, ... }
// Output (stdout, JSON): { decision: "allow" | "deny" | "ask", reason?: string }

import { readFileSync } from 'node:fs';

// ─── read stdin ──────────────────────────────────────────────────────────
let raw = '';
try { raw = readFileSync(0, 'utf8'); } catch { process.exit(0); }
let input;
try { input = JSON.parse(raw); } catch { process.exit(0); }

const toolName = input.tool_name || '';
const toolInput = input.tool_input || {};

// ─── helpers ─────────────────────────────────────────────────────────────
function emit(decision, reason) {
  process.stdout.write(JSON.stringify({ decision, reason }));
  process.exit(0);
}

function insideHome(p) {
  if (typeof p !== 'string') return false;
  const home = process.env.HOME || '/Users/lab';
  return p.startsWith(home) || p.startsWith('~');
}

function insideSafe(p) {
  // Safe zones = user's workspace and /tmp
  if (typeof p !== 'string') return false;
  const home = process.env.HOME || '/Users/lab';
  return p.startsWith(`${home}/Claude`) ||
         p.startsWith(`${home}/.claude/hooks`) ||
         p.startsWith('/tmp/') ||
         p.startsWith('~/Claude') ||
         p.startsWith('./');
}

// ─── MCP tool rules ──────────────────────────────────────────────────────
// Auto-allow read-only MCP tools by name convention.
if (toolName.startsWith('mcp__')) {
  const readOnlyPatterns = [
    /search$/i, /read$/i, /get$/i, /list$/i, /view$/i, /fetch/i, /query/i,
    /status$/i, /describe/i, /inspect/i, /stats$/i, /doctor$/i, /outline/i,
    /ctx_execute/i, /ctx_batch_execute/i, /ctx_fetch_and_index/i, /ctx_index/i,
    /ctx_search/i, /smart_/i, /timeline$/i, /get_observations/i,
  ];
  const mutatingPatterns = [
    /delete/i, /remove/i, /drop/i, /purge/i, /destroy/i, /reset/i,
    /create/i, /update/i, /upsert/i, /write/i, /insert/i, /patch/i,
    /deploy/i, /apply/i, /merge/i, /push/i, /send/i, /reply/i,
    /confirm/i, /restore/i, /pause/i, /rebase/i, /schedule/i,
  ];
  if (mutatingPatterns.some(r => r.test(toolName))) {
    emit('ask', `MCP mutating-like name: ${toolName}`);
  }
  if (readOnlyPatterns.some(r => r.test(toolName))) {
    emit('allow', `MCP read-only pattern: ${toolName}`);
  }
  // Unknown MCP — fall through
  emit('ask', `MCP not classified: ${toolName}`);
}

// ─── Native tool rules ───────────────────────────────────────────────────
if (toolName === 'Read' || toolName === 'Glob' || toolName === 'Grep') {
  emit('allow', 'read-only native tool');
}

if (toolName === 'Write' || toolName === 'Edit') {
  const p = toolInput.file_path || '';
  if (p.includes('/.claude/settings') || p.includes('settings.json')) {
    emit('ask', 'settings file edit — always confirm');
  }
  if (p.includes('/etc/') || p.includes('/usr/') || p.includes('/System/')) {
    emit('deny', 'system path write blocked');
  }
  if (insideSafe(p)) emit('allow', 'write inside ~/Claude');
  emit('ask', `write outside safe zone: ${p}`);
}

// ─── Bash rules ──────────────────────────────────────────────────────────
if (toolName === 'Bash') {
  const cmd = (toolInput.command || '').trim();

  // Hard-deny: obvious footguns
  const deny = [
    /\brm\s+-rf\s+\/(?!\w)/,          // rm -rf / or rm -rf /anything-without-slash
    /\bsudo\s+rm\s+-rf/,
    /\b(curl|wget)\s+[^|]*\|\s*(bash|sh|zsh)\b/,  // curl | bash
    /:\(\)\{.*:\|:/,                    // fork bomb
    /\bdd\s+.*of=\/dev\//,              // dd to raw device
    /\bmkfs\b/,                         // format filesystem
    /\bsudo\s+(shutdown|reboot|halt)/,
    /\bchmod\s+-R\s+777\s+\//,
    /\bgit\s+push\s+--force.*\b(main|master)\b/,
    /\bgit\s+reset\s+--hard\s+origin/,
  ];
  for (const rx of deny) {
    if (rx.test(cmd)) emit('deny', `matches deny pattern: ${rx}`);
  }

  // Parse leading command
  let s = cmd;
  while (/^[A-Z_][A-Z0-9_]*=\S*\s+/.test(s)) s = s.replace(/^\S+\s+/, '');
  s = s.split(/[|;&]/)[0].trim();
  const toks = s.split(/\s+/);
  const root = (toks[0] || '').replace(/^.*\//, '');
  const sub  = toks[1] || '';
  const pair = `${root} ${sub}`.trim();

  // Allow: git read-only
  const gitRO = ['status', 'log', 'diff', 'show', 'blame', 'branch', 'tag',
                 'remote', 'ls-files', 'ls-remote', 'rev-parse', 'describe',
                 'stash', 'reflog', 'shortlog', 'cat-file', 'for-each-ref', 'config'];
  if (root === 'git' && gitRO.includes(sub)) emit('allow', `git read-only: ${pair}`);

  // Allow: gh read-only
  const ghRO = ['pr', 'issue', 'run', 'workflow', 'repo', 'release', 'auth', 'api'];
  if (root === 'gh' && ghRO.includes(sub)) {
    // gh api could be POST — check for -X or --method
    if (sub === 'api' && /\s-X\s+(POST|PUT|DELETE|PATCH)\b/i.test(cmd)) {
      emit('ask', 'gh api with mutating method');
    }
    emit('allow', `gh read-only: ${pair}`);
  }

  // Allow: docker read-only
  if (root === 'docker' && ['ps', 'images', 'logs', 'inspect', 'version'].includes(sub)) {
    emit('allow', `docker read-only: ${pair}`);
  }

  // Allow: common safe utilities anywhere
  const safeUtils = new Set([
    'ls', 'cat', 'head', 'tail', 'wc', 'find', 'grep', 'rg', 'fd', 'jq',
    'echo', 'printf', 'pwd', 'which', 'whoami', 'hostname', 'uname', 'date',
    'df', 'du', 'file', 'stat', 'readlink', 'basename', 'dirname', 'realpath',
    'sort', 'uniq', 'cut', 'tr', 'tree', 'diff', 'sleep', 'ps', 'top', 'lsof',
    'env', 'printenv', 'tput', 'sha256sum', 'md5', 'md5sum',
  ]);
  if (safeUtils.has(root)) emit('allow', `safe utility: ${root}`);

  // Allow: mkdir, open, rsync (to local), cp within safe zones
  if (root === 'mkdir') emit('allow', 'mkdir');
  if (root === 'open') emit('allow', 'open file/app');

  // Allow: node/python when running user's own scripts in ~/Claude/scripts
  if ((root === 'node' || root === 'python' || root === 'python3' || root === 'bun') &&
      toks[1] && insideSafe(toks[1])) {
    emit('allow', `interpreter on local script: ${toks[1]}`);
  }

  // Allow: bash script inside ~/Claude
  if (root === 'bash' && toks[1] && insideSafe(toks[1])) {
    emit('allow', `bash script in safe zone: ${toks[1]}`);
  }

  // Ask for everything else (falls through to normal permission flow)
  emit('ask', `unrecognized: ${pair || root}`);
}

// Any other tool — pass through
emit('ask', `tool not classified: ${toolName}`);
