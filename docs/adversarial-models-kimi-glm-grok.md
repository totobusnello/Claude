# Vozes adversariais no Claude Code — Kimi, GLM e Grok

> Como conectamos três modelos de famílias de treino distintas (Moonshot, Zhipu, xAI) **dentro das sessões do Claude Code** no Mac, pra usar como segunda/terceira/quarta opinião em review, challenge e Q&A — sem construir orquestração própria.
>
> Atualizado: 2026-07-10. Versões: kimi-code 0.18.0, kimi-plugin-cc 1.5.0, GLM-5.2, Grok 4.5.

---

## Por que isso existe

Claude revisando o próprio código tem ponto cego estrutural: erra e revisa com os **mesmos vieses de treino**. Modelos de famílias diferentes erram diferente e enxergam diferente — o valor está na **divergência**, não no consenso. O setup dá ao Claude, dentro da sessão, acesso a:

| Voz | Modelo | Provedor | Custo | Capacidade |
|---|---|---|---|---|
| Kimi | kimi (via kimi-code CLI) | Moonshot | **$0** (OAuth da subscription Kimi Coding) | read-only **e** write-capable (bounded) |
| GLM | GLM-5.2 | Zhipu / Z.ai | key da subscription GLM Coding | read-only |
| Grok | Grok 4.5 | xAI | API key paga (console.x.ai) | read-only |

