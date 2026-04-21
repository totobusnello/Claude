# Claude Code Setup Completo

> Documento de referencia do setup Claude Code do Toto (atualizado em 2026-04-14 pelo weekly-setup-optimizer)

---

## Resumo Executivo

| Componente | Quantidade |
|------------|-----------|
| MCP Servers | 16 |
| Plugins Ativos (enabled) | **30** (verificado 14/04) |
| Plugins Instalados (total) | **89** (30 enabled + 58 disabled + 1 failed) |
| Standalone Tools | 1 (Claude Squad) |
| Skills | 91 directories (319 SKILL.md files) |
| Agents | 15 categories (183 agent files) |
| Commands | 27 categories (223 files) |
| Prompts | 41 templates |
| API Keys | 5 |
| Projetos Ativos | 15 |
| PowerPoint Templates | 93 |
| Cowork Connectors | **6** (Gmail confirmado ativo em 23/03) |
| Scheduled Tasks | 1 (weekly-setup-optimizer) |
| **Claude Code Version** | **v2.1.108** (verificado 14/04) |

---

## MCP Servers (16)

| Server | Funcao | Origem |
|--------|--------|--------|
| github | Git, PRs, Issues, Actions | Anthropic (built-in) |
| sequential-thinking | Raciocinio estruturado multi-step | Anthropic |
| sqlite | Database local para cache/dados | Anthropic |
| time | Timestamps e conversao de fusos | Anthropic |
| amem | Memoria evolutiva com embeddings semanticos | Custom (`Projetos/amem-server`) |
| context7 | Documentacao atualizada de libs/frameworks | Community |
| sentry | Error tracking e monitoring | Sentry oficial |
| firecrawl | Web scraping estruturado | Firecrawl oficial |
| semgrep | Static analysis (SAST) | Semgrep oficial |
| vercel | Deploy e preview deployments | Vercel oficial |
| supabase | Backend, DB, Edge Functions | Supabase oficial |
| firebase | Backend, Auth, Firestore | Firebase oficial |
| posthog | Product analytics | PostHog oficial |
| serena | Semantic code tools via LSP | Community |
| chrome-devtools | Chrome DevTools Protocol debugging e profiling | Community (`chrome-devtools-mcp`) |
| lsp-mcp | TypeScript LSP intelligence (autocomplete, diagnostics) | Community (`jonrad/lsp-mcp`) |

### Novos MCPs (instalados 2026-03-12)
- `chrome-devtools` → Debugging via CDP, profiling, network inspection
- `lsp-mcp` → Language Server Protocol para TypeScript, completions, hover info

### Removidos (6)
- `memory` → duplicava `amem`
- `filesystem` → redundante com tools nativas
- `fetch` → redundante com WebFetch
- `puppeteer` → substituido por Claude in Chrome
- `brave-search` → substituido por WebSearch nativo
- `postgres` → sem uso direto

---

## Plugins (30 ativos — verificado 14/04/2026)

### Plugins Ativos (enabled)

| Plugin | Versao | Funcao | Marketplace |
|--------|--------|--------|-------------|
| chrome-devtools-mcp | latest | Chrome DevTools debugging | claude-plugins-official |
| claude-code-setup | 1.0.0 | Setup guidance | claude-plugins-official |
| claude-hud | 0.0.7 | Status line (context, git, agents) | claude-hud |
| claude-md-management | 1.0.0 | Gerenciamento de CLAUDE.md | claude-plugins-official |
| claude-mem | **10.6.2** | Memoria persistente | thedotmack |
| code-review | unknown | Code review automatico | claude-plugins-official |
| commit-commands | unknown | Git commits inteligentes | claude-plugins-official |
| context-mode | **1.0.89** | Compressao de output ate 98%, 11 sandboxes | context-mode (project scope) |
| context7 | unknown | Documentacao atualizada de libs | claude-plugins-official |
| feature-dev | unknown | Desenvolvimento de features | claude-plugins-official |
| firebase | unknown | Backend Firebase | claude-plugins-official |
| firecrawl | 1.0.3 | Web scraping estruturado | claude-plugins-official |
| frontend-design | unknown | Design de frontend | claude-plugins-official |
| github | unknown | Git, PRs, Issues, Actions | claude-plugins-official |
| hookify | unknown | Sistema de hooks pre/post | claude-plugins-official |
| learning-output-style | 1.0.0 | Output em formato didatico | claude-plugins-official |
| plannotator | 0.15.2 | Anotacoes e planejamento (user scope) | plannotator |
| playground | unknown | Experimentacao rapida | claude-plugins-official |
| plugin-dev | unknown | Desenvolvimento de plugins | claude-plugins-official |
| pyright-lsp | 1.0.0 | Python LSP (autocomplete, diagnostics) | claude-plugins-official |
| ralph-loop | 1.0.0 | Autonomous dev loop (agentic) | claude-plugins-official |
| remember | 0.1.0 | Memoria adicional de sessao | claude-plugins-official |
| semgrep | 0.5.2 | SAST / static analysis | claude-plugins-official |
| sentry | 1.0.0 | Error tracking e monitoring | claude-plugins-official |
| skill-creator | unknown | Criacao e melhoria de skills | claude-plugins-official |
| superpowers | **5.0.7** | TDD, debugging, git worktrees, parallel agents | claude-plugins-official |
| telegram | 0.0.4 | Claude Code Channels (aprovacao remota) | claude-plugins-official |
| typescript-lsp | 1.0.0 | TypeScript LSP intelligence | claude-plugins-official |
| ui-ux-pro-max | 2.0.1 | Design intelligence, 67 presets | ui-ux-pro-max-skill |
| vercel | b95178c7d8df | Deploy e preview deployments | claude-plugins-official |

