# Relatório de Otimização do Setup — 2026-04-14 (v2 — dados reais)

> Revisão semanal automatizada • Gerado por `weekly-setup-optimizer` • Segunda-feira, 14 de abril de 2026
> **v2**: Corrigido com estado real do sistema (`claude plugin list` + screenshot v2.1.108)

---

## Resumo Executivo

| Métrica | Status Real |
|---------|------------|
| **Health Score** | **8.6 / 10** 🟢 (revisado para cima — setup mais completo do que o SETUP-COMPLETO indica) |
| **Claude Code** | **v2.1.108** ✅ (atualizado — reportei errado na v1) |
| **context-mode** | **v1.0.89** ✅ (atualizado — reportei errado como v1.0.18 crítico) |
| **Telegram** | **✔ enabled** ✅ (ativo — reportei como pendente) |
| **Plugins ativos** | 30 habilitados (vs. 7 que o SETUP-COMPLETO documentava) |
| **Plugins inativos/disabled** | 58 instalados mas desabilitados |
| **Erros críticos** | 1 (`sanity-plugin` failed to load) |
| **Duplicatas** | 1 (`plannotator` em duas versões) |

> ⚠️ **Nota metodológica**: O SETUP-COMPLETO.md (atualizado em 30/03) estava severamente desatualizado. O setup real é significativamente mais robusto. Este relatório corrige todos os dados.

### Top 3 Recomendações

1. 🔴 **Remover `sanity-plugin`** — erro de boot (`Plugin not found in marketplace`). Polui logs e impacta tempo de inicialização. Comando: `/plugin remove sanity-plugin@claude-plugins-official`
2. 💰 **Conectar FactSet + MSCI no Cowork** — único gap real de alto impacto para CFO/M&A. Dados institucionais e ESG disponíveis em 1 clique desde fev/26.
3. 📊 **Instalar FMP MCP** — 250+ ferramentas financeiras para análise de FIIs, valuations e dados de mercado. Pendente há semanas.

---

## Estado Real dos Plugins (30 ativos)

### ✅ Plugins Ativos e Funcionais

| Plugin | Versão | Função | Na doc? |
|--------|--------|--------|---------|
| `chrome-devtools-mcp` | latest | Chrome DevTools Protocol debugging | ✅ |
| `claude-code-setup` | 1.0.0 | Setup guidance | 🆕 |
| `claude-hud` | 0.0.7 | Status line (contexto, git, agents) | ✅ |
| `claude-md-management` | 1.0.0 | Gerenciamento de CLAUDE.md | 🆕 |
| `claude-mem` | **10.6.2** | Memória persistente | ✅ (era versão antiga) |
| `code-review` | unknown | Code review automático | ✅ |
| `commit-commands` | unknown | Git commits inteligentes | 🆕 |
| `context-mode` | **1.0.89** | Compressão de output até 98% | ✅ (era 1.0.18!) |
| `context7` | unknown | Documentação atualizada de libs | ✅ |
| `feature-dev` | unknown | Desenvolvimento de features | 🆕 |
| `firebase` | unknown | Backend Firebase | ✅ |
| `firecrawl` | 1.0.3 | Web scraping estruturado | ✅ |
| `frontend-design` | unknown | Design de frontend | 🆕 |
| `github` | unknown | Git, PRs, Issues | ✅ |
| `hookify` | unknown | Sistema de hooks | 🆕 |
| `learning-output-style` | 1.0.0 | Output em formato didático | 🆕 |
| `plannotator` (project) | 0.12.0 | Anotações e planejamento | ✅ ⚠️ duplicata |
| `plannotator` (user) | **0.15.2** | Anotações e planejamento | ✅ (versão mais nova) |
| `playground` | unknown | Experimentação rápida | 🆕 |
| `plugin-dev` | unknown | Desenvolvimento de plugins | 🆕 |
| `pyright-lsp` | 1.0.0 | Python LSP (autocomplete, diagnostics) | 🆕 |
| `ralph-loop` | 1.0.0 | Autonomous dev loop (agentic) | 🆕 |
| `remember` | 0.1.0 | Memória adicional | 🆕 |
| `semgrep` | 0.5.2 | SAST análise de segurança | ✅ |
| `sentry` | 1.0.0 | Error tracking | ✅ |
| `skill-creator` | unknown | Criação de skills | 🆕 |
| `superpowers` | **5.0.7** | TDD, debugging, git worktrees | ✅ (era versão antiga) |
| `telegram` | 0.0.4 | Claude Code Channels via Telegram | ✅ ⚠️ era pendente |
| `typescript-lsp` | 1.0.0 | TypeScript LSP intelligence | ✅ (era lsp-mcp MCP server) |
| `ui-ux-pro-max` | 2.0.1 | Design intelligence, 67 presets | ✅ ⚠️ ver nota |
| `vercel` | b95178c7d8df | Deploy e previews | ✅ |

> 🆕 = 13 plugins não documentados no SETUP-COMPLETO — adicionar na próxima atualização do doc

---

## Problemas Identificados

### 🔴 Crítico — Corrigir Esta Semana

| Problema | Detalhe | Comando |
|----------|---------|---------|
| **`sanity-plugin` failed to load** | `Plugin not found in marketplace claude-plugins-official` — erro no boot de todo projeto | `/plugin remove sanity-plugin@claude-plugins-official` |

### 🟡 Médio — Limpar em Breve

| Problema | Detalhe | Recomendação |
|----------|---------|-------------|
| **`plannotator` duplicado** | Project scope v0.12.0 + User scope v0.15.2, ambos habilitados | Remover project scope (mais antigo): `/plugin disable plannotator@plannotator --scope project` |
| **`ui-ux-pro-max` v2.0.1** | Marketplace `ui-ux-pro-max-skill` pode estar atrás do original `nextlevelbuilder/ui-ux-pro-max-skill` v2.5.0 | Verificar se há update disponível |
| **`context-mode` user scope disabled** | v1.0.89 instalado em user scope mas desabilitado (project scope ativo) | Sem urgência — project scope cobrindo |

