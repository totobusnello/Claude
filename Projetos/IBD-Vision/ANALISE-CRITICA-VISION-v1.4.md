# Análise Crítica & Roadmap Evoluído — IBD Origination Agent (VISION v1.4)

**Data:** 24 jun 2026
**Método:** swarm de 6 lentes independentes sobre o `VISION.md` — `architect` (arquitetura de sistema), `critic` (adversarial), `analyst` (estratégia IBD/finance), `product-manager` (roadmap/RICE), `Kimi` (voz divergente) e `Codex` (voz divergente).
**Escopo:** crítica + roadmap evoluído. Não altera o `VISION.md` — é insumo para você decidir o que incorporar na v2.0.

---

## TL;DR

O `VISION.md` é um documento de visão **honesto** (o gap map em §8 é o melhor pedaço). Mas as 6 lentes convergem num diagnóstico desconfortável: **o plano entregou a metade fácil (catálogos, scans, schema, Pitch-Page Library) e a narrativa de capa vende uma v3 antes da v1 fechar a fundação.** A frase de abertura — "deixando ao banqueiro humano um único papel de gargalo: filtrar" — é, hoje, otimista ao ponto de inverter a realidade: o humano teria 5 papéis pesados, não 1 leve.

Duas vozes divergentes (Kimi e Codex), chegando por caminhos diferentes, propõem o mesmo redesenho de paradigma: o núcleo não deveria ser **"sinais × arquétipos"**, e sim **relacionamento + hipótese-com-contraevidência**. Vale levar a sério.

---

## 1. Convergência forte (o que 5-6 lentes apontaram independentemente)

Ordenado por gravidade. O número entre colchetes mostra quantas das 6 lentes levantaram cada ponto.

### 1.1 — Resolução de entidade é a fundação ausente [6/6]
Sem CNPJ/ticker como chave canônica, "Petrobras" (Valor), "PETR4" (B3) e "Petróleo Brasileiro S.A." (CVM) são três entidades distintas. **Consequência em cadeia:** o "data lake concentrado" (§2) vira pilha de fragmentos não-agregados; o score de confiança é *incomputável* (não dá pra somar fontes sem saber que são a mesma empresa); o gatilho do Triplex — que precisa de múltiplos sinais convergentes — quase nunca acende; a dedup é impossível. **É pré-requisito de 3 outros gaps críticos.**

### 1.2 — One-click pitch: "client-ready" vs "draft" é uma contradição perigosa [6/6]
O §5 diz "vira material client-ready"; o §5.4 diz "output é draft para revisão". Não pode ser as duas coisas. Para cliente tier-one: comps middle-market BR são escassos/ruins, EBITDA ajustado é artesanal, IFRS 16 muda leitura de múltiplos, e "pesquisa fresca via web" como fallback do Capital IQ é inaceitável para número client-facing. **Risco comportamental (Codex + critic):** o rótulo "one-click" induz revisão *superficial* — o banqueiro confia que a máquina fez o trabalho. Um múltiplo errado num deck tier-one é liability reputacional, não bug de UX.

### 1.3 — Capital IQ: obrigatório E instável, sem health check [5/6]
§4.4 "sem CIQ a ideia não avança" vs §7.5 "o servidor desconectou mid-session". São incompatíveis em produção. O fallback web degrada a validação **sem sinalizar que degradou** — números não-validados vazam pro pitch com aparência de validados. Falta health check, retry, snapshot versionado, degradação graciosa.

### 1.4 — Viés de confirmação é estrutural, não acidental [4/6]
O design (§2) é uma máquina de *encontrar razões para fazer o deal* — nunca razões para não fazer. Empresa alavancada? Triplex. Recebíveis altos? FIDC always-on (trigger automático). O `opportunity-assessor` (7 filtros) só age *depois* que a ideia já existe. **Codex cunhou a melhor formulação:** o plano "confunde validação com confirmação" — falta uma etapa explícita de **anti-tese** (por que essa ideia é ruim, por que o cliente recusaria, qual alternativa de mercado é melhor, qual sinal a invalida). Risco agravado nos produtos proprietários: vira máquina de justificar LRS/PX/FIDC em toda empresa com balanço pressionado.