### Plugins com Problemas
| Plugin | Problema | Acao |
|--------|---------|------|
| sanity-plugin@claude-plugins-official | ✘ failed to load — not found in marketplace | Remover: `/plugin remove sanity-plugin@claude-plugins-official` |
| plannotator@plannotator (project scope v0.12.0) | Duplicata do user scope v0.15.2 | Desabilitar project scope |

### Instalacao de plugins
```bash
# No terminal Claude Code (nao Cowork):

# Passo 1: Adicionar marketplace (se nao for o built-in)
/plugin marketplace add <user/repo>

# Passo 2: Instalar plugin do marketplace
/plugin install <plugin-name>@<marketplace-name>

# Se SSH falhar, usar HTTPS:
/plugin marketplace add https://github.com/<user/repo>.git

# Marketplace oficial Anthropic (pre-configurado, 55+ plugins):
/plugin install <plugin-name>@anthropics-claude-plugins-official
```

---

## Standalone Tools

| Tool | Funcao | Instalacao |
|------|--------|------------|
| Claude Squad (`cs`) | Multi-agent orchestration com tmux sessions | Go binary em `~/go/bin/claude-squad` |

### Claude Squad
- **Invocacao**: `cs` no terminal
- **Funcao**: Gerencia multiplas instancias Claude Code em paralelo via tmux
- **Instalacao**: `go install github.com/smtg-ai/claude-squad@latest`
- **Requer**: Terminal interativo (nao funciona dentro de Claude Code)

---

## Cowork Connectors (5)

| Connector | Funcao | Status |
|-----------|--------|--------|
| HubSpot | CRM, contacts, deals, companies | Conectado |
| Google Calendar | Calendario, eventos, reunioes | Conectado |
| Google Drive | Documentos, planilhas, arquivos | Conectado |
| Notion | Wikis, databases, paginas | Conectado |
| Slack | Mensagens, canais, busca | Conectado |

### Connectors Recomendados (para conectar futuramente)
| Connector | Funcao | Prioridade |
|-----------|--------|------------|
| **FactSet** | Dados financeiros institucionais (M&A, valuations) | **Alta — CFO** |
| **MSCI** | ESG scores, risco de portfolio, indices | **Alta — CFO** |
| **Similarweb** | Trafego web, benchmark competitivo | Media — CMO |
| **Outreach** | Sales engagement automation | Media — CMO |
| **DocuSign** | Assinatura digital de contratos | Media — CEO |
| S&P Global | Parceria estrategica Anthropic (fev/26) | Alta |
| Supabase | Backend/DB management via Cowork | Media |
| Pigment | FP&A e planejamento financeiro | Media |
| Hugging Face | Modelos ML e datasets | Baixa |

---

## Skills Instaladas (91 directories, 319 SKILL.md files)

### Core Skills (proprias)
| Skill | Funcao |
|-------|--------|
| autonomous-dev | PRD → stories → implementacao automatica |
| cpo-ai-skill | Advisory de produto (RICE, roadmap) |
| cto | Advisory tecnico CTO |
| deep-research | Pesquisa profunda multi-fonte |
| fulltest-skill | Testes E2E completos |
| handoff / handoff-continue | Transferencia de contexto entre sessoes |
| presentation | Geracao de PowerPoint (93 templates) |
| root-cause-tracing | Analise de causa raiz |
| session-start-hook | Carrega core-memory no inicio |
| ship:ship | Feature shipping end-to-end |
| software-architecture | Design de arquitetura |
| spec-elicitation | Elicitacao de requisitos |
| subagent-driven-dev | Dev com multi-agents |
| verification-before-completion | Validacao antes de finalizar |
| claude-setup-optimizer | Otimizacao do setup Claude |

