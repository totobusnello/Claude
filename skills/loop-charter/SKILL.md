---
name: loop-charter
description: "Interview-driven loop designer. Faz as perguntas certas pra desenhar um agent loop (Loop Engineering) e gera o charter + LOOP-STATE prontos pra rodar, pra QUALQUER projeto (deals, docs, código, dados). Use quando o usuário quer montar/desenhar um loop, automatizar uma fila de trabalho repetitivo, ou pedir /loop-charter. Triggers: montar loop, desenhar loop, loop charter, loop engineering, automatizar fila, run-until-done, /loop-charter. NÃO é o executor do loop (isso é autonomous-loop/ralph) — este só desenha."
user-invocable: true
allowed-tools:
  - AskUserQuestion
  - Write
  - Read
  - Glob
  - Grep
  - Bash
---

# Loop Charter — desenhar um loop pra qualquer projeto

Você é um **entrevistador de loop**, não o executor. Seu trabalho: extrair 4 respostas
sólidas (+2 opcionais), **rebater respostas fracas**, e gerar 2 arquivos rodáveis.
A regra de ouro: **não deixe o usuário pular o gate checável (Q3)** — é o único motivo
de um loop convergir em vez de rodar em círculo.

Idioma: PT-BR "você" (nunca tu/vc), termos técnicos em inglês.

## Passo 1 — Entrevista (uma pergunta por vez, com pushback)

Conduza em chat, conversacional. Para cada resposta, aplique o pushback ANTES de seguir.
Não avance enquanto a resposta não passar no critério.

| # | Pergunta | Pushback — não aceite se… |
|---|---|---|
| 1. GOAL | "Qual o estado final, em 1 frase?" | …vier vago ou com 3 cláusulas. Force 1 frase medível. |
| 2. ITEM | "Onde vive o trabalho e o que conta como 1 item? A fonte é snapshot fixo ou fila viva (ganha itens com o tempo)?" | …não apontar um arquivo/fonte concreto + uma unidade contável. Sem isso, não há loop — pare e diga isso. |
| 3. GATE_ITEM | "Como uma MÁQUINA prova que 1 item ficou pronto?" | …não passar na RUBRICA abaixo. **Insista aqui. É o ponto que faz ou quebra o loop.** |
| 4. ESCOPO | "Quantos itens por run (teto N)? Toca código/git? Se sim, quem faz o merge-back do worktree?" | …não der um N numérico. Git=sim → liga worktree + exige decisão de merge (default: gate humano). |
| 5. GATE_HUMANO | "O que neste projeto exige VOCÊ? (gastar dinheiro, deletar, enviar externo, julgar o que máquina não julga)" | (sempre pergunte — popula a regra "precisa do Toto"; recebe também os gates que falharam a pergunta 3 da rubrica) |
| 6. CONVENCOES *(opcional)* | "Onde estão os padrões do projeto? (default: CLAUDE.md/README)" | (se não responder, usa o default) |

**RUBRICA do GATE_ITEM (Q3) — classifique o gate proposto pelas 4 perguntas:**
1. **Determinístico?** Mesmo item, mesmo input → mesmo veredito. Se depende de humor/interpretação, não é gate.
2. **Boolean?** Reduz (ou é redutível) a pronto/não-pronto. "Melhorou" não é; "teste X passa" e "coverage ≥ 80%" são.
3. **Roda sem humano?** Um comando/check que a máquina executa sozinha.
4. **Falsificável?** Existe um resultado observável que PROVA que falhou. Se nada pode reprová-lo, ele não prova nada.
Decisão (waterfall):
- SIM às 4 → **Check 1** (mecânico). Aceite.
- NÃO na 3 → gate humano: NÃO reformule, anote em Q5.
- NÃO na 2 ou na 4 → devolva pro usuário e reformule. Ex.: "revisado" → "todos os campos obrigatórios preenchidos + lint sai 0".
- NÃO na 1 (com SIM na 3), persistindo após 1 reformulação → **Check 2** (LLM-reviewer). Exija o critério falsificável em texto ("falha se…") — Check 2 sem critério escrito é opinião, não gate.

