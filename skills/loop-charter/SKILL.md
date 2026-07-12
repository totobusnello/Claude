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
| 2. ITEM | "Onde vive o trabalho e o que conta como 1 item?" | …não apontar um arquivo/fonte concreto + uma unidade contável. Sem isso, não há loop — pare e diga isso. |
| 3. GATE_ITEM | "Como uma MÁQUINA prova que 1 item ficou pronto?" | …não passar na RUBRICA abaixo. **Insista aqui. É o ponto que faz ou quebra o loop.** |
| 4. ESCOPO | "Quantos itens por run (teto N)? Toca código/git? Se sim, quem faz o merge-back do worktree?" | …não der um N numérico. Git=sim → liga worktree + exige decisão de merge (default: gate humano). |
| 5. GATE_HUMANO | "O que neste projeto exige VOCÊ? (gastar dinheiro, deletar, enviar externo)" | (sempre pergunte — popula a regra "precisa do Toto") |
| 6. CONVENCOES *(opcional)* | "Onde estão os padrões do projeto? (default: CLAUDE.md/README)" | (se não responder, usa o default) |

**RUBRICA do GATE_ITEM (Q3) — o gate proposto só passa se responder SIM às 4:**
1. **Determinístico?** Mesmo item, mesmo input → mesmo veredito. Se depende de humor/interpretação, não é gate.
2. **Retorna boolean?** Reduz a pronto/não-pronto. "Melhorou" não é boolean; "teste X passa" é.
3. **Roda sem humano?** Um comando/check que a máquina executa sozinha. Se precisa de alguém olhando, é gate humano (Q5), não o da Q3.
4. **Falsificável?** Existe um resultado observável que PROVA que falhou. Se nada pode reprová-lo, ele não prova nada.
Falhou em qualquer uma → devolva pro usuário e reformule. Ex.: "revisado" → falha (1,2,4). Reformula pra "todos os campos obrigatórios preenchidos + lint sai 0". Se DE VERDADE não dá pra mecanizar, aí sim cai no Check 2 (LLM-reviewer) — mas só depois de tentar a rubrica.

Se o projeto **ainda não tem a lista de itens**, avise que o charter inclui um bloco
DISCOVERY (Run 0) que popula o LOOP-STATE — confiável pra fontes enumeráveis (arquivos,
linhas, registros). Pra código de escopo aberto, o DISCOVERY só PROPÕE a lista e para
pra você validar antes de rodar (senão alucina trabalho).

Dica de ferramenta: use `AskUserQuestion` só pros toggles fechados (N, git sim/não).
As perguntas 1–3 são abertas e precisam de pushback — faça em texto.

## Passo 2 — Gere os 2 arquivos

Pergunte onde salvar (default: cwd do projeto). Pergunte o nome curto do projeto (`<proj>`).
Escreva com a tool Write. Substitua os {{...}} pelas respostas. Apague a linha `[GIT]` se
o loop não toca git.

**Arquivo A — `LOOP-charter-<proj>.md`:**