### Skills de Seguranca (Trail of Bits - 37)
| Skill | Funcao |
|-------|--------|
| tob-agentic-actions-auditor | Auditoria de acoes de agentes AI |
| tob-ask-questions-if-underspecified | Validacao de specs incompletas |
| tob-audit-context | Contexto de auditoria |
| tob-building-secure-contracts | Contratos seguros (Solidity/blockchain) |
| tob-burpsuite-project-parser | Parser de projetos BurpSuite |
| tob-claude-in-chrome-troubleshooting | Troubleshooting Claude in Chrome |
| tob-codeql | Analise CodeQL |
| tob-constant-time | Verificacao timing attacks |
| tob-culture-index | Indice cultural de seguranca |
| tob-debug-buttercup | Debug de contratos Buttercup |
| tob-devcontainer-setup | Setup de devcontainers seguros |
| tob-differential-review | Review diferencial |
| tob-dwarf-expert | Analise de binarios DWARF |
| tob-entry-point-analyzer | Analise de entry points |
| tob-firebase-apk-scanner | Scanner de APKs Firebase |
| tob-fp-check | Verificacao de falsos positivos |
| tob-gh-cli | Automacao GitHub CLI segura |
| tob-git-cleanup | Limpeza segura de repos Git |
| tob-insecure-defaults | Deteccao de defaults inseguros |
| tob-let-fate-decide | Decisao baseada em risco |
| tob-modern-python | Seguranca Python moderno |
| tob-property-testing | Testes baseados em propriedades |
| tob-seatbelt-sandboxer | Sandboxing com Seatbelt (macOS) |
| tob-second-opinion | Segunda opiniao de seguranca |
| tob-semgrep | Regras Semgrep customizadas |
| tob-semgrep-rule-creator | Criacao de regras Semgrep |
| tob-semgrep-rule-variant-creator | Variantes de regras Semgrep |
| tob-sharp-edges | Deteccao de sharp edges |
| tob-skill-improver | Melhoria de skills existentes |
| tob-spec-to-code-compliance | Conformidade spec-to-code |
| tob-static-analysis | Analise estatica geral |
| tob-supply-chain-risk-auditor | Auditoria de supply chain |
| tob-testing-handbook-skills | Skills do handbook de testes |
| tob-variant-analysis | Analise de variantes |
| tob-workflow-skill-design | Design de workflow skills |
| tob-yara-authoring | Criacao de regras YARA |
| tob-zeroize-audit | Auditoria de zeroize (crypto) |

### Cowork Platform Skills (33)
| Skill | Funcao |
|-------|--------|
| ai-maximizer | Maximizar uso de AI |
| algorithmic-art | Arte generativa com p5.js |
| artifacts-builder | Artifacts React complexos |
| brainstorming | Brainstorming antes de criar |
| brand-guidelines | Cores e tipografia Anthropic |
| canvas-design | Arte visual em PNG/PDF |
| content-research-writer | Pesquisa e escrita de conteudo |
| dispatching-parallel-agents | Despacho de agents paralelos |
| doc-coauthoring | Co-autoria de documentos |
| docx | Criacao/edicao Word |
| executing-plans | Execucao de planos |
| file-organizer | Organizacao de arquivos |
| image-enhancer | Melhoria de imagens |
| internal-comms | Comunicacoes internas |
| invoice-organizer | Organizacao de faturas |
| lead-research-assistant | Pesquisa de leads |
| mcp-builder | Criacao de MCP servers |
| meeting-insights-analyzer | Analise de reunioes |
| pdf | Criacao/edicao PDF |
| pptx | Criacao/edicao PowerPoint |
| schedule | Tarefas agendadas |
| ship--end-to-end-feature-shipping-skill | Feature shipping |
| skill-creator | Criacao de skills |
| slack-gif-creator | GIFs para Slack |
| systematic-debugging | Debug sistematico |
| template-skill | Template base |
| theme-factory | Temas para artifacts |
| using-git-worktrees | Git worktrees |
| video-downloader | Download de videos |
| web-artifacts-builder | Artifacts web complexos |
| webapp-testing | Testes de webapp |
| writing-plans | Escrita de planos |
| xlsx | Criacao/edicao Excel |