### 1.5 — Loop de realimentação ausente → "inteligência coletiva" é marketing [4/6]
§4.2 vende "o repertório de um vira o repertório de todos"; §8.4 admite que o mecanismo de captura está faltando e o Anexo D é seção vazia. Sem telemetria (arquétipo → mandato?), ninguém sabe quais arquétipos geram deal e quais são teatro. A biblioteca só cresce por opinião, nunca é podada por evidência. O sistema **não aprende**.

### 1.6 — É um produto para uma pessoa, vendido como plataforma de time [4/6]
A skill "fala na voz do Carlos" (§8.7). Identidade e permissionamento não são features incrementais — permeiam schema (sinal pertence a quem? ideia visível a quem?), HubSpot write-back (em nome de quem?) e o lake. Retrofitar depois é caro. **Codex escalou isso para o risco mais grave e menos discutido:** ⚠️ **MNPI / conflito / NDA.** O agente lê HubSpot, e-mails, Granola, OneDrive e mandatos ativos — pode usar insight confidencial de um cliente para pitchar outro, cruzar cobertura entre banqueiros, ou contaminar originação com informação privilegiada. "O banqueiro revisa" não resolve. Exige classificação de informação, conflict check, trilha de fonte e bloqueio de uso por finalidade.

---

## 2. A divergência que importa: sequenciamento

Aqui as lentes **discordam**, e a discordância é o ponto de decisão mais útil deste memo.

- **architect, critic, Kimi, Codex** → *foundation-first*: endurecer resolução de entidade, score de confiança, resiliência CIQ, anti-tese e controles MNPI **antes** de investir no pitch engine. "Bonito sem rastreabilidade é inútil para um banco."
- **product-manager** → *MVP-first*: o one-click fim-a-fim está a **3 itens internos e desbloqueados** (catalogar Pitch-Page Library → handoff campo-a-campo → pesquisa fresca). Resolução de entidade é Fase 2 — *não trava* o primeiro pitch. Construir matching engine robusto antes de ter um pitch end-to-end é otimização prematura.

**Reconciliação proposta (síntese):** os dois lados não se contradizem de fato. O PM está certo que o one-click é alcançável rápido. As outras lentes estão certas que **shippar pitches convincentes sobre dados frágeis, sem proveniência e sem conflict check, é exatamente o risco reputacional/legal.** A saída não é "fundação OU pitch" — é **pitch engine com guardrails baratos desde o dia 1**:

1. **Proveniência por campo** (`ciq_validated` | `web_estimate` | `unvalidated`) — barato, e o Pitch Engine **recusa exportar** client-facing qualquer múltiplo que não seja `ciq_validated`. Resolve 1.2 e 1.3 sem bloquear o one-click.
2. **Health check do CIQ** no início do scan — barato, evita degradação silenciosa.
3. **Campos `cnpj`/`ticker` e `banker_id` no schema agora** — mesmo sem implementar a resolução/permissionamento completos. É grátis no schema vazio, caro depois de meses de dados.
4. **Etapa de anti-tese obrigatória** no `opportunity-assessor` — antes de qualquer pitch.

Com esses 4 guardrails, o one-click pode avançar **sem** virar "fábrica de pitches convincentes demais para teses frágeis" (Codex).

---

## 3. A tomada contrária sobre o paradigma (Kimi + Codex)

Vale destacar porque as duas vozes divergentes, sem se falarem, convergiram:

- **Kimi:** o paradigma certo é **relationship/memory-first** — um grafo vivo de empresas, decisores, mandatos, reuniões, deals perdidos e janelas de mudança, alimentado por Granola/e-mail/CRM. "Originação tier-one é menos sobre reconhecer padrões e mais sobre lembrar o que o cliente disse há 8 meses e saber quem tem acesso ao board. O pitch one-click é efeito colateral de uma boa memória institucional, não o produto central."
- **Codex:** o núcleo deveria ser um **ledger de hipóteses de negócio** — cada oportunidade é uma hipótese viva com evidência, contraevidência, fonte, confiança, dono de relacionamento, caminho até o decisor, conflito, economics pro cliente e pra GLPG, e próximo teste. Arquétipos entram como *templates de hipótese*; sinais entram como *evidência*; relacionamento e viabilidade comercial entram como *variáveis de primeira classe*. "O plano é product-first ('ache gatilho, aplique arquétipo, gere pitch'); originação boa é decision-first ('qual decisão econômica este cliente pode tomar agora, por que a GLPG tem direito de ganhar essa conversa, qual o menor teste pra provar isso?')."