Caso de uso canônico (validado em produção, sessão 09/jul na issue openclaw#102400): antes de postar análise técnica em repo público, rodar a tese por Kimi (`kimi:kimi-challenge`) **e** Grok (`grok-adversary`) em modo challenge. Um deles derrubou premissas frágeis; o outro produziu um "achado de código" plausível-porém-**falso** — que só não foi a público porque todo claim com número de linha é verificado no fonte antes de postar. As duas coisas são o ponto: adversários agregam **e** alucinam; o processo cobre ambos.

---

## Arquitetura — dois padrões distintos

```
Sessão Claude Code (main thread)
│
├── Agent tool ──► glm-adversary  (subagent haiku, orquestrador fino)
│                    └── Bash ──► ~/Claude/scripts/glm  ─► claude --bare -p ─► api.z.ai (Anthropic-compat)
│
├── Agent tool ──► grok-adversary (subagent haiku, orquestrador fino)
│                    └── Bash ──► ~/Claude/scripts/grok ─► claude --bare -p ─► api.x.ai (Anthropic-compat)
│
└── Agent tool ──► kimi:kimi-review / challenge / ask / rescue / swarm / pursue
                     └── Bash ──► kimi -p --output-format stream-json (kimi-code CLI local, OAuth)
                                    └── PreToolUse hook em ~/.kimi-code/config.toml impõe read-only/allowlist
```

**Padrão A — GLM e Grok: o harness do Claude vira o runtime do modelo terceiro.**
Ambos os provedores expõem endpoint **Anthropic-compatible**. O truque: rodar `claude --bare -p` apontando `ANTHROPIC_BASE_URL` pro provedor. O binário `claude` faz todo o trabalho de harness (agentic loop, tools Read/Grep/Glob, exploração do repo) — mas quem raciocina é o GLM/Grok. Nenhum SDK, nenhum servidor, ~45 linhas de bash por wrapper.

**Padrão B — Kimi: plugin oficial que dirige um CLI agentic local.**
O [kimi-plugin-cc](https://github.com/linxule/kimi-plugin-cc) roda o `kimi-code` (CLI Node.js da Moonshot) como subprocess. Kimi tem harness próprio, sessões persistentes/resumíveis, e um **PreToolUse hook** que impõe segurança por comando (read-only vs allowlist de escrita). Mais capaz que o padrão A (pode escrever código, rodar testes, fan-out paralelo), em troca de mais peças.

---

## Padrão A em detalhe — wrappers `glm` e `grok`

### Os scripts

`~/Claude/scripts/glm` e `~/Claude/scripts/grok` — mesma anatomia, só mudam endpoint/modelo/token:

| | glm | grok |
|---|---|---|
| Endpoint | `https://api.z.ai/api/anthropic` | `https://api.x.ai` (harness anexa `/v1/messages`) |
| Modelo default | `glm-5.2` | `grok-4.5` |
| Token | `~/.config/glm/token` | `~/.config/grok/token` |
| Variante opt-in | `GLM_MODEL='glm-5.2[1m]'` (contexto 1M) | `GROK_MODEL='grok-4.5-fast'` (mais barato) |

Núcleo do wrapper (idêntico nos dois, trocando as vars):

```bash
printf '%s' "$*" | env \
  -u ANTHROPIC_MODEL -u CLAUDECODE -u CLAUDE_CODE_ENTRYPOINT -u ENABLE_TOOL_SEARCH \
  ANTHROPIC_BASE_URL="$BASE_URL" \
  ANTHROPIC_API_KEY="$KEY" \
  ANTHROPIC_AUTH_TOKEN="$KEY" \
  ANTHROPIC_DEFAULT_OPUS_MODEL="$MODEL" \
  ANTHROPIC_DEFAULT_SONNET_MODEL="$MODEL" \
  ANTHROPIC_DEFAULT_HAIKU_MODEL="$MODEL" \
  claude --bare -p --model "$MODEL" --allowedTools "Read Grep Glob"
```

### As cinco decisões que fazem isso funcionar (e não explodir)

1. **`--bare` é o isolamento.** Pula plugin sync, hooks, auto-memory, CLAUDE.md e keychain, e usa **estritamente** `ANTHROPIC_API_KEY`. Consequências: o subprocess **não recursa** o ecossistema da sessão pai (sem loop de hooks/plugins) e **não toca o OAuth do plano Max** — impossível o wrapper "vazar" pro billing da Anthropic.
2. **Prompt via STDIN, não posicional.** `--allowedTools` é variádico (`<tools...>`) e engoliria um prompt posicional como se fosse nome de tool. `printf '%s' "$*" | claude -p` resolve.
3. **`env -u` limpa a herança da sessão pai.** `ANTHROPIC_MODEL`, `CLAUDECODE`, `CLAUDE_CODE_ENTRYPOINT`, `ENABLE_TOOL_SEARCH` herdados confundiriam o subprocess (ex.: tool search deferido num harness que não vai carregar MCP nenhum).
4. **Os três `ANTHROPIC_DEFAULT_*_MODEL` apontam pro modelo do provedor.** O harness resolve aliases internos (opus/sonnet/haiku) em vários caminhos; sem o remap, alguma rota tentaria pedir `claude-haiku-...` pra Z.ai/xAI e tomaria 404.
5. **`--allowedTools "Read Grep Glob"` = read-only por construção.** É voz de revisão, não de edição. O modelo explora o cwd sozinho (por isso o chamador passa **paths e diff**, não arquivos colados).

Tokens: arquivo texto puro com a key, `chmod 600`, **nunca** no script nem no git. GLM usa a key estática da subscription GLM Coding (endpoint Anthropic-compat da subscription — **não** a API pay-per-token, que está sem saldo); Grok usa API key do console.x.ai (paga — HTTP 403 "credits or licenses" = time xAI sem créditos, é billing, não bug).

### Os subagents `glm-adversary` e `grok-adversary`

Em `~/Claude/agents/00-core/` (sync pra `~/.claude/agents/`). São orquestradores **finos** em `model: haiku` (baratos — o pensamento pesado acontece no modelo remoto): montam contexto, invocam o wrapper **uma única vez**, e devolvem o veredito **cru, sem reescrever nem suavizar** (prefixado `### GLM-5.2 (Zhipu) — voz adversarial` / `### Grok 4.5 (xAI) — voz adversarial`; discordância do orquestrador vai depois, separada como `> nota do orquestrador:`).

Três modos, definidos no frontmatter/body do agent:

- **review** — captura `git diff` (working tree → staged → `<base>...HEAD`) e pede findings com severidade + arquivo:linha
- **challenge** — conteste a ABORDAGEM, não defeitos pontuais: premissa frágil, alternativa mais simples ignorada, onde cobra o preço em 6 meses
- **ask** — Q&A fundamentado nos arquivos do repo

**Gotcha crítico (custou as falhas de 2026-07-05):** a chamada Bash que invoca o wrapper DEVE usar `timeout: 600000` (10 min, o teto). Modelo remoto + exploração de repo passa fácil dos 120s default da tool Bash — que mata o processo com SIGTERM 143 no meio. E **uma invocação só por tarefa** — iterar é caro e lento.

---

## Padrão B em detalhe — Kimi via kimi-plugin-cc

### Instalação (a ordem importa)

```
# 1. kimi-code CLI (instala em ~/.kimi-code/bin/kimi) — docs em kimi.com/code/docs
# 2. Login OAuth da subscription Kimi Coding (kimi login) → credenciais em ~/.kimi-code/credentials + oauth/
# 3. No Claude Code:
/plugin marketplace add linxule/kimi-plugin-cc
/plugin install kimi@kimi-marketplace
/kimi:setup        # ← passo que instala o CONTRATO DE SEGURANÇA (ver abaixo)
```

**Auth = OAuth da subscription ($0 marginal).** O `config.toml` referencia `key = "oauth/kimi-code"` — nada de API key Moonshot. Atenção à distinção (lição de campo): a subscription OAuth funciona **aqui**, no kimi-code CLI local; ela **não** pluga como provider REST no gateway OpenClaw (lá só a API key Moonshot paga serviria). São duas rotas diferentes pro mesmo modelo.

### O `/kimi:setup` e o hook de segurança

`kimi -p` (modo headless) hard-coda `permission='auto'` — **auto-aprova todo tool call**. Sem mitigação, "review read-only" seria só uma promessa no prompt. O `/kimi:setup` instala um bloco gerenciado no `~/.kimi-code/config.toml`:

```toml
# === BEGIN kimi-plugin-cc-managed (v1.5.0) ===
# DO NOT EDIT — managed by /kimi:setup.
command = "'/usr/local/bin/node' '.../kimi/1.5.0/dist/hooks/approval-hook.js'"
timeout = 15
# === END kimi-plugin-cc-managed ===
```

Esse PreToolUse hook roda em **todo tool call de todo turn** do Kimi e impõe: comandos read-only (`review`, `challenge`, `ask`, review-gate) têm escrita **negada no hook**, não no prompt; `rescue`/`pursue`/`swarm --write` operam sob **workspace allowlist** e não podem mutar git state. Detalhe não-óbvio documentado no próprio bloco: o campo `matcher` é **omitido de propósito** — kimi-code compila matcher com `new RegExp(...)`; vazio = "todo tool", e a string `"*"` lançaria exceção e **desabilitaria o hook silenciosamente**. Não "consertar".

### Os 7 subagents que o plugin registra

O plugin expõe slash commands (`/kimi:review` etc.) **e** subagents despacháveis pela Agent tool de dentro da sessão:

| Subagent | O que faz | Escreve? |
|---|---|---|
| `kimi:kimi-review` | Review estruturado do diff (working tree ou branch) | não |
| `kimi:kimi-challenge` | Review adversarial da **abordagem** com foco custom | não |
| `kimi:kimi-ask` | Q&A em prosa fundamentado no repo | não |
| `kimi:kimi-swarm` | Fan-out de review paralelo em N alvos (exige `--budget`) | não |
| `kimi:kimi-rescue` | Delegação de trabalho real — bug hunt, refactor, fix + testes; sessão persistente/resumível | sim (allowlist) |
| `kimi:kimi-pursue` | Experimental: perseguir objetivo autônomo multi-turn (exige `--budget`) | sim (allowlist) |
| `kimi:kimi-swarm-write` | Fan-out de **edits** paralelos em worktree descartável → devolve `.patch` revisável (nunca aplica) | patch-only |

Regra prática de dispatch: challenge/review/ask cobrem 95% dos usos. Os write-capable exigem intenção explícita — não auto-promover um review pra rescue.

---

## Como usar dentro de uma sessão

Pedir ao Claude em linguagem natural já roteia (as descriptions dos agents fazem o match), mas o padrão de alto valor é o **paralelo adversarial** — famílias distintas atacando a mesma tese ao mesmo tempo:

```
"Rode este raciocínio pelo kimi-challenge e pelo grok-adversary em paralelo
 e me traga as divergências."
```

O Claude despacha os dois via Agent tool numa única mensagem (execução concorrente), cada um devolve veredito independente, e o main thread sintetiza — **sem harmonizar**: divergência é o produto.

Regras operacionais aprendidas em produção:

1. **`run_in_background: false`** quando o veredito é insumo do próximo passo — background devolve só notificações de idle e você fica sem o conteúdo na mão.
2. **Timeout 600000 nas chamadas Bash** dos wrappers glm/grok (SIGTERM 143 aos 120s default).
3. **Todo claim de código do adversário vai ao fonte antes de ir a público.** Grok produziu mecanismo com número de linha plausível e falso; `git clone` + `git show` de 30s refutou. Adversário é pra derrubar premissa sua — não pra terceirizar verificação.
4. **Uma invocação por tarefa** nos wrappers (caro/lento); Kimi rescue é a exceção (sessão persistente, `--resume`).
5. Read-only é **enforçado** (allowedTools no padrão A, hook no padrão B) — dá pra apontar os três pra qualquer repo sem medo de edição acidental.

---

## Segurança — resumo do modelo de confiança

| Camada | GLM/Grok (padrão A) | Kimi (padrão B) |
|---|---|---|
| Escrita | impossível: `--allowedTools "Read Grep Glob"` | negada por PreToolUse hook (read-only) ou allowlist (rescue) |
| Credenciais | token file `chmod 600`, fora de script/git | OAuth em `~/.kimi-code/` (sem key em texto) |
| Isolamento da sessão pai | `--bare` (sem hooks/plugins/memory/keychain) + `env -u` | subprocess próprio com harness próprio |
| Billing Anthropic | intocado (`--bare` ignora OAuth Max) | n/a |
| Git state | read-only | hook bloqueia mutação; swarm-write usa worktree descartável + patch |

Complemento no lado Claude: `sandbox.filesystem.denyRead` no `~/.claude/settings.json` bloqueia leitura de `~/.ssh`, `~/.aws`, `~/.gnupg` etc. — vale pros subagents também.

---

## Troubleshooting rápido

| Sintoma | Causa | Fix |
|---|---|---|
| Wrapper morre com exit 143 no meio | SIGTERM do timeout 120s default da Bash tool | `timeout: 600000` na chamada |
| `glm: API key não encontrada` | token file ausente/ilegível | gerar no dashboard Z.ai → `~/.config/glm/token`, `chmod 600` |
| Grok HTTP 403 "credits or licenses" | time xAI sem créditos | billing em console.x.ai — não é erro de código |
| Kimi review escrevendo arquivo | hook ausente (setup não rodou / bloco removido) | `/kimi:setup` de novo; conferir bloco managed no `config.toml` |
| Hook do Kimi "sumiu" após edição manual | `matcher = "*"` adicionado (RegExp inválida desabilita silencioso) | remover o matcher — omitido é o correto |
| Subagent adversarial devolve só "idle" | spawn com `run_in_background: true` | re-rodar síncrono (`run_in_background: false`) |

---

## Arquivos de referência

| O quê | Onde |
|---|---|
| Wrappers | `~/Claude/scripts/glm`, `~/Claude/scripts/grok` |
| Agents orquestradores | `~/Claude/agents/00-core/{glm,grok}-adversary.md` (sync → `~/.claude/agents/`) |
| Tokens | `~/.config/glm/token`, `~/.config/grok/token` (chmod 600) |
| Plugin Kimi | `~/.claude/plugins/cache/kimi-marketplace/kimi/<versão>/` |
| CLI + auth Kimi | `~/.kimi-code/` (`bin/kimi`, `config.toml`, `credentials/`, `oauth/`, `sessions/`) |
| Hook de segurança Kimi | bloco managed em `~/.kimi-code/config.toml` → `dist/hooks/approval-hook.js` |
| Repo do plugin | https://github.com/linxule/kimi-plugin-cc |