### Cowork Remote Plugin Skills (140+)
| Namespace | Skills | Funcao |
|-----------|--------|--------|
| `sales:` | 7 | Account research, call prep, competitive intel, outreach, forecast |
| `product-management:` | 8 | Feature spec, roadmap, metrics, stakeholder comms, sprint planning |
| `operations:` | 6 | Change management, compliance, process optimization, risk, vendor |
| `legal:` | 7 | Contract review, NDA triage, compliance, risk assessment |
| `human-resources:` | 6 | Interview prep, comp benchmarking, org planning, recruiting |
| `finance:` | 6 | Financial statements, journal entries, reconciliation, SOX, variance |
| `marketing:` | 5 | Campaign planning, content creation, competitive analysis, brand voice |
| `design:` | 6 | Accessibility review, design critique, design systems, UX writing |
| `engineering:` | 6 | Code review, system design, incident response, testing strategy |
| `customer-support:` | 5 | Ticket triage, response drafting, escalation, knowledge management |
| `enterprise-search:` | 3 | Search strategy, knowledge synthesis, source management |
| `data:` | 7 | Data exploration, visualization, SQL queries, dashboards, validation |
| `common-room:` | 6 | Account/contact research, prospecting, call prep, outreach |
| `brand-voice:` | 3 | Brand voice enforcement, guideline generation, brand discovery |
| `bio-research:` | 5 | Single-cell RNA QC, scvi-tools, Nextflow, scientific problem selection |
| `apollo:` | 3 | Lead enrichment, prospecting, sequence loading |
| `slack-by-salesforce:` | 2 | Slack messaging guidance, Slack search guidance |
| `productivity:` | 2 | Memory management, task management |
| `cowork-plugin-management:` | 2 | Plugin creation, plugin customization |

### ui-ux-pro-max (v2.5.0 - 7 skills)
| Skill | Funcao |
|-------|--------|
| ui-ux-pro-max (core) | Design intelligence, 67 style presets |
| banner-design | Design de banners |
| brand | Identidade de marca |
| design | Design geral |
| design-system | Sistemas de design |
| slides | Design de slides |
| ui-styling | Estilos de UI |

### Visual Explainer (v0.6.3)
| Skill | Funcao |
|-------|--------|
| visual-explainer | HTML visual: diagramas, slides, reviews, fact-check |

**Novidades v0.6.3**: Multi-diagram, comando /share, zoom/pan, templates novos

### context-mode (v1.0.18)
| Funcao | Detalhes |
|--------|----------|
| Compressao | Ate 98% de reducao de tool output |
| Sandboxes | 11 linguagens (Python, JS, TS, Go, Rust, etc.) |
| Cursor adapter | Integracao com Cursor IDE |
| Hooks | Pre/post processing de output |
| Doctor | `/context-mode:doctor` para diagnostico |

### Skills por Namespace (24 namespaces)
| Namespace | Skills | Funcao |
|-----------|--------|--------|
| `boundary:` | 5 | Deteccao de limites arquiteturais |
| `context:` | 1 | Otimizacao de prompts |
| `deploy:` | 10 | CI/CD, releases, rollback, containers |
| `dev:` | 20 | Debug, review, refactor, git, features |
| `docs:` | 7 | API docs, architecture docs, guides |
| `memory:` | 5 | Checkpoint, compress, merge, recall, prune |
| `performance:` | 9 | Bundle, cache, CDN, DB, monitoring |
| `project:` | 14 | Tickets, milestones, health, Linear |
| `reasoning:` | 4 | Multi-path, resonance, chain, logic |
| `rust:` | 7 + tauri | Audit, refactor, Tauri commands |
| `security:` | 5 | Auth, hardening, audit, dependencies |
| `semantic:` | 6 | Semantic tree operations |
| `setup:` | 12 | Env, linting, monorepo, GraphQL, DB |
| `ship:` | 1 | Feature shipping completo |
| `simulation:` | 9 | Business scenarios, digital twins |
| `skills:` | 5 | Build, package, templates |
| `spec-workflow:` | 3 | Spec workflow, parallel tasks |
| `svelte:` | 16 | Componentes, testes, storybook |
| `sync:` | 13 | Linear ↔ GitHub bidirectional |
| `team:` | 12 | Standup, sprint, retro, triage |
| `test:` | 10 | E2E, visual, property, mutation, load |
| `visual:` | 7 | Diagramas, slides, reviews, fact-check |
| `wfgy:` | 6 | Formula framework |

---

## Agents (15 categories, 183 agent files)

### Categorias Estruturadas (10 numbered)
| Categoria | Conteudo |
|-----------|----------|
| 01-core-development | Agents de desenvolvimento core |
| 02-language-specialists | Especialistas por linguagem |
| 03-infrastructure | Infra e DevOps |
| 04-quality-security | QA e seguranca |
| 05-data-ai | Data science e AI |
| 06-developer-experience | DevEx |
| 07-specialized-domains | Dominios especializados |
| 08-business-product | Produto e negocios |
| 09-meta-orchestration | Meta-orchestracao |
| 10-research-analysis | Pesquisa e analise |