**Leitura da síntese:** "sinais × arquétipos" não está *errado* — é uma boa camada de **triagem operacional**. O erro é tratá-la como o *núcleo*. O núcleo deveria ter relacionamento e contraevidência como cidadãos de primeira classe. Isso não exige jogar fora o que existe (deal-idea-library, scans, Signals Lake são reaproveitáveis como camadas); exige reposicionar o que é centro.

---

## 4. Furos de estratégia / economia IBD (lente `analyst`)

Específicos do negócio, e a maior contribuição única do swarm:

1. **A economia de fees não fecha no caso-base, só no Triplex — e o Triplex é raro.** LRS rende R$500K-2M; PX é "fee TBD"; o floor é R$5M. Uma perna isolada fica 60-90% abaixo do floor. O Triplex exige 3 gatilhos simultâneos na mesma empresa (interseção estreita). **Contradição:** o filtro GLPG (fee floor R$5M) *canibaliza* os próprios produtos proprietários diferenciados. O floor é hard (descarta LRS/PX standalone) ou Família 8 é exceção? O doc nunca reconcilia.
2. **O gatilho mais importante pode não ser detectável nas fontes citadas.** Depósitos judiciais (>R$50M) e dívida fiscal/REFIS (>R$30M) vivem em **notas explicativas de balanço** — não em fato relevante CVM, não em manchete de Valor. Capital IQ cobre mal notas explicativas de mid-caps BR. **Se o gatilho não é extraível de forma estruturada, o "radar" colapsa em trabalho manual e o fosso evapora.** Ponto único de falha da tese inteira.
3. **PX tem risco legislativo não-precificado.** Quitar dívida fiscal federal com precatórios pelo valor de face depende de regime legal específico (encontro de contas / EC 113 / decisão STF) que pode mudar. Tratar PX como arquétipo always-on, "fee TBD", sem flag de validade legislativa, é frágil.
4. **Descasamento firme × pipeline.** O firme forte é high grade (GIS); mas o pipeline originado por "empresa alavancada" é **high yield** (pocket WM, menos definido). Prometer bookrunner único em HY <R$300M sem firme robusto é prometer execução que pode falhar e queimar relacionamento.
5. **CORE/ADJACENT/STRETCH sem gate de ação = ruído** que empurra decisão pro humano (o gargalo que se quer reduzir).

**Onde está o fosso real (analyst):** *não* é "sinais × arquétipos" (qualquer banco com o mesmo stack replica). É a **Família 8 acoplada à detecção automática do gatilho** — LRS/PX só a Galapagos estrutura (seguradora + veículo próprios), e detectar *qual* empresa precisa antes do concorrente é defensável. Mas isso depende inteiramente do furo #2 (detecção do gatilho). **Validar a extração de gatilho antes de qualquer outra coisa.**

---

## 5. O que o doc NÃO menciona e deveria (gaps no próprio gap map)

- **Controles de MNPI / conflict check / NDA** (Codex) — o maior risco ausente.
- **Accountability / liability** — quem responde por uma tese errada, dado inventado que escapou, recomendação que dá errado? Zero menção. Agravante: LRS/PX foram modelados de **descrição verbal** do Carlos porque o PDF corrompeu (§8.3) — produto proprietário complexo baseado em memória oral, prestes a virar slide client-facing.
- **Métricas de sucesso / KPIs** — o doc é todo features e gaps; nenhum baseline (taxa ideia→mandato, tempo de filtro humano, taxa de retrabalho do pitch). Sem baseline, "melhora" é inverificável.
- **Critério de aceite do output** — nenhuma definição mensurável de "pitch bom o suficiente para não reescrever".
- **Plano de degradação graciosa** — o que o sistema faz, *visivelmente*, quando CIQ cai, PDF corrompe, Mail.Send não funciona.
- **Etapa de anti-tese** — descrita na seção 1.4.
- **Estratégia de teste do matching** — golden set, avaliação histórica contra deals reais. Como sabem que o arquétipo casado é o certo, e não o primeiro que encaixou?

---

## 6. Roadmap evoluído (proposto)

Funde a reordenação RICE do `product-manager` com os guardrails de fundação das demais lentes. Mudança-chave vs Seção 9 atual: **Estadão sai da lista de alto impacto** (é monitoramento de rotina); **guardrails baratos entram na Fase 1**; **resolução de entidade vira Fase 2** (não bloqueia o MVP, mas o schema é preparado já).

