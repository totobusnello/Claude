# Instruções de Atualização — Setup Claude Code
> Gerado em 12 de Março de 2026

## Status das Atualizações

### ✅ Já Executados (arquivos locais atualizados)

| Item | De → Para | O que foi feito |
|------|-----------|-----------------|
| Trail of Bits | 12 → 37 skills | +25 novas skills instaladas em skills/ |
| ui-ux-pro-max | 50 → 67 estilos | 7 skills copiadas localmente (core + 6 novas) |
| visual-explainer | v0.4.4 → v0.6.3 | SKILL.md, templates, referências e /share command atualizados |
| context-mode | → v1.0.18 | Skill local atualizada com referências |

### ⚠️ Ações Manuais Necessárias (rodar no terminal Claude Code)

#### 1. Atualizar plugin ui-ux-pro-max (PRIORIDADE ALTA)
Os arquivos já estão locais em `skills/ui-ux-pro-max/`, mas para o plugin funcionar como plugin oficial:
```bash
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max
```

#### 2. Atualizar plugin context-mode
Os arquivos estão em `skills/context-mode/`, mas para funcionar como plugin:
```bash
/plugin marketplace add mksglu/claude-context-mode
/plugin install context-mode
```

#### 3. Atualizar Agent Orchestrator
```bash
cd ~/agent-orchestrator  # ou onde está o AO
git pull origin main
pnpm install && pnpm build

# Alternativa se instalado via npm:
npm update -g agent-orchestrator
```

#### 4. Sync skills para ~/.claude/
```bash
~/Claude/scripts/sync-all-to-home.sh
# Ou manualmente:
rsync -av ~/Claude/skills/ ~/.claude/skills/
rsync -av ~/Claude/agents/ ~/.claude/agents/
```

---

## Inventário Atualizado

| Categoria | Antes | Depois | Delta |
|-----------|-------|--------|-------|
| Skills (diretórios) | 58 | 91 | +33 |
| SKILL.md files | 261 | 319 | +58 |
| Agents | 183 | 183 | = |
| Trail of Bits skills | 12 | 37 | +25 |
| ui-ux-pro-max skills | 1 | 7 | +6 |
| visual-explainer | v0.4.4 | v0.6.3 | atualizado |

---

## Novas Skills Trail of Bits Instaladas

1. agentic-actions-auditor — Segurança de GitHub Actions
2. ask-questions-if-underspecified — Spec clarity
3. building-secure-contracts — Smart contracts (6 blockchains)
4. burpsuite-project-parser — Análise de projetos Burp Suite
5. claude-in-chrome-troubleshooting — Debug extensão Chrome
6. culture-index — Assessment cultural
7. debug-buttercup — Debug framework Buttercup
8. devcontainer-setup — Configuração de devcontainers
9. dwarf-expert — DWARF debug info
10. firebase-apk-scanner — Scanner APK Firebase
11. fp-check — Verificação de falsos positivos
12. gh-cli — GitHub CLI avançado
13. git-cleanup — Limpeza de branches/refs
14. let-fate-decide — Decision making (random)
15. modern-python — Python moderno best practices
16. seatbelt-sandboxer — macOS Seatbelt sandbox
17. second-opinion — Revisão por segundo agente
18. semgrep-rule-variant-creator — Portar regras Semgrep
19. skill-improver — Otimização de skills existentes
20. spec-to-code-compliance — Verificar código vs spec
21. static-analysis — Toolkit CodeQL + Semgrep + SARIF
22. supply-chain-risk-auditor — Risco de supply chain
23. testing-handbook-skills — Fuzzers e coverage
24. workflow-skill-design — Design de workflow skills
25. zeroize-audit — Auditoria de zeroing de memória

## Novas Skills ui-ux-pro-max v2.5.0

1. ui-ux-pro-max (core) — 67 estilos, 161 regras, 1923 fonts
2. ui-styling — shadcn/ui + Tailwind styling
3. design-system — Token architecture (3 camadas)
4. design — Suite completa de design
5. banner-design — Banners (22 estilos)
6. slides — Apresentações
7. brand — Identidade e voz de marca