### Agents Avulsos
| Agent | Area |
|-------|------|
| api-agent | APIs |
| database-agent | Banco de dados |
| devops-agent | DevOps |
| frontend-agent | Frontend |
| fulltesting-agent | Testes completos |
| orchestrator-fullstack | Fullstack orchestration |
| code-review-agent | Code review |

### Business/C-Suite
| Agent | Area |
|-------|------|
| cs-ceo-advisor | Estrategia CEO |
| cs-cto-advisor | Tecnologia CTO |
| cs-content-creator | Conteudo/Marketing |
| cs-demand-gen-specialist | Demand gen |
| cs-product-manager | Produto |

### Ralph Agents (31 agents, multi-tier)
| Agent | Tiers | Funcao |
|-------|-------|--------|
| architect | low, medium, high | Arquitetura |
| build-fixer | low, high | Fix de builds |
| code-reviewer | low, high | Code review |
| designer | low, medium, high | Design |
| executor | low, medium, high | Execucao |
| explore | medium, high | Exploracao |
| qa-tester | normal, high | QA |
| researcher | low, high | Pesquisa |
| scientist | low, high | Ciencia |
| security-reviewer | low, high | Seguranca |
| tdd-guide | low, high | TDD |
| analyst | - | Analise |
| critic | - | Critica |
| planner | - | Planejamento |
| vision | - | Visao |
| writer | - | Escrita |

---

## Commands (27 categories, 223 files)

| Namespace | Funcao |
|-----------|--------|
| boundary | Deteccao de limites |
| context | Otimizacao de contexto |
| deploy | CI/CD e deploy |
| dev | Desenvolvimento |
| docs | Documentacao |
| memory | Gestao de memoria |
| performance | Performance |
| project | Gestao de projetos |
| reasoning | Raciocinio |
| rust | Rust development |
| security | Seguranca |
| semantic | Operacoes semanticas |
| setup | Setup de ambiente |
| ship | Feature shipping |
| simulation | Simulacoes |
| skills | Gestao de skills |
| spec-workflow | Workflow de specs |
| svelte | Svelte development |
| sync | Sincronizacao |
| team | Gestao de equipe |
| test | Testes |
| visual | Visual explainer (8 commands) |
| wfgy | Formula framework |
| handoff / handoff-continue | Transferencia de contexto |
| spec-elicitation | Elicitacao de requisitos |

---

## Infraestrutura

### API Keys (~/.zshrc)
| Key | Servico |
|-----|---------|
| OPENAI_API_KEY | OpenAI (embeddings amem) |
| GITHUB_TOKEN | GitHub API |
| FIRECRAWL_API_KEY | Firecrawl scraping |
| SUPABASE_ACCESS_TOKEN | Supabase management |
| POSTHOG_API_KEY | PostHog analytics |

### Servicos Locais
| Servico | Detalhes |
|---------|----------|
| Ollama | nomic-embed-text (768-dim), brew service |
| Agent Orchestrator | `ao` CLI v2.x, 7 projetos, pnpm global |
| Claude Squad | `cs` CLI, Go binary, multi-agent tmux |
| Sync nightly | launchd 23h → `~/Claude/logs/sync.log` |
| Playwright | pnpm global, para HTML→PDF |

### Agent Orchestrator (AO) v2.x
| Funcao | Detalhes |
|--------|----------|
| CLI | `ao` (instalado via pnpm global) |
| Source | `~/Claude/Projetos/agent-orchestrator` |
| Config | `~/Claude/agent-orchestrator.yaml` (7 projetos) |
| Commands | `ao status`, `ao spawn`, `ao batch-spawn`, `ao dashboard` |
| Novos | `ao doctor` (diagnostico), `ao update` (auto-update) |
| Features | Observability, project-based dashboard, SCM webhooks |
| Reactions | Auto-responds a CI failures, PR reviews, stuck agents |

### Projetos Ativos (15)
| Projeto | Tipo |
|---------|------|
| Granix-App | App |
| Frooty | App |
| GalapagosApp | React Native |
| GranCoffee | App |
| Future-Farm | App |
| Superfrio | App |
| Fake-News-Check | App |
| Projeto-AI-Galapagos | AI Platform |
| Sao-Thiago-FII | FII / Real estate |
| daily-tech-digest | Automation |
| Area-Campolim-Sorocaba | Real estate |
| Area-Manuel_Nobrega | Real estate |
| Posts Linkedin | Content |
| memoria-nox | AI Memory System |
| nox-supermem | AI Memory System |