### Fase 0 — Guardrails baratos (junto com a Fase 1, dias)
- [ ] Proveniência por campo financeiro (`ciq_validated`/`web_estimate`/`unvalidated`); Pitch Engine recusa exportar não-validado client-facing.
- [ ] Health check ativo do Capital IQ no início do scan; ideia vai pra `pending_validation` se CIQ cair (em vez de fallback web silencioso).
- [ ] Campos `cnpj`, `ticker`, `banker_id`, `visibility_scope` no schema **agora** (grátis no schema vazio).
- [ ] Etapa de anti-tese obrigatória no `opportunity-assessor`.

### Fase 1 — Caminho crítico do one-click (1-2 semanas, tudo interno e desbloqueado)
- [ ] **F1.1** Catalogar Pitch-Page Library + correspondência arquétipo→páginas. *RICE: Reach 100% dos pitches, Impact máximo, Confidence alta, Effort médio. Líder.*
- [ ] **F1.2** Formalizar handoff campo-a-campo (field-mapping.md já em v0.1; expandir pros 14 deck types). *Effort baixo.*
- [ ] **F1.3** Automatizar pesquisa fresca no momento da geração (datada, com flag CIQ/IFRS 16). *Confidence média — depende de CIQ estável (ver Fase 0).*

### Fase 2 — Qualidade da inteligência (2-4 semanas após Fase 1)
- [ ] **F2.1** Resolução de entidade (CNPJ via Receita como autoridade; ticker→CNPJ via B3; fuzzy por razão social normalizada com fila de revisão manual abaixo do threshold). Reindexar o lake por CNPJ.
- [ ] **F2.2** Score de confiança por `source_tier` (regulatory_filing > company_ir > tier1_news > … > rumor). Depende de F2.1.
- [ ] **F2.3** Dedup `(cnpj, signal_type, date_bucket)`. Mesma chave de F2.1.
- [ ] **F2.4** Matching com `match_score` (não booleano) + regra de arquétipos mutuamente reforçantes vs. exclusivos (Triplex suprime as pernas quando as 3 acendem).
- [ ] **F2.5** Validação encadeada automatizada por arquétipo.

### Fase 3 — Escala e inteligência coletiva
- [ ] **F3.1** Loop de realimentação (telemetria mínima já: cada ideia ganha `idea_id`, cada mandato HubSpot ganha `originated_from_idea_id` — fecha o loop arquétipo→mandato sem o mecanismo completo).
- [ ] **F3.2** HubSpot write-back (ideia → deal/opportunity).
- [ ] **F3.3** Permissionamento + dedup entre banqueiros + camada multi-banker + **conflict/MNPI check**.

### Monitorar (fora do roadmap)
- Estadão newsletter (já configurada; só verificar quando chegar).
- PDF LRS / apresentação PX (bloqueados; desbloqueiam quando o Carlos entregar — usar arquétipo pela descrição verbal **com flag de não-validado** enquanto isso).

**Critérios de aceite** sugeridos para F1.1, F1.2, F1.3 e F2.1 estão detalhados na saída do `product-manager` (disponível mediante pedido).

---

## 7. Perguntas abertas para Carlos / Toto (precisam de quem conhece o mercado)

1. **Fee floor R$5M é hard gate ou Família 8 é exceção explícita?** (define se o agente descarta os produtos mais diferenciados)
2. **Frequência histórica real do Triplex completo** — de quantas empresas estressadas os 3 gatilhos coincidem? Se <1 em 20, o Triplex é vitrine, não motor de receita.
3. **Depósito judicial (>R$50M) e dívida fiscal (>R$30M) são extraíveis de forma estruturada de *alguma* fonte?** (define se a originação é automática ou só assistida — é o ponto único de falha da tese)
4. **Fee do PX + risco legislativo do encontro de contas?**
5. **Quem fica firme em high yield <R$300M?**
6. **Qual o apetite por reposicionar o núcleo** de "sinais × arquétipos" para "relacionamento/hipótese-first" (Kimi/Codex), ou manter arquétipos no centro e relacionamento como camada?

---

*Memo gerado por swarm de 6 lentes (4 Claude Opus + Kimi + Codex). As saídas completas de cada lente ficam disponíveis na sessão para drill-down em qualquer ponto.*