```
You are running as a loop. Here is your charter.

GOAL
{{GOAL}}

TRABALHO
{{ITEM}}

DISCOVERY (só roda se o LOOP-STATE ainda não existir)
Fonte ENUMERÁVEL (arquivos, linhas, registros): varre {{ITEM}} e cria um item `pendente` por unidade. Confiável, segue direto pra EXECUÇÃO.
Código de escopo ABERTO (CI falhando, issues, commits): DISCOVERY só PROPÕE a lista — NÃO processa. Para no fim do Run 0 e registra em "precisa do Toto" pra validar o escopo antes de qualquer maker rodar.
Se a lista já existe, pula este bloco.

EXECUÇÃO
- Um item por vez, termina antes de começar o próximo.
- Segue os padrões do projeto (lê {{CONVENCOES}} antes de produzir). Não inventa novos.
- PULA todo item já `pronto` ou `bloqueado` no LOOP-STATE. Só processa pendentes.
- Item que já `bloqueado` em 2 runs seguidos (vê no LOOP-STATE) → NÃO retenta: vira `precisa-do-Toto` automático. Não martela.
- Decisão humana ({{GATE_HUMANO}}) → para nesse item, registra na seção "precisa do Toto"
  do LOOP-STATE, passa para o próximo.
- [GIT] Se o item alterar código/git, roda em worktree isolado (isolation: worktree). O merge-back pra branch principal é decisão explícita ({{MERGE}}, default: gate humano) — nunca deixa worktree órfão.

GATE-DO-ITEM — check mecânico primeiro, LLM-reviewer só de fallback
Maker: produz o resultado do item.
Check 1 (mecânico, sempre que der): roda {{GATE_ITEM}} como prova de máquina — comando sai 0 / teste passa / campo existe / arquivo bate contra checklist. Passou → `pronto` + registra a PROVA (output do comando / path do artifact) na coluna `prova` do LOOP-STATE. Modelos iguais erram junto; não gaste 2ª opinião LLM onde a máquina já decide.
Check 2 (LLM-reviewer, SÓ no que não dá pra mecanizar): checker SEPARADO julga contra {{GATE_ITEM}}. Ordem de preferência da separação: (a) outro modelo (glm-adversary/kimi) se você tiver como rotear; (b) se o motor é o mesmo modelo (ScheduleWakeup nativo é), no MÍNIMO fresh-context — spawn novo, SEM o raciocínio do maker no contexto. Um checker que herda o contexto do maker não é checker, é o maker se aprovando. A prova a registrar é o veredito + a razão citando {{GATE_ITEM}}.
Só o checker marca `pronto`; o maker nunca aprova o próprio trabalho.
Falhou → maker tenta de novo. Após 3 tentativas → `bloqueado` + motivo, segue.

GATE-DO-RUN
Um checker (não o maker) confirma: todo item está `pronto` ou `bloqueado`. Zero pendentes.
RECONCILIAÇÃO (o disco pode mentir): antes de declarar convergência, re-roda {{GATE_ITEM}} numa amostra de itens `pronto` (default: √n, mín. 2). Se algum falhar agora — artifact revertido, dependência quebrou, prova desatualizada — o item volta pra `pendente` e o run NÃO convergiu. Loop sobre fonte enumerável barata: reconcilia todos. State-on-disk só vale se bater com a realidade.

ESTADO
Mantém LOOP-STATE-<proj>.md. Início do run: lê esse arquivo PRIMEIRO; reconstrói o pendente
a partir dele, não da memória. Fim de cada item: atualiza a linha (status + o que mudou + prova)
ANTES de pegar o próximo. Anota no log de runs quando um item bloqueia, pra detectar os 2-runs-seguidos.

PARADA
Para quando GATE-DO-RUN é verdade, OU após {{N}} itens neste run.
Entrega relatório: feitos | bloqueados (com motivo) | precisa do Toto (com a pergunta exata).
Lembrete: `pronto` é uma claim do checker, não prova. Toto lê o que o loop fez antes de confiar.
```

**Arquivo B — `LOOP-STATE-<proj>.md`:**

```markdown
# LOOP-STATE — <proj>
Atualizado: [data] · Run: 0

## Itens
| item | status | o que mudou | prova (output/path do gate) | motivo (se bloqueado) |
|---|---|---|---|---|
| (preencha, ou deixe o DISCOVERY popular) | pendente | — | — | — |

## Precisa do Toto
- (vazio)

## Log de runs
- (vazio — anota aqui quando item bloqueia, pra pegar 2 runs seguidos)
```

## Passo 3 — Hand off do motor

Entregue o comando pra engatar. Default pra "1 arquivo, 1 item por linha":

> **ScheduleWakeup nativo** — cole o conteúdo de `LOOP-charter-<proj>.md` como prompt do loop;
> o harness re-invoca entre itens. Zero infra.

Alternativas (mencione só se couber): `herdr` agent loop (paralelo + worktree de graça);
bash `while` + `claude -p` (isolamento por processo, Ralph clássico — ver skill
`autonomous-loop/ralph` pra execução de tarefa de código).

## Princípios (não negocie)

- **Check mecânico > 2ª opinião LLM.** O gate da Q3 roda como máquina primeiro (sai 0, teste
  passa, campo existe). LLM-reviewer só onde não dá pra mecanizar — modelos iguais erram junto.
- **Maker ≠ checker — e separação real.** Quem produz nunca aprova o próprio item. Outro
  modelo se der; senão, no mínimo fresh-context (checker herdando o contexto do maker é o
  maker se aprovando). É o que faz "pronto" valer quando o Toto sai da cadeira.
- **Estado no disco, não no contexto.** O agente esquece entre runs; o LOOP-STATE não.
  Item que bloqueia 2 runs seguidos vira precisa-do-Toto — o loop não martela.
- **`pronto` é claim, e a prova fica na state.** Anti cognitive-surrender: cada `pronto`
  guarda a evidência (output/path) e a convergência reconcilia uma amostra contra a realidade —
  o disco pode mentir. O loop é serviço do Toto, não piloto; o relatório sempre diz o que precisa dele.