---

## Estrutura de Diretorios

```
~/Claude/                          (source of truth)
├── skills/          → ~/.claude/skills/    (91 dirs, 319 SKILL.md)
│   ├── tob-*        (37 Trail of Bits security skills)
│   ├── cowork-platform/  (33 Cowork Platform skills)
│   ├── ui-ux-pro-max/    (7 skills, v2.5.0)
│   ├── visual-explainer/ (v0.6.3)
│   ├── context-mode/     (v1.0.18)
│   └── ... (core + namespace skills)
├── agents/          → ~/.claude/agents/    (15 categories, 183 files)
│   ├── 01-core-development/ ... 10-research-analysis/
│   ├── c-level/     (CEO, CTO advisors)
│   ├── ralph-agents/ (31 multi-tier agents)
│   └── ... (avulsos + marketing + product + review)
├── commands/        → ~/.claude/commands/  (27 categories, 223 files)
├── prompts/         → ~/.claude/prompts/   (41 files)
├── templates-powerpoint/  (submodule: 93 templates)
├── Projetos/              (submodules: 7 repos + agent-orchestrator)
├── _retired/              (skills/commands substituidos por AO)
├── docs/                  (reference docs)
├── logs/                  (sync logs)
├── scripts/               (sync automation)
├── agent-orchestrator.yaml
├── CATALOG.md
├── INDEX.md
├── CLAUDE.md
└── SETUP-COMPLETO.md      (este documento)
```

---

## Repos que Originaram o Setup

| Repo | O que veio dele | Versao |
|------|-----------------|--------|
| Anthropic oficial | 16 MCP servers, skills base, official marketplace (55+ plugins) | latest |
| `obra/superpowers` | Plugin superpowers (TDD, debugging, git worktrees, etc.) | latest |
| `nextlevelbuilder/ui-ux-pro-max-skill` | Plugin ui-ux-pro-max (67 styles, 7 skills) | v2.5.0 |
| `mksglu/claude-context-mode` | Plugin context-mode (11 sandboxes, Cursor adapter) | v1.0.18 |
| `nicobailon/visual-explainer` | Skill visual-explainer + 8 commands | v0.6.3 |
| `backnotprop/plannotator` | Plugin plannotator (task annotations) | latest |
| `smtg-ai/claude-squad` | Claude Squad multi-agent orchestrator | latest |
| awesome-claude-plugins marketplace | Plugin claude-hud | latest |
| Claude plugin marketplace | Plugin claude-mem | latest |
| Anthropic official marketplace | Plugin code-review + 55 outros disponiveis | latest |
| Trail of Bits | 37 skills de seguranca (tob-*) | latest |
| ComposioHQ | Agent Orchestrator (`ao`) v2.x | v2.x |
| Custom (Toto) | amem-server, core-memory, 41 prompts, CLAUDE.md | custom |

---

## Evolucoes Possiveis