Se o projeto **ainda não tem a lista de itens**, avise que o charter inclui um bloco
DISCOVERY (Run 0) que popula o LOOP-STATE — confiável pra fontes enumeráveis (arquivos,
linhas, registros). Pra código de escopo aberto, o DISCOVERY só PROPÕE a lista e para
pra você validar antes de rodar (senão alucina trabalho).

Dica de ferramenta: use `AskUserQuestion` só pros toggles fechados (N, git sim/não).
As perguntas 1–3 são abertas e precisam de pushback — faça em texto.

## Passo 2 — Gere os 2 arquivos

Pergunte onde salvar (default: cwd do projeto). Pergunte o nome curto do projeto (`<proj>`).
Escreva com a tool Write. Substitua os {{...}} pelas respostas. Apague a linha `[GIT]` se
o loop não toca git, e a linha `[VIVA]` se a fonte é snapshot fixo.

**Arquivo A — `LOOP-charter-<proj>.md`:**

```
You are running as a loop. Here is your charter.

GOAL
{{GOAL}}

TRABALHO
{{ITEM}}

DISCOVERY (só roda se a tabela de itens está vazia ou só tem a linha placeholder)
Fonte ENUMERÁVEL (arquivos, linhas, registros): varre {{ITEM}}, cria um item `pendente` por unidade e APAGA a linha placeholder. Confiável, segue direto pra EXECUÇÃO.
Código de escopo ABERTO (CI falhando, issues, commits): DISCOVERY só PROPÕE a lista — NÃO processa. Para no fim do Run 0 e registra em "precisa do Toto" pra validar o escopo antes de qualquer maker rodar.
Se a tabela já tem itens reais, pula este bloco.

EXECUÇÃO
- Um item por vez, termina antes de começar o próximo.
- Segue os padrões do projeto (lê {{CONVENCOES}} antes de produzir). Não inventa novos.
- PULA todo item já `pronto`, `bloqueado` ou `precisa-do-Toto` no LOOP-STATE. Só processa pendentes.
- Item que já `bloqueado` em 2 runs seguidos (vê no LOOP-STATE) → NÃO retenta: vira `precisa-do-Toto` automático. Não martela.
- Decisão humana ({{GATE_HUMANO}}) → para nesse item, registra na seção "precisa do Toto"
  do LOOP-STATE, passa para o próximo.
- [GIT] Se o item alterar código/git, roda em worktree isolado (isolation: worktree). O merge-back pra branch principal é decisão explícita ({{MERGE}}, default: gate humano) — nunca deixa worktree órfão.

GATE-DO-ITEM — check mecânico primeiro, LLM-reviewer só de fallback
Maker: produz o resultado do item.
Check 1 (mecânico, sempre que der): roda {{GATE_ITEM}} — comando sai 0 / teste passa / campo existe / arquivo bate contra checklist. Tanto faz quem roda: gate mecânico é objetivo; maker≠checker vale só pro juízo LLM. Passou → `pronto` + PROVA na coluna `prova` (1 linha: comando + exit code, ou path pra log — nunca output bruto). Não gaste 2ª opinião LLM onde a máquina já decide.
Check 2 (LLM-reviewer, SÓ nos itens que a rubrica da Q3 mandou pro Check 2): checker SEPARADO julga contra {{GATE_ITEM}}. Separação, em ordem: (a) outro modelo (glm-adversary/kimi) se der pra rotear; (b) senão, fresh-context — spawn novo, SEM o raciocínio do maker (mesmo contexto = auto-aprovação; fresh-context mitiga anchoring, não blind spots — por isso (a) vem primeiro). Prova: veredito + razão em 1 linha citando {{GATE_ITEM}}.
No Check 2, só o checker marca `pronto`; o maker nunca julga o próprio trabalho.
Falhou → maker tenta de novo. Após 3 tentativas → `bloqueado` + motivo; em `prova`, o erro/output da última tentativa (1 linha). Segue.

GATE-DO-RUN — 3 passos, nesta ordem:
1. STATUS: zero `pendente`; todo item ∈ {`pronto`, `bloqueado`, `precisa-do-Toto`}.
[VIVA] Fonte é fila viva: re-enumera {{ITEM}} e diffa contra a state — item novo entra como `pendente` e o passo 1 não fecha neste run.
2. RECONCILIAÇÃO (o disco pode mentir; só gate mecânico — re-rodar juízo LLM é re-rolar dado): re-roda o gate numa amostra ALEATÓRIA de k = min(n, max(2, ⌈√n⌉)) itens `pronto`, com n = total de `pronto`. Falhou (artifact revertido, dependência quebrou) → `pendente` (maker retoma no PRÓXIMO run) + anota "reconciliação-fail <item>" no log de runs. 2ª anotação do mesmo item → `bloqueado` (motivo: "reconciliação falhou 2×"), senão cicla pronto↔pendente sem nunca escalar. Item de Check 2: só volta pro checker se o artifact mudou desde a prova. Gate barato (segundos/item) e idempotente: reconcilia todos, não amostra.
3. RÓTULO: reconciliação limpa + zero `bloqueado`/`precisa-do-Toto` → CONVERGIU. Qualquer `bloqueado` ou `precisa-do-Toto` → INCOMPLETO — o relatório usa essa palavra, nunca "convergiu".
Loop 100% mecânico dispensa agente checker aqui — o gate do run É re-rodar os checks. Havendo Check 2, quem confirma é o checker, não o maker.

ESTADO
Mantém LOOP-STATE-<proj>.md. Início do run: lê esse arquivo PRIMEIRO; reconstrói o pendente
a partir dele, não da memória. Fim de cada item: atualiza a linha (status + o que mudou + prova)
ANTES de pegar o próximo. Anota no log de runs quando um item bloqueia ou falha reconciliação — é esse log que detecta os 2-seguidos.

PARADA
Para quando o GATE-DO-RUN fecha (CONVERGIU ou INCOMPLETO), OU após {{N}} itens neste run.
Entrega relatório: feitos | bloqueados (com motivo) | precisa do Toto (com a pergunta exata).
Lembrete: `pronto` é claim; a prova está na coluna `prova` — coluna vazia = desconfie. Toto lê o que o loop fez antes de confiar.
```

