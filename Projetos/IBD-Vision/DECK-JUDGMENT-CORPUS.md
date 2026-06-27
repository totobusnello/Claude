# Deck "Agentic IBD Vision" — evolução Judgment Corpus

> Sessão 2026-06-26. Registro das decisões estratégicas e mudanças aplicadas ao deck.
> Deck final: `Agentic IBD Vision.pptx` (24 slides). Backups: `*.bak.pptx`.
> Deck original editado: `IBD Vision System.pptx` (22 slides, 7 edições de texto).

## Decisões estratégicas fixadas

1. **É ferramenta INTERNA da Galapagos**, não produto pra vender a bancos.
   → Economics = ROI de produtividade. Risco #1 = **adoção do MD sênior**. Commoditização (BTG/XP replicarem) é risco de 2ª ordem.

2. **O moat é o Judgment Corpus, não as personas.**
   - Persona é o *invólucro*; o ativo é o **julgamento estruturado** (rationale + alternativas descartadas + outcome de deals reais).
   - "Falar na voz do Carlos" = cosplay de estilo = key-person risk, não moat.
   - Teste: a persona justifica uma recomendação citando precedente real do histórico? Sim = moat. Só "soa como banker" = cosplay.

3. **Backfill de 14 anos mata o cold start.** O histórico legado injetado no datalake faz o corpus nascer povoado — argumento mais forte do deck ("nascemos povoados; o concorrente começa do zero"). A **curadoria sênior** no pipeline é o motor de adoção (revisa em vez de criar), não um custo.

4. **Attestation gap** (achado do Kimi): sistema rápido + polido faz a revisão humana virar ritual vazio → quem assina o erro? Resolvido pelo mesmo mecanismo do moat: toda recomendação **cita precedente do corpus** → revisão defensável.

## Mudanças aplicadas ao deck

**2 slides novos** (Claude design):
- **Slide 10 · Judgment Corpus** — níveis aninhados Deal record ⊃ Judgment Unit (o ativo) ⊃ Evidence + faixa de heurísticas da casa.
- **Slide 18 · Cold start** — pipeline de backfill em 6 passos (Inventário → Ingestão/S3 [wall] → Extração → Estruturação → Curadoria sênior → Indexação KB+embeddings).

**Ajuste de layout** (Claude design):
- **Slide 5** — Judgment Corpus promovido a **núcleo/motor**; os outros 5 módulos (Research, Valuation, Pitch, Diligence, Compliance) abaixo. ("Memory" deixou de ser 6º item.)

**7 edições de texto** (Claude Code; reaplicadas no deck novo onde faltavam):
| Slide (24-deck) | Mudança |
|---|---|
| 2 | "Persona = contrato operacional, lastreada no Judgment Corpus da casa" |
| 4 | estágio 5 → "Judgment Corpus: 14 anos de house view codificada" |
| 5 | Memory → Judgment Corpus (coberto pelo design) |
| 15 | Evidência cita "precedente do corpus" (fecha attestation gap) |
| 19 | Foundation → "Judgment Corpus: backfill + curadoria" |
| 22 | Analyst → "cura o Judgment Corpus" |

## Schema do Judgment Corpus (referência)

- **Nível 1 — Deal record:** setor/subsetor, geografia, tipo, faixa de EV, período, team lead, outcome (fechou/abortou; múltiplo final vs. expectativa).
- **Nível 2 — Judgment Unit (o ativo):** decision_type · context · decision · **rationale** · **alternatives_rejected** · signals_used · decided_by · conviction · outcome/lesson.
- **Nível 3 — Evidence:** fonte (Capital IQ, Bloomberg, Valor, nota explicativa, ata), tipo, data, confidence, hash.
- **Camada heurística:** regras da casa destiladas de N units (ex.: "recusamos quando dívida fiscal/REFIS > X% do EV").

## Adversariais rodados

- Swarm 6-agents → `ANALISE-CRITICA-VISION-v1.4.md` (entity-resolution gaps, MNPI, sequencing).
- Kimi challenge → achado novo: **attestation gap**; + furos regulatórios BR.

## Pendências conscientes

1. **Business case / ROI** — gap #1. Horas de analyst/associate economizadas × deals/ano × custo/hora, contra build + run (Bedrock + dados + Bloomberg).
2. **Regulatório BR** — CVM Res. 35/2021 (conflito M&A), BACEN (target instituição financeira), LGPD 15-16 (retenção Signals Lake). Parqueado pra entrar junto do business case.
3. **Riscos de dados** — Bloomberg proíbe derivação; entity resolution BR frágil; comps mid-market BR esparsos (muita empresa fechada).
4. Polimento visual final do deck (opcional, com o design).