### Curto Prazo (quick wins)
| Acao | Impacto | Esforco | Status |
|------|---------|---------|--------|
| ~~Explorar marketplaces de plugins~~ | ~~Novos plugins uteis~~ | ~~Medio~~ | ✅ Concluido |
| ~~Instalar chrome-devtools e lsp-mcp~~ | ~~MCP debugging e LSP~~ | ~~Baixo~~ | ✅ Concluido |
| ~~Instalar superpowers, plannotator, code-review~~ | ~~Plugins de produtividade~~ | ~~Baixo~~ | ✅ Concluido |
| ~~Instalar plugins ui-ux-pro-max e context-mode via CLI~~ | ~~Ativar funcionalidade completa de plugins~~ | ~~Baixo~~ | ✅ Concluido |
| ~~Rodar `sync-all-to-home.sh`~~ | ~~Propagar 91 skills para ~/.claude/~~ | ~~Baixo~~ | ✅ Concluido |
| ~~Atualizar Claude Code~~ | ~~permission relay, --bare flag, /voice, /loop~~ | ~~Baixo~~ | ✅ **v2.1.108** (verificado 14/04) |
| ~~Atualizar context-mode~~ | ~~Corrige bug critico de tool naming~~ | ~~Baixo~~ | ✅ **v1.0.89** (verificado 14/04) |
| ~~Ativar Claude Code Channels (Telegram)~~ | ~~Controle do Claude Code via celular~~ | ~~Baixo~~ | ✅ `telegram` v0.0.4 ativo (verificado 14/04) |
| Instalar FMP MCP (Financial Modeling Prep) | Dados de mercado, M&A, valuation para CFO — 250+ ferramentas | Baixo | ⚠️ Pendente — `github.com/imbenrabi/Financial-Modeling-Prep-MCP-Server` |
| Instalar Alpha Vantage MCP | Dados macro, forex para board reporting | Baixo | ⚠️ Pendente — incluido em `scripts/install-financial-mcps.sh` |
| ~~Conectar Gmail no Cowork~~ | ~~Loop email → HubSpot → Calendar~~ | ~~Baixo~~ | ✅ Confirmado ativo (identificado em 23/03/2026) |
| Conectar **FactSet** no Cowork | Dados financeiros institucionais para CFO (M&A, valuations) | Baixo | 🆕 Disponivel — parceria LSEG, lancado fev/26 |
| Conectar **MSCI** no Cowork | ESG scores e risco de portfolio para CFO | Baixo | 🆕 Disponivel — lancado fev/26 |
| Remover `sanity-plugin` | Erro de boot — plugin nao encontrado no marketplace | Baixo | 🔴 Pendente — `/plugin remove sanity-plugin@claude-plugins-official` |
| Avaliar Composio MCP Gateway | Gateway unico para 500+ apps, SOC2/ISO — API key obrigatoria desde 5/03/2026 | Medio | ⚠️ Pendente — `claude mcp add composio` |
| Avaliar Datarails FinanceOS MCP | 400+ fontes financeiras, MCP nativo, FP&A autonomo — lancado marco/2026 | Medio | 🆕 Confirmado disponivel — solicitar demo em datarails.com |
| Usar `--bare` flag para scripts AO | Automacao mais rapida e deterministica em CI/CD e Agent Orchestrator | Baixo | 🆕 v2.1.83 — `claude --bare -p "ao status"` |
| Rodar `/context-mode:doctor` | Diagnosticar compressao | Baixo | Pendente |
| Configurar `claude-hud` statusLine | Personalizar metricas | Baixo | Pendente |
| Testar `ao doctor` | Validar AO health check | Baixo | Pendente |
| Conectar S&P Global, Supabase, Pigment no Cowork | Dados financeiros e FP&A | Baixo | Pendente |

### Medio Prazo (melhorias)
| Acao | Impacto | Esforco |
|------|---------|---------|
| Criar plugin Nuvini custom | Skills/prompts especificos da empresa | Medio |
| Criar CLAUDE.md por projeto | Contexto especifico por repo | Medio |
| Configurar hooks de pre-commit | Quality gates automaticos | Medio |
| Setup Sentry para projetos ativos | Error tracking real | Medio |
| Testar amem com mais projetos | Memoria cross-project | Medio |
| Explorar plugins do Anthropic official marketplace (55+) | Descobrir novos plugins | Medio |

### Longo Prazo (evolucao)
| Acao | Impacto | Esforco |
|------|---------|---------|
| Dashboard web do AO | Visibilidade de todos agents | Alto |
| Pipeline CI/CD com Claude | Automatizar reviews em PRs | Alto |
| Fine-tuning de prompts por projeto | Respostas mais precisas | Alto |
| Benchmark de plugins (context-mode vs sem) | Medir economia real | Medio |

---

## Scheduled Tasks

| Task | Schedule | Funcao |
|------|----------|--------|
| `weekly-setup-optimizer` | Segunda-feira 9h (cron: `0 9 * * 1`) | Revisao semanal do setup: verifica atualizacoes, gaps, melhorias, redundancias. Gera relatorio em `reports/weekly-setup-review-{date}.md` |

---

## Changelog

### 2026-03-23 (v7) — Weekly Optimization Review (3ª execução — rodada completa com web research)
- Terceira execução do `weekly-setup-optimizer` — rodada com buscas web completas
- **Health Score: 7.2/10** (leve melhora: Gmail confirmado ativo)
- Correção: **Gmail já está ativo no Cowork** (6 connectors, não 5 como documentado)
- Novo: **Claude Code v2.1.83** (dois patches acima do v2.1.81) — inclui `--bare` flag e `--channels` permission relay
- Novo: **Channels permission relay** — aprovar tool use de agents remotamente pelo celular (v2.1.83)
- Novo: **FactSet Cowork Connector** disponível (lançado fev/26, parceria LSEG) — dados M&A institucionais para CFO
- Novo: **MSCI Cowork Connector** disponível — ESG scores e risco de portfolio para CFO
- Novo: **DocuSign, Outreach, Similarweb** também disponíveis como Cowork Connectors
- Confirmado: **Datarails FinanceOS MCP** lançado oficialmente em março 2026 (datarails.com)
- Confirmado: **HubSpot MCP oficial** em public beta (alternativa ao Cowork Connector)
- Atualizado: `reports/weekly-setup-review-2026-03-23.md` com versão completa (v2)