### 🟢 Info — 58 Plugins Disabled

58 plugins instalados mas desabilitados (disabled). Eles ocupam espaço em disco mas não afetam performance em runtime. Apenas monitorar.

---

## Atualizações de Versão (Correções do Relatório v1)

| Componente | Relatório v1 (errado) | Estado Real | Status |
|------------|----------------------|-------------|--------|
| Claude Code | ⚠️ v2.1.83 pendente | **v2.1.108** | ✅ Feito |
| context-mode | 🔴 v1.0.18 crítico | **v1.0.89** | ✅ Feito |
| Telegram plugin | ⚠️ Pendente | **v0.0.4 ativo** | ✅ Feito |
| superpowers | versão "latest" | **v5.0.7** | ✅ Atualizado |
| claude-mem | versão desconhecida | **v10.6.2** | ✅ Atualizado |
| plannotator | v0.12.0 | **v0.15.2 (user scope)** | ✅ Atualizado |

---

## Gaps Reais por Papel (Revisados)

### 👔 CEO

| Gap | Solução | Prioridade |
|-----|---------|------------|
| Telegram ativo mas não testado para aprovação remota | Testar workflow: aprovar tool use pelo celular via Telegram | 🟡 Média |
| Board reporting com dados reais | FMP MCP + skill `presentation` | 🟡 Média |
| Assinatura digital no fluxo | Conectar DocuSign no Cowork | 🟡 Média |

### 💹 CFO (Foco: FIIs + Fundo Proprietário)

| Gap | Solução | Prioridade |
|-----|---------|------------|
| **Dados de FIIs em tempo real** | **FMP MCP** (cobre REIT, fundamentals, histórico) | 🔴 Alta |
| **M&A comparables e valuations** | **Conectar FactSet no Cowork** | 🔴 Alta |
| **ESG e risco de portfolio** | **Conectar MSCI no Cowork** | 🔴 Alta |
| Modelo de valuation automatizado | FMP MCP + skill `xlsx` | 🟡 Média |
| FP&A e planejamento orçamentário | Avaliar Datarails FinanceOS MCP | 🟡 Média |
| Dados macro / forex | Alpha Vantage MCP (script já existe) | 🟡 Média |

### 📣 CMO

| Gap | Solução | Prioridade |
|-----|---------|------------|
| Benchmark competitivo de tráfego | Conectar Similarweb no Cowork | 🟡 Média |
| Social listening / brand monitoring | Nenhuma solução instalada | 🟡 Média |
| SEO analytics | `marketing:seo-audit` skill (já instalada) | ✅ OK |
| Conteúdo / LinkedIn | `content-research-writer` skill (já instalada) | ✅ OK |

### 🔧 CPO

| Gap | Solução | Prioridade |
|-----|---------|------------|
| Product analytics | `product-management:metrics-review` skill (já instalada) | ✅ OK |
| User research synthesis | `product-management:synthesize-research` skill (já instalada) | ✅ OK |
| Roadmap e feature specs | `product-management:write-spec` skill (já instalada) | ✅ OK |

---

## SETUP-COMPLETO.md — Desatualizado ⚠️

O documento de referência está **15+ dias desatualizado** e não reflete o estado real. Pontos a corrigir:

- [ ] Versão Claude Code: 2.1.108
- [ ] context-mode: 1.0.89
- [ ] Telegram: ativo
- [ ] Adicionar 13 novos plugins descobertos hoje
- [ ] Atualizar versões: claude-mem 10.6.2, superpowers 5.0.7, plannotator 0.15.2
- [ ] Remover menção de `lsp-mcp` como MCP server (foi substituído por `typescript-lsp` plugin)
- [ ] Atualizar health score para 8.6/10

---

## Itens de Ação Priorizados

| # | Ação | Impacto | Esforço | Papel |
|---|------|---------|---------|-------|
| 1 | 🔴 `/plugin remove sanity-plugin@claude-plugins-official` | Remove erro de boot | 1 min | Todos |
| 2 | 🟡 `/plugin disable plannotator@plannotator --scope project` | Remove duplicata v0.12.0 | 1 min | — |
| 3 | 💰 Conectar **FactSet** no Cowork | Dados M&A e valuations | 5 min | CFO |
| 4 | 💰 Conectar **MSCI** no Cowork | ESG e risco portfolio | 5 min | CFO |
| 5 | 📊 Instalar **FMP MCP** (250+ ferramentas financeiras) | Análise FIIs em tempo real | 10 min | CFO/CPO |
| 6 | 🔗 Conectar **Similarweb** no Cowork | Benchmark competitivo | 5 min | CMO |
| 7 | 🔗 Conectar **DocuSign** no Cowork | Assinatura digital no fluxo | 5 min | CEO |
| 8 | 📱 Testar Telegram channel (aprovação remota de tools) | Controle via celular | 15 min | CEO |
| 9 | 📄 Atualizar SETUP-COMPLETO.md com estado real | Manter doc preciso | 20 min | — |
| 10 | 📊 Instalar Alpha Vantage MCP (script já existe) | Dados macro / forex | 5 min | CFO |

---

## Próxima Revisão

- **Data**: Segunda-feira, 21 de abril de 2026
- **Foco**: Validar itens 1-5 concluídos; testar FMP MCP para análise de FIIs
- **Métrica de sucesso**: Health Score ≥ 9.0

---

*Gerado automaticamente por `weekly-setup-optimizer` em 14/04/2026 • v2 corrigido com dados reais*
