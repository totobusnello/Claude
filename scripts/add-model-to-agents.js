#!/usr/bin/env node
// Add `model:` frontmatter field to agents that are missing it.
// Routing matches the CLAUDE.md policy: haiku (cheap) / sonnet (default) / opus (heavy reasoning).
// Usage: node scripts/add-model-to-agents.js [--dry-run]

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'agents');
const DRY = process.argv.includes('--dry-run');

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (f.name.endsWith('.md') && !/README/i.test(f.name)) out.push(p);
  }
  return out;
}

function classify(filePath) {
  const name = path.basename(filePath, '.md');

  // OPUS: heavy reasoning, architecture, strategy, research, planning
  if (/architect$|^architect-|^planner$|^analyst$|^critic$|-high$/.test(name)) return 'opus';
  if (/^(cs-|cpo-)?(ceo|cto|cfo)-advisor$/.test(name)) return 'opus';
  if (/coordinator$|orchestrator$/.test(name) && !/installer/.test(name)) return 'opus';
  if (/^(market-researcher|research-analyst|competitive-analyst|trend-analyst|risk-manager|quant-analyst|llm-architect|data-analyst|business-analyst|customer-success-manager)$/.test(name)) return 'opus';

  // Default: sonnet
  return 'sonnet';
}

function addModel(content, model) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fmMatch) return null; // no frontmatter, skip
  const fmBody = fmMatch[1];
  if (/^model:\s*/m.test(fmBody)) return null; // already has model

  // Insert `model:` after `name:` (or at end of frontmatter if no name)
  let newFm;
  if (/^name:\s*/m.test(fmBody)) {
    newFm = fmBody.replace(/(^name:.*$)/m, `$1\nmodel: ${model}`);
  } else {
    newFm = fmBody + `\nmodel: ${model}`;
  }
  return content.replace(fmMatch[0], `---\n${newFm}\n---\n`);
}

const files = walk(AGENTS_DIR);
const report = { haiku: 0, sonnet: 0, opus: 0, skipped: 0, noFm: 0 };
const changed = [];

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const model = classify(f);
  const updated = addModel(content, model);
  if (updated === null) {
    if (!/^---/.test(content)) report.noFm++;
    else report.skipped++;
    continue;
  }
  report[model]++;
  changed.push({ file: f, model });
  if (!DRY) fs.writeFileSync(f, updated);
}

console.log(DRY ? '=== DRY RUN ===' : '=== APPLIED ===');
console.log(`opus:    ${report.opus}`);
console.log(`sonnet:  ${report.sonnet}`);
console.log(`haiku:   ${report.haiku}`);
console.log(`skipped: ${report.skipped} (already had model)`);
console.log(`no fm:   ${report.noFm}`);
console.log(`\nTotal changed: ${changed.length}`);

if (DRY) {
  console.log('\n--- OPUS ---');
  changed.filter(c => c.model === 'opus').forEach(c => console.log('  ' + c.file.replace(AGENTS_DIR, '')));
  console.log('\n--- SONNET (first 15) ---');
  changed.filter(c => c.model === 'sonnet').slice(0, 15).forEach(c => console.log('  ' + c.file.replace(AGENTS_DIR, '')));
}
