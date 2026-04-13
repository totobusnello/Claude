# Claude Code Workspace

Workspace principal do Claude Code com 60 categorias de skills, 134+ agents especializados, 27 categorias de comandos e 41 templates de prompts. Inclui projetos como submodules, scripts de sincronização e documentação de referência para uso avançado do Claude CLI.

## Visão Geral

Este repositório é o ponto central de extensibilidade do Claude Code. Todos os skills, agents e comandos são mantidos aqui como source of truth e sincronizados automaticamente para `~/.claude/` via scripts ou cron noturno.

## Estrutura

```
Claude/
├── skills/                    # 60 categorias de skills automáticas
│   ├── autonomous-dev/        # Desenvolvimento autônomo PRD→stories→código
│   ├── commit/                # Commits semânticos inteligentes
│   ├── dev-browser/           # Navegação e testes de UI
│   ├── mcp-tools/             # Orquestração de agentes com cache
│   ├── presentation/          # Geração de apresentações PowerPoint/HTML
│   └── ...                    # 55+ categorias adicionais
├── agents/                    # 134+ agents especializados
│   ├── frontend/              # react-specialist, nextjs-developer, vue-expert
│   ├── backend/               # python-pro, golang-pro, rust-engineer
│   ├── devops/                # kubernetes-specialist, terraform-engineer
│   ├── data/                  # ml-engineer, data-scientist, llm-architect
│   └── ...                    # 14 categorias no total
├── commands/                  # 27 categorias de comandos slash
├── prompts/                   # 41 templates de prompts
├── Projetos/                  # Submodules de projetos individuais
│   ├── daily-tech-digest/     # Newsletter automatizada Daily Byte
│   ├── GalapagosApp/          # App mobile Galapagos Capital
│   ├── projeto-ai-galapagos/  # Plataforma Darwin AI
│   ├── posts-linkedin/        # Conteúdo LinkedIn com IA
│   ├── fake-news-check/       # Pesquisa de fact-checking
│   ├── Curso-AI/              # Curso IA para mercado financeiro
│   └── ...                    # Demais projetos
├── templates-powerpoint/      # 93 templates profissionais de PowerPoint
├── scripts/                   # Scripts de sincronização e automação
├── docs/                      # Documentação de referência (MCP, otimização)
├── CLAUDE.md                  # Guia principal de uso e detecção de projetos
├── INDEX.md                   # Índice mestre de todos os recursos
└── CATALOG.md                 # Catálogo de skills e agents
```

## Funcionalidades Principais

### Skills Automáticas
Skills são ativadas automaticamente por palavras-chave no prompt. Exemplos:
- "criar PRD" → skill `prd`
- "navegar site" → skill `dev-browser`
- "criar apresentação" → skill `presentation`
- "desenvolvimento autônomo" → skill `autonomous-dev`

### Agents por Tarefa

| Tarefa | Agents Recomendados |
|--------|---------------------|
| Frontend React/Next.js | `react-specialist`, `nextjs-developer` |
| Backend APIs | `python-pro`, `backend-developer` |
| Infraestrutura | `kubernetes-specialist`, `terraform-engineer` |
| Dados e ML | `ml-engineer`, `data-scientist`, `llm-architect` |
| Debugging | `debugger`, `error-detective` |
| Segurança | `security-auditor`, `penetration-tester` |
| Arquitetura | `architect`, `cloud-architect` |

### Estratégia de Modelos

- **Haiku** — busca de arquivos, lookups simples, revisões rápidas
- **Sonnet** — execução de código, desenvolvimento padrão
- **Opus** — arquitetura complexa, planejamento estratégico

### Swarms Paralelos
Para tarefas independentes, múltiplos agents podem ser lançados em paralelo para acelerar o trabalho significativamente.

## Sincronização

O workspace é sincronizado automaticamente de `~/Claude/` para `~/.claude/`:

```bash
# Sincronização manual
~/Claude/scripts/sync-all-to-home.sh

# Sincronização automática via launchd (23h diariamente)
```

## Templates PowerPoint

93 templates profissionais em `templates-powerpoint/allpowerpointtemplates/`:
- **Corporate/Business** (29 templates)
- **General/Multipurpose** (40 templates)
- **Financial** (7 templates)
- **Real Estate** (8 templates)
- **Marketing/Pitch** (6 templates)
- **Education** (3 templates)

## Como Usar

```bash
# Ver catálogo completo de skills e agents
cat ~/Claude/INDEX.md

# Ver agentes disponíveis por categoria
cat ~/Claude/CATALOG.md

# Invocar agent específico
"Use o agent typescript-pro para revisar este código"

# Ativar skill automaticamente
"Crie um PRD para esta feature"  # ativa skill 'prd'
```

---

Mantido por [totobusnello](https://github.com/totobusnello)