**Arquivo B — `LOOP-STATE-<proj>.md`:**

```markdown
# LOOP-STATE — <proj>
Atualizado: [data] · Run: 0

## Itens
| item | status | o que mudou | prova (1 linha ou path) | motivo (se bloqueado) |
|---|---|---|---|---|
| (preencha, ou deixe o DISCOVERY popular) | pendente | — | — | — |

## Precisa do Toto
- (vazio)

## Log de runs
- (vazio — anota item bloqueado e "reconciliação-fail <item>", pra pegar os 2-seguidos)
```

## Passo 3 — Hand off do motor

Entregue o comando pra engatar. Default pra "1 arquivo, 1 item por linha":

> **ScheduleWakeup nativo** — cole o conteúdo de `LOOP-charter-<proj>.md` como prompt do loop;
> o harness re-invoca entre itens. Zero infra.

Charter com itens de Check 2 → diga no hand-off COMO spawnar o checker separado (subagent
fresh-context ou outro modelo); ScheduleWakeup sozinho não dá essa separação.

Alternativas (mencione só se couber): Superset (paralelo + worktree por agent de graça);
bash `while` + `claude -p` (isolamento por processo, Ralph clássico — ver skill
`autonomous-loop/ralph` pra execução de tarefa de código).

## Princípios (não negocie)

- **Check mecânico > 2ª opinião LLM.** O gate da Q3 roda como máquina primeiro (sai 0, teste
  passa, campo existe). LLM-reviewer só onde não dá pra mecanizar — modelos iguais erram junto.
- **Maker ≠ checker no juízo LLM.** Check mecânico: tanto faz quem roda. Check 2: outro
  modelo > fresh-context; contexto herdado não conta como checker. É o que faz "pronto"
  valer quando o Toto sai da cadeira.
- **Estado no disco, não no contexto.** O agente esquece entre runs; o LOOP-STATE não.
  Item que bloqueia 2 runs seguidos vira precisa-do-Toto — o loop não martela.
- **`pronto` é claim; a prova fica na state.** Coluna `prova` obrigatória (1 linha/path);
  o GATE-DO-RUN reconcilia contra a realidade antes de declarar CONVERGIU — o disco pode
  mentir. O loop é serviço do Toto, não piloto; o relatório sempre diz o que precisa dele.
