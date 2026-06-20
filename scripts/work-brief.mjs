#!/usr/bin/env node
// work-brief — briefing de sessão contextual por projeto.
// Cruza: agentRules do agent-orchestrator.yaml (curado) + stack detectada
// + project-detection defaults + foco atual (.remember/now.md ou CLAUDE.md).
// Uso: node work-brief.mjs [project-path]   (default: cwd)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

const _args = process.argv.slice(2);
const promptMode = _args.includes('--prompt');   // emite o briefing como instrução p/ --append-system-prompt
const projPath = path.resolve(_args.find(a => !a.startsWith('--')) || process.cwd());
const name = path.basename(projPath);
const home = os.homedir();
const C = { d:'\x1b[2m', b:'\x1b[1m', g:'\x1b[32m', c:'\x1b[36m', y:'\x1b[33m', m:'\x1b[35m', r:'\x1b[0m' };
const ex = p => { try { fs.accessSync(p); return true; } catch { return false; } };
const rd = p => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } };

// 1. stack
const stack = [];
if (ex(path.join(projPath, 'package.json'))) stack.push('node');
if (ex(path.join(projPath, 'pyproject.toml')) || ex(path.join(projPath, 'requirements.txt'))) stack.push('python');
if (ex(path.join(projPath, 'Cargo.toml'))) stack.push('rust');
if (ex(path.join(projPath, 'go.mod'))) stack.push('go');
const git = ex(path.join(projPath, '.git'));
const stackStr = (stack.join(' · ') || 'docs') + (git ? ' · git' : '');
const isTrading = /trad|gekko|quant/i.test(name);

// 2. agents — prioridade ao agentRules curado do AO yaml
let agents = [];
let aoPrefix = '';
const yaml = rd(path.join(home, 'Claude', 'agent-orchestrator.yaml')).split('\n');
const pi = yaml.findIndex(l => /^\s*path:/.test(l) && l.includes(name));
if (pi >= 0) {
  const sp = yaml.slice(Math.max(0, pi - 8), pi + 8).find(l => /sessionPrefix:/.test(l));
  if (sp) aoPrefix = sp.split(':')[1].trim();
  const ai = yaml.findIndex((l, i) => i > pi && i < pi + 14 && /agentRules:\s*\|/.test(l));
  if (ai >= 0) {
    const ind = yaml[ai].search(/\S/);
    let block = '';
    for (let i = ai + 1; i < yaml.length; i++) { const l = yaml[i]; if (l.trim() && l.search(/\S/) <= ind) break; block += l + '\n'; }
    const m = block.match(/Specialists?\s+sugeridos?:\s*([\s\S]*?)\./i);
    if (m) agents = m[1].split(',').map(s => s.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 5);
  }
}
if (!agents.length) {
  const byStack = { python:['python-pro','code-reviewer','tdd-guide'], node:['typescript-pro','frontend-developer','code-reviewer'], rust:['rust-engineer','code-reviewer'], go:['golang-pro','code-reviewer'] };
  stack.forEach(s => (byStack[s] || []).forEach(a => agents.includes(a) || agents.push(a)));
  if (isTrading) agents.unshift('quant-analyst');
  if (/cio|booster|council|decis/i.test(name)) agents = ['critic', 'analyst', 'planner', ...agents];
  if (!agents.length) agents = ['explore', 'code-reviewer'];
  agents = agents.slice(0, 5);
}

// 3. skills / plugins / mcps
const skills = new Set(['recheck', 'verification-before-completion']);
if (stack.includes('python') || stack.includes('node')) { skills.add('tdd'); skills.add('diagnosing-bugs'); }
if (isTrading) skills.add('first-principles');
if (/cio|booster|council|decis/i.test(name)) { skills.add('llm-council'); skills.add('grilling'); }
const plugins = ['context-mode', 'github'];
const mcps = ['nox-mem'];
try { const t = execSync('gortex status 2>/dev/null', { encoding: 'utf8', timeout: 1500 }); if (t.includes(name)) mcps.push('gortex'); } catch {}

// 4. foco atual — busca flexível (nome de arquivo NÃO é fixo).
// Tenta candidatos em ordem de prioridade; pega a 1ª "linha de substância"
// do primeiro arquivo que existir e tiver conteúdo. Mostra a fonte.
// Pra mudar a prioridade/adicionar fonte: edite FOCUS_SOURCES abaixo.
const firstSubstance = (text, sectionRe) => {
  let lines = text.split('\n');
  if (sectionRe) { const i = lines.findIndex(l => sectionRe.test(l)); lines = i >= 0 ? lines.slice(i + 1) : []; }
  for (const raw of lines) {
    const l = raw.replace(/^[#>\-*\s✅⏳🔧📋•🚩🧭]+/, '').trim();
    if (l.length > 10 && !/^\d{1,2}:\d{2}\s*\|/.test(l) && !/^[=_-]{3,}$/.test(l) && !/^```/.test(l)) return l;
  }
  return '';
};
const FOCUS_SOURCES = [           // [arquivo, regex-de-seção (null = arquivo todo)]
  ['.remember/now.md', null],     // handoff/buffer mais recente (remember)
  ['HANDOFF.md', null],           // handoff explícito na raiz
  ['.remember/remember.md', null],
  ['STATUS.md', null],
  ['docs/STATUS.md', null],
  ['NEXT.md', null], ['TODO.md', null],
  ['CLAUDE.md', /##[^\n]*(estado|status|próximos|next|roadmap|foco|direção)/i],
  ['.remember/recent.md', null],
  ['CHANGELOG.md', /^##\s/],      // 1ª entrada de changelog
];
let focus = '', focusSrc = '';
for (const [f, re] of FOCUS_SOURCES) {
  const t = rd(path.join(projPath, f)); if (!t) continue;
  const s = firstSubstance(t, re); if (s) { focus = s.slice(0, 116); focusSrc = f; break; }
}
if (!focus) focus = '(sem handoff/estado registrado)';

// modo --prompt: briefing como INSTRUÇÃO pro system prompt do claude (cw)
if (promptMode) {
  process.stdout.write([
    `[Contexto de sessão — projeto: ${name} (${stackStr})]`,
    `Foco atual: ${focus}${focusSrc ? ` (registrado em ${focusSrc})` : ''}.`,
    `Ferramentas que costumam fazer sentido neste projeto — use quando a tarefa pedir, não force:`,
    `- agents preferenciais: ${agents.join(', ')}`,
    `- skills relevantes: ${[...skills].join(', ')}`,
    `- plugins: ${plugins.join(', ')}; MCPs: ${mcps.join(', ')}`,
    `Responda em português (São Paulo, "você").`,
  ].join('\n'));
  process.exit(0);
}

// render
console.log('');
console.log(`${C.b}${C.c}🎯 ${name}${C.r}  ${C.d}[${stackStr}]${C.r}`);
console.log(`${C.g}  agents${C.r}   ${agents.join(' · ')}`);
console.log(`${C.y}  skills${C.r}   ${[...skills].join(' · ')}`);
console.log(`${C.m}  plugins${C.r}  ${plugins.join(' · ')}   ${C.d}mcp:${C.r} ${mcps.join(' · ')}`);
if (git) console.log(`${C.d}  ao       ao status ${aoPrefix || name.toLowerCase()}  |  ao spawn ${aoPrefix || '<proj>'} <issue>   (sob demanda)${C.r}`);
console.log(`${C.d}  ▸ foco   ${focus}${focusSrc ? `  ${C.d}‹${focusSrc}›` : ''}${C.r}`);
console.log('');