### 2026-03-23 (v6) — Weekly Optimization Review (2ª execução)
- Segunda execução automática do `weekly-setup-optimizer` no mesmo dia
- **Health Score: 7.0/10** (mantido — nenhuma mudança estrutural aplicada ainda)
- Novo achado: **`--bare` flag no v2.1.81** — pula hooks, LSP, plugin sync e skill scans; ideal para AO + CI/CD pipelines (`ao batch-spawn`, scripts)
- Confirmado: **FMP MCP viável** — `github.com/imbenrabi/Financial-Modeling-Prep-MCP-Server`, 70k+ pontos de dados, API key grátis disponível
- Confirmado: **Opus 4.6 agora é modelo padrão** — 1M tokens context window, output 64k/128k
- Confirmado: **Composio API key enforcement** desde 5/03/2026 — requests sem `x-api-key` retornam 401
- Addendum adicionado em `reports/weekly-setup-review-2026-03-23.md`

### 2026-03-23 (v5) — Weekly Optimization Review
- Revisão semanal automática (weekly-setup-optimizer)
- **Health Score: 7.0/10** (queda de 0.5 — itens críticos pendentes pela 2ª semana)
- Novo: **Claude Code Channels** (anunciado 20/03/2026) — controle via Telegram/Discord, requer v2.1.81
- Novo: **MCP Elicitation** — MCP servers podem pedir input estruturado mid-task
- Novo no radar: **Composio MCP Gateway** — gateway único para 500+ apps, candidato a unificar MCPs fragmentados
- Novo no radar: **Datarails FinanceOS MCP** — 400+ fontes financeiras com MCP nativo, candidato prioritário para CFO
- Claude Code subiu de v2.1.76 → **v2.1.81** (novo mínimo para Channels)
- Promoção Anthropic: double usage limits durante off-peak até 27/03/2026
- Itens críticos ainda pendentes: context-mode v1.0.18 (bug crítico) + Claude Code desatualizado + FMP MCP não instalado
- Adicionados à lista de evoluções: Channels, Composio, Datarails
- Gerado: `reports/weekly-setup-review-2026-03-23.md`

### 2026-03-22 (v4) — Weekly Optimization Review
- Revisao semanal automatica (weekly-setup-optimizer)
- Identificado: context-mode v1.0.18 tem bug critico → atualizar para v1.0.42
- Identificado: Claude Code desatualizado → atualizar para v2.1.76 (novas features: /voice, /loop, 1M tokens, remote control)
- Novo: Scripts criados para execucao manual no terminal:
  - `scripts/update-urgent-2026-03-22.sh` — atualizacoes Claude Code + AO doctor + sync
  - `scripts/install-financial-mcps.sh` — FMP MCP + Alpha Vantage MCP (gap de CFO)
- Novo: `docs/MCP_FINANCIAL_CONFIG_SNIPPET.json` — snippet JSON pronto para copiar
- Novo: `reports/weekly-setup-review-2026-03-22.md` — relatorio completo de otimizacao
- Health Score: 7.5/10 (limitado por context-mode desatualizado + gap financeiro)
- Evolucoes Possiveis: 4 novos itens adicionados (atualizacoes urgentes + MCPs financeiros)

### 2026-03-13 (v3)
- Sync completado: 91 skills, 15 agents, 27 commands, 41 prompts propagados para `~/.claude/`
- Plugins ui-ux-pro-max e context-mode instalados via Claude Code CLI
- Novo: Scheduled task `weekly-setup-optimizer` (toda segunda 9h)
- Novo: Secao Scheduled Tasks
- Atualizado: Status de evolucoes (2 itens concluidos)

### 2026-03-12 (v2)
- MCP Servers: 14 → 16 (adicionados `chrome-devtools`, `lsp-mcp`)
- Plugins: 4 → 7 (adicionados `superpowers`, `plannotator`, `code-review`)
- Novo: Claude Squad (`cs`) como standalone tool
- Novo: Secao Cowork Connectors (HubSpot, Google Calendar, Google Drive, Notion, Slack)
- Novo: Secao Cowork Remote Plugin Skills (140+ skills em 19 namespaces)
- Atualizado: Evolucoes Possiveis com status de conclusao
- Adicionado: Changelog

### 2026-03-12 (v1)
- Documento inicial gerado com inventario completo do setup

---

*Atualizado em 2026-03-23 (v7). Source of truth: `~/Claude/`*
