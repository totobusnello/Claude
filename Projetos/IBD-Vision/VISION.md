# IBD Origination Agent: Vision & Architecture Spec

**Versão:** 1.4
**Data:** 24 jun 2026
**Autor:** Carlos Parizotto, Head of IBD, Galapagos Capital
**Propósito:** documento mestre de visão, portável entre contas (export daqui, import na conta corporativa). Descreve o agente de originação fim-a-fim, do sinal ao pitch, e mapeia explicitamente as peças faltantes.

**Changelog v1.4 (23-24 jun 2026):**
- Pitch-Page Library: v0.3 concluída — 14 deck types catalogados (inclui PROP-FIDC, PROP-ECR, PROP-CAPT); 3 novos decks analisados (FIDC genérico, Thopen-Pontal, Prumo TGA)
- field-mapping.md: novo arquivo — bridge campo-a-campo ideation-engine JSON → page_id por deck type; cobre MPDMA, PROP-FIDC, PROP-ECR, PROP-CAPT, CIM; campos [MANUAL] marcados
- SESSION-PROTOCOL.md: novo arquivo na raiz do folder — define load Tier 1/2/3, catálogo completo de 50+ skills, regras de confirmação obrigatória; resolve o problema de memória entre sessões
- deal-idea-library.md: adicionado sub-arquétipo 5.3-FIDC always-on com trigger automático (recebíveis > R$100M, PMR > 45d, cadeia de fornecedores concentrada); Anexo A expandido
- Morning scan v0.9: atualizado via API (scheduled-tasks MCP) — sem ação manual; adiciona fidc_trigger, deck_type no schema, FIDC always-on check na Fase 2, badge FIDC cross-sell, deck type badge no card
- Seção 9: pendências itens 2 e 4 marcados como parcialmente concluídos

**Changelog v1.3 (23 jun 2026):**
- Seção 9: próximos passos atualizados; morning scan em produção e Signals Lake com ingestão diária movidos para "concluído"
- Capital IQ: confirmado conectado e sendo usado no Cowork skill v0.8.1 (Fase 1.5 + Fase 2). financial_flags nulos nos JSONs do lake são do Python script (sem acesso MCP) — comportamento esperado; enriquecimento CIQ vai para os cards HTML
- Pipeline Valor: chegando normalmente via Outlook (confirmado 23 jun)
- Estadão: newsletter cadastrada em 23 jun, aguardando primeiros envios
- PDF LRS: ainda corrompido (stream error ao processar); item continua bloqueado aguardando arquivo corrigido

**Changelog v1.2 (22 jun 2026):**
- Seção 7: atualizada para refletir adições de hoje (Família 8 LRS/PX, firme pockets GIS/WM, morning scan v0.7, weekly scan v0.3, HubSpot Fase 0, Capital IQ obrigatório, sizing DCM corrigido, Signals Lake com estrutura confirmada)
- Seção 8: statuses revisados linha a linha com base na realidade atual
- Seção 9: prioridades atualizadas; itens concluídos marcados e removidos do topo
- Seção 10: glossário expandido (LRS, PX, firme pocket, triplex)

---

## 1. Visão em uma frase

Um agente que opera como um banqueiro senior completo, cobrindo originação e execução de mandatos de M&A e capital markets. Esta versão cobre a **originação**: do sinal de mercado até o pitch book pronto, deixando ao banqueiro humano um único papel de gargalo, filtrar quais ideias perseguir, conduzir a reunião e fazer o pitch em pessoa.

## 2. Princípio de design

O agente nunca pensa do zero. A inteligência nasce da interseção de duas camadas:

- **Contexto:** o que o data lake de sinais e os sistemas (Capital IQ, RI, HubSpot, OneDrive, CVM/B3) sabem sobre a empresa, o setor e o relacionamento.
- **Repertório:** a Deal-Idea Library, um catálogo formalizado de arquétipos de transação (tipos de deal, com gatilho, tese, universo de contraparte, valuation, fee, validação, cross-sell).

O agente percorre a biblioteca, casa os gatilhos dos arquétipos com os sinais, valida com dados, filtra pelo foco GLPG, e produz ideias rankeadas. Quando o banqueiro aprova, ele aprofunda e gera o pitch.

## 3. O fluxo fim-a-fim (signal-to-pitch)

```
[1] SINAIS          [2] DATA LAKE        [3] MATCHING         [4] VALIDAÇÃO
mercado, CVM/B3,  -> concentrados,    -> Deal-Idea Library -> Capital IQ, RI,
news, inputs         atualizados          (gatilho ->          research, HubSpot,
manuais de           diariamente          arquétipo)           OneDrive confirmam
reunião                                                        a hipótese
                                                                    |
                                                                    v
[7] PITCH BOOK      [6] DEEP-DIVE        [5] FILTRO HUMANO
gerado one-click  <- banqueiro pede   <- banqueiro filtra:
(Pitch Generation    aprofundamento,      quais ideias
 Engine, ver §5):    checa HubSpot        perseguir
 templates OneDrive  para contato
 + pesquisa fresca
 + contexto da ideia
 -> PPTX + PDF p/
    revisão
```

O passo [7] não é uma exportação simples: é o Pitch Generation Engine (Seção 5), que
refaz a pesquisa de mercado e múltiplos no momento do clique e funde com os templates
da biblioteca de pitch books passados e o contexto da ideia.

### Exemplo canônico (o que Carlos sempre usa para explicar)

1. **Sinal:** uma empresa aparece como altamente alavancada (worsening balance sheet, capital structure pressionada).
2. **Confirmação:** o agente acessa RI da empresa, Capital IQ, research reports, biblioteca interna (OneDrive), HubSpot, para confirmar a alavancagem.
3. **Hipótese de arquétipo:** existe dívida fiscal relevante (PGFN/REFIS) que o veículo PX pode resolver? Há depósitos judiciais acima de R$50M que podem ser convertidos em LRS com arbitragem CDI/IPCA? Há unidade de negócio não-core candidata a carve-out?
4. **Diagnóstico triplex (Arquétipo 8.3):** o agente roda as três pernas em sequência, avalia quais combinações se aplicam, e apresenta o conjunto de oportunidades vinculadas.
5. **Mapa de ativos:** o agente mapeia os segmentos via RI, identifica unidades candidatas a carve-out.
6. **Universo de compradores:** encontra compradores potenciais (estratégicos, PE).
7. **Filtro humano:** se a ideia faz sentido, o banqueiro aprofunda.
8. **Relacionamento:** checa HubSpot por contato com o decisor. Se há mandato ativo no HubSpot em setor adjacente, o cruzamento é sinalizado automaticamente.
9. **Pitch:** one-click, gera o pitch book (double-click, desce um ou dois níveis, monta o material).

O papel humano restante: filtrar, conduzir a reunião, fazer o pitch.

## 4. Componentes da arquitetura

### 4.1 Signals Lake (a matéria-prima)
- Repositório concentrado, atualizado diariamente por uma task de coleta (a "mural task").
- Fontes de sinal: fatos relevantes e filings CVM/B3, notícias (Valor, Brazil Journal, Pipeline, Estadão), movimentos de mercado, ações de concorrentes, calendário de vencimentos de dívida, earnings, e **inputs manuais** (o banqueiro registra o que ouviu numa reunião, que vira sinal).
- Schema fixo por sinal (JSON), feed cronológico, com índices por empresa e por setor mantidos pela task.
- Vocabulário controlado para `signal_type` e `sector` (crítico para o matching ler de forma confiável).

### 4.2 Deal-Idea Library (o repertório)
- Catálogo de arquétipos de transação, organizado em 8 famílias: M&A sell-side, business combinations/buy-side, carve-outs, equity/listed, DCM/liability management, listed-company fee plays, situações especiais, e **produtos proprietários GLPG** (Família 8: LRS, PX, triplex).
- Cada arquétipo: gatilho (signal_type que o aciona), tese, why-now, universo de contraparte, faixa de valuation, fee logic, validação, cross-sell, tag de aderência ao foco.
- Embute o conhecimento de banco de investimento: estrutura típica de fee, lado de mercado, deal size, segmento de cliente.
- Matriz sinal-para-arquétipo (Anexo A da library) faz o casamento mecânico.
- **Base viva:** cada deal fechado ou perdido realimenta a biblioteca com lição e ajuste. Esta é a camada de **inteligência coletiva** dos banqueiros: o repertório de um vira o repertório de todos.

### 4.3 Foco GLPG (o filtro de mandato)
- Régua que mantém o agente dentro do mandato: tickets R$150M-R$500M (sweet spot), enterprises R$5M-R$2bn, viés DCM, forte presença em listed companies, fee floor R$5M com saídas estruturadas (roll-up, add-on, fee play).
- Toda ideia recebe tag CORE / ADJACENT / STRETCH.
- Inclui posicionamento DCM por tamanho de emissão (bookrunner único abaixo de R$300M; co-assessor/distribuidor acima), bolsos de firme GIS/WM, e lógica de cross-sell dos produtos proprietários.

### 4.4 Camada de validação (os sistemas)
Ordem de acesso: Lake (primário) -> OneDrive/SharePoint (arquivo institucional) -> Capital IQ (quantificação) -> HubSpot (relacionamento) -> CVM/B3 (regulatório) -> RI da empresa (estrutura operacional).

Capital IQ é obrigatório para toda empresa candidata antes de qualificação: validar ND/EBITDA, depósitos judiciais, dívida fiscal, dívida de curto prazo, rating. Sem essa etapa, a ideia não avança.

### 4.5 Camada de pitch (o output)
- Quando o banqueiro aprova uma ideia aprofundada e decide pitchar para a empresa, ele clica para gerar o pitch book. O agente monta os slides e exporta o PDF para revisão, na marca GLPG.
- A geração é um subsistema próprio, descrito em detalhe na Seção 5 (Pitch Generation Engine). Resumo: o agente puxa templates e páginas-tipo da biblioteca de pitch books passados (OneDrive nível Capital), refaz a pesquisa de mercado e múltiplos no momento da geração, e funde tudo com o contexto da ideia já gerada.
- Sequência de narrativa: contexto do cliente, depois solução GLPG, depois track record.

## 5. Pitch Generation Engine (o subsistema de pitch)

O ponto onde a ideia filtrada vira material client-ready. Acionado quando o banqueiro
decide pitchar e clica para gerar. O agente faz todo o trabalho de banqueiro junior +
analista: pega o contexto da ideia, refaz a pesquisa fresca, monta os slides na marca
GLPG, e entrega o PDF para revisão.

### 5.1 Princípio

O pitch nunca é montado do zero nem é genérico. Ele nasce de três insumos que se fundem:

1. **Contexto da ideia** (já gerado): empresa, arquétipo, tese, why-now, universo de
   contraparte, faixa de valuation preliminar, cross-sell, fee logic. Vem do
   ideation-engine sem retrabalho.
2. **Biblioteca de pitch books** (OneDrive, nível Capital): os decks que já fizemos no
   passado, dos quais o agente extrai os templates de marca e as páginas-tipo.
3. **Pesquisa fresca no momento da geração:** o agente refaz market sizing, múltiplos,
   comps e precedentes na hora, em vez de confiar em números velhos da fase de ideação.
   O que entrou no client-facing tem que estar atual e validado.

### 5.2 A Pitch-Page Library (biblioteca de páginas-tipo)

Análoga à Deal-Idea Library, mas para slides. Catálogo das páginas que tipicamente
entram num pitch GLPG, extraídas dos decks passados no OneDrive. Cada página-tipo tem:
papel narrativo, dados que precisa, fonte desses dados, e variações por arquétipo.

Páginas-tipo canônicas (lista inicial, expandível conforme a biblioteca real):

| Página-tipo | Papel narrativo | Insumos / fonte |
|---|---|---|
| **Capa / disclaimer** | Identidade, confidencialidade | Template de marca (OneDrive) |
| **Company profile** | Mostrar que entendemos a empresa | RI, Capital IQ, contexto da ideia |
| **Market understanding** | Mostrar domínio do setor | Pesquisa fresca, research, Capital IQ |
| **Opportunity at hand** | Enquadrar o problema/oportunidade que o sinal revelou | Tese da ideia (why-now, arquétipo) |
| **Transaction / deal structure** | A jogada proposta e como ela funciona | Arquétipo da library, opções com trade-offs |
| **Valuation & multiples** | Faixa de valor, comps, sensibilidades | Pesquisa fresca + Capital IQ (com flag de validação, pre/post-IFRS 16) |
| **Potential upside** | Por que o resultado pode superar a base | Sinergias, cenário de tensão competitiva |
| **GLPG solution & cross-sell** | Como a plataforma resolve (IBD + DCM/Structured/Asset/WM/GIS/Seguradora/PX) | Mapa de cross-sell do foco GLPG |
| **Track record** | Credibilidade por evidência | Biblioteca de deals GLPG (OneDrive) |
| **Next steps & scope** | O que acontece a seguir, escopo, fee | Process design, fee logic da ideia |
| **Team / contacts** | Quem conduz | Identidade do banqueiro (HubSpot) |

O agente seleciona o subconjunto de páginas conforme o arquétipo. Um pitch de carve-out
puxa company profile + mapa de segmentos + universo de compradores + valuation por unidade.
Um pitch de DCM/refi puxa stack de dívida + mapa de vencimentos + estrutura recomendada +
faixa de spread. Um pitch de LRS/PX puxa balanço + depósitos judiciais/dívida fiscal +
simulação de arbitragem + produto GLPG. A library guarda essa correspondência arquétipo-para-páginas.

### 5.3 O fluxo de geração (one-click)

```
[clique: gerar pitch]
        |
        v
[1] Carregar contexto da ideia (do ideation-engine, sem retrabalho)
        |
        v
[2] Selecionar páginas-tipo conforme o arquétipo (Pitch-Page Library)
        |
        v
[3] Pesquisa fresca: market sizing, múltiplos, comps, precedentes
    (Capital IQ + web + research + OneDrive), com flag de validação
        |
        v
[4] Puxar template de marca + páginas de track record da biblioteca (OneDrive)
        |
        v
[5] Montar os slides: fundir contexto + pesquisa + template
    (sequência: cliente -> solução GLPG -> track record)
        |
        v
[6] Exportar PPTX + PDF para revisão do banqueiro
        |
        v
[banqueiro revisa, ajusta, leva para a reunião]
```

### 5.4 Qualidade e disciplina (o que o gerador sempre respeita)

- **Pesquisa no momento da geração, não na ideação.** Números client-facing são
  refeitos e datados. O que veio da fase de ideia é hipótese; o pitch confirma.
- **Flag de validação Capital IQ** em todo múltiplo e comp antes do uso client-facing.
  Distinguir pre vs. post-IFRS 16 onde a base de leasing for relevante (OOH, varejo, etc).
- **Marca GLPG:** Deep Blue (#183C80), Bright Blue (#0071BB), Spacial Grey (#231F20),
  Gadugi para títulos, Inter para textos. O template vem da biblioteca real, não inventado.
- **Sem dado ou nome inventado.** Sem fonte, "a confirmar".
- **Sequência de narrativa fixa:** contexto do cliente primeiro, solução GLPG depois,
  track record por último. Sem anexos no primeiro contato externo.
- **Output é draft para revisão.** O banqueiro revisa antes de levar à reunião. O agente
  não pula essa etapa.

### 5.5 Encadeamento

O gerador é a ponte entre ideation-engine e galapagos-deck-architect. O ideation-engine
entrega a tese; o Pitch Generation Engine seleciona páginas e refaz a pesquisa; o
galapagos-deck-architect aplica a marca e produz o PPTX/PDF. O handoff de dados
(que campo da tese vai para que slide) é formalizado para que o clique seja de fato um clique.

## 6. Os três modos de operação (já implementados na skill atual)

- **REALTIME:** 1-2 ideias rápidas, mobile-first, "smartest guy in the room". Latência sobre exaustividade. Preliminar por definição.
- **APROFUNDAMENTO:** tese completa de uma ideia selecionada, com pipeline de dados específico por família.
- **DEEP:** lista rankeada de 3-5 ideias, top-3 com aprofundamento automático.

## 7. O que JÁ existe (estado atual em 22 jun 2026)

### 7.1 Skills e orchestration
- **ibd-os (v3.0):** master orchestrator, roteia para todos os especialistas, enforces tom e qualidade tier-one.
- **ideation-engine:** motor de originação com três modos (REALTIME, DEEP, aprofundamento), contrato de dados com Signals Lake, encadeamento para opportunity-assessor e galapagos-deck-architect.
- **opportunity-assessor:** 7-filter assessment (strategic fit, fee, certeza, relacionamento, cross-sell, competição, execução).
- **outreach-composer:** mensagens calibradas por canal (WhatsApp, InMail, email) com persona-awareness e check HubSpot obrigatório.
- **meeting-debrief:** análise pós-reunião com framework "Reading Behind the Lines".
- **galapagos-deck-architect:** geração de decks na marca GLPG, overlay sobre pitch-builder.
- **negotiation-advisor, voice-guard-ibd, prompt-master:** skills de apoio operacional.

### 7.2 Bases de conhecimento
- **deal-idea-library.md: 8 famílias, ~48 arquétipos.** Expandido hoje com Família 8 (produtos proprietários GLPG):
  - **8.1 LRS (Letras de Risco de Seguro):** substituição de depósitos judiciais por seguro garantia lastreado em LRS; arbitragem CDI vs. IPCA; gatilho: depósitos judiciais >R$50M; fee R$500K-R$2M.
  - **8.2 PX (veículo de precatórios):** precatórios comprados com deságio (~65-75 centavos) utilizados para quitação de dívida fiscal com a União pelo valor de face; efetivo desconto de 25-35%; gatilho: dívida fiscal/REFIS >R$30M; fee TBD (apresentação pendente).
  - **8.3 Triplex:** diagnóstico combinado LRS + PX + carve-out para empresa alavancada com múltiplas pressões de balanço; cada perna gera fee independente; soma pode superar o floor de R$5M.
  - Anexo A atualizado com 3 novos tipos de sinal.
  - Anexo B atualizado com guidance Capital IQ para Família 8.
  - Anexo C atualizado com filtro #8 (cruzamento com mandatos HubSpot).
- **glpg-focus.md:** expandido com:
  - Tabela de posicionamento DCM por tamanho de emissão (R$50M-R$300M bookrunner, R$300M-R$800M co-assessor, R$800M+ distribuidor).
  - Firme pockets: GIS (high grade A+, até 25% da emissão firme) e WM (high yield).
  - Playbook padrão DCM com firme (4 passos: origina, GIS compromete, vai a mercado com âncora, distribui o restante).
  - Seções 7.1-7.3 (LRS, PX, diagnóstico triplex).
  - Seção 8 (HubSpot mandatos como fonte de sinal cruzado).
  - Checklist expandido para 9 itens.

### 7.3 Scans operacionais
- **Morning scan SKILL v0.7** (diário, seg-sex, 7h BRT):
  - Fase 0 (nova): pull HubSpot mandatos ativos antes de qualquer coleta.
  - Fase 2 (nova): diagnóstico financeiro Capital IQ obrigatório para toda empresa candidata (ND/EBITDA, depósitos judiciais, dívida fiscal, dívida de curto prazo, rating).
  - Fase 3 (nova): cruzamento com mandatos HubSpot ativos, output em bloco dedicado.
  - Sizing DCM corrigido: nunca propor GLPG como bookrunner em emissão >R$500M.
  - Campos `firme`, `lrs_trigger`, `px_trigger` adicionados à estrutura de dados.
  - Paleta de cross-sell expandida: GIS (#1A6B3C), Seguradora/LRS (#7B3F00), PX (#5C4300).
- **Weekly scan SKILL v0.3** (sábados, 7h BRT): mesmas evoluções do morning scan. Seção de cruzamento com mandatos HubSpot no MD semanal. Checklist expandido de 9 para 14 itens.

### 7.4 Signals Lake
- **Schema documentado:** SCHEMA.md v1.0, com campos obrigatórios, vocabulário de `signal_type` e `sector` especificado, convenção de nomenclatura de arquivos.
- **Estrutura de pastas ativa:** `feed/`, `index/` (companies.json, by-sector.json, latest.json), `snapshot.json` (snapshot pré-computado para modo REALTIME), README.md.
- Sinais sendo gravados diariamente (ex: `feed/2026-06/2026-06-22-*.json`).

### 7.5 Conectores
- **Capital IQ MCP:** disponível para validação financeira. **Nota de estabilidade:** o servidor desconectou durante a sessão de 22 jun 2026. Fallback para web search quando indisponível, com registro no log. Dependência crítica para o diagnóstico obrigatório da Fase 2.
- **HubSpot MCP:** disponível para leitura de mandatos via `query_crm_data` e `get_crm_objects`.
- **OneDrive/SharePoint MCP:** disponível para busca de precedentes.
- **Outlook MCP:** disponível para busca de emails (Pipeline Valor, newsletters). `Mail.Send` indisponível no conector atual (email saída não funciona).
- **Granola MCP:** disponível para transcripts de reuniões.

### 7.6 Biblioteca de pitch books
- Armazenada no OneDrive nível Capital. Fonte dos templates de marca e páginas-tipo. Existe como acervo, mas ainda não catalogada como Pitch-Page Library estruturada.

---

## 8. Peças faltantes (gap map atualizado em 22 jun 2026)

### 8.1 Signals Lake: produção e governança

| Item | Status v1.1 | Status atual | Observação |
|---|---|---|---|
| Schema canônico (JSON, vocabulário controlado) | parcial | **estruturado** | SCHEMA.md v1.0 publicado; vocabulário de signal_type e sector especificado. Fixar vocabulário fechado para garantir matching confiável. |
| Pipeline de ingestão diária | em construção | **em produção parcial** | Morning scan roda diariamente via scheduled task e grava sinais em feed/. Fontes: Outlook (Pipeline Valor), web search (CADE, CVM, B3, M&A Brasil). Faltam: Valor Econômico direto (paywall), Reuters, Infomoney. |
| Canal de input manual (banqueiro pós-reunião) | a definir | **a definir** | Granola existe. A ponte Granola-debrief -> sinal sintético no lake não está formalizada. |
| Índices (companies.json, by-sector.json, latest.json) | especificado, a validar | **implementado em estrutura** | Arquivos existem no index/. Atualização automática pela task: a validar em produção contínua. |
| Política de retenção e deduplicação | faltando | **faltando** | Sem dedup, sinais redundantes sobre a mesma empresa acumulam. |
| Resiliência do Capital IQ MCP | (não mapeado) | **gap novo** | Servidor desconectou mid-session em 22 jun. Fallback para web search implementado no SKILL, mas validação financeira completa depende do Capital IQ. Precisa de mecanismo de health check. |
| Valor Econômico direto | (não mapeado) | **gap novo** | URL bloqueada por política Cowork. Workaround: newsletter diária via Outlook. Requer encaminhamento manual do email. |

### 8.2 Matching engine: robustez

| Item | Status v1.1 | Status atual | Observação |
|---|---|---|---|
| Resolução de entidade (sinal news = empresa CVM?) | faltando | **faltando** | Sinais de fontes diferentes sobre a mesma empresa não se agregam automaticamente. Causa: sem CNPJ/ticker como chave comum entre fontes. |
| Score de confiança do sinal | faltando | **faltando** | Fonte primária (CVM filing) vale mais que rumor de notícia. Sem score, o ranking de ideias não reflete confiabilidade da matéria-prima. |

### 8.3 Validação: profundidade e automação

| Item | Status v1.1 | Status atual | Observação |
|---|---|---|---|
| Rotinas de validação encadeadas por arquétipo | parcial | **melhorado** | Fase 2 do morning scan v0.7 define diagnóstico Capital IQ obrigatório com tabela de gatilhos (ND/EBITDA, depósitos judiciais, dívida fiscal, rating). Roda para toda empresa candidata. |
| Flag pre/post-IFRS 16 automatizado | parcial | **parcial** | Mencionado no SKILL como requisito para comps client-facing. Não há automação; depende do agente aplicar a regra. |
| LRS PDF de produto (descritivo da seguradora) | (não mapeado) | **gap novo** | PDF "Seguro Garantia Judicial IB.pdf" não foi processado (xref table error). Arquétipo 8.1 foi construído a partir da descrição verbal de Carlos. Requere importação formal quando o PDF for corrigido. |
| PX: detalhes operacionais e fee | (não mapeado) | **gap novo** | Apresentação PX pendente (Carlos enviará). Seção 7.2 do glpg-focus.md marcada como "fee TBD, detalhes pendentes". |

### 8.4 Inteligência coletiva: o loop de realimentação

| Item | Status v1.1 | Status atual | Observação |
|---|---|---|---|
| Mecanismo de captura de lições (deal fechado/perdido -> library) | faltando | **faltando** | Anexo D existe como seção vazia. Sem processo definido para atualização estruturada. |
| Telemetria de uso (arquétipo -> mandato?) | faltando | **faltando** | Impossível refinar a biblioteca por evidência sem rastrear quais ideias viram mandato. |

### 8.5 Relacionamento: fechamento do loop HubSpot

| Item | Status v1.1 | Status atual | Observação |
|---|---|---|---|
| Leitura de mandatos ativos | faltando | **implementado** | Fase 0 de ambos os scans (morning v0.7 e weekly v0.3) extrai mandatos ativos via `query_crm_data` antes de coletar sinais. Cruzamento com ideias do dia incluído no output. |
| Escrita de volta no HubSpot (ideia -> oportunidade rastreável) | faltando | **faltando** | Ideias geradas não criam deal/opportunity no HubSpot automaticamente. Sem rastreabilidade pipeline. |
| Detecção de duplicação entre banqueiros | faltando | **faltando** | Dois banqueiros podem estar cobrindo a mesma empresa sem saber. Relevante especialmente para FIDC/structured (Otávio). |

### 8.6 Pitch Generation Engine

| Item | Status v1.1 | Status atual | Observação |
|---|---|---|---|
| Pitch-Page Library catalogada | faltando | **faltando** | Pré-requisito do one-click. Os decks passados existem no OneDrive, mas páginas-tipo não estão extraídas e formalizadas como repertório reutilizável. |
| Correspondência arquétipo-para-páginas | faltando | **faltando** | A regra de qual subconjunto de páginas cada arquétipo aciona (carve-out vs. DCM/refi vs. LRS vs. PX) não existe. |
| Handoff de dados ideia-para-slide | parcial | **parcial** | O galapagos-deck-architect recebe a tese do ideation-engine, mas o mapeamento campo-a-campo (campo 'te' vai para qual slide?) não está formalizado. |
| Pesquisa fresca disparada na geração | parcial | **parcial** | O SKILL menciona o requisito, mas a rotina que refaz market sizing e múltiplos no momento do clique não está implementada como procedimento automático. |
| Pipeline PPTX + PDF integrado ao one-click | parcial | **parcial** | galapagos-deck-architect produz PPTX. PDF via browser print (Ctrl+P). Export PDF integrado ao clique e QA visual por página: faltando. |

### 8.7 Multi-banker / escala

| Item | Status v1.1 | Status atual | Observação |
|---|---|---|---|
| Camada de identidade do banqueiro (cobertura, relacionamento) | faltando | **faltando** | A skill hoje fala na voz do Carlos. Para o time completo, precisa saber quem é o banqueiro, qual setor cobre, quais contatos tem no HubSpot. |
| Permissionamento (quem vê quais sinais/ideias) | faltando | **faltando** | Sem permissionamento, um banqueiro vê ideias de outro, gerando ruído e potencial conflito de abordagem. |

### 8.8 Execução (fora de escopo desta versão, registrado)
- O agente full-senior-banker também cobriria execução pós-mandato. Esta spec cobre só originação. A camada de execução (diligence, data room, negociação, fechamento) fica para a v2. **Status: fora de escopo, registrado.**

---

## 9. Prioridade das peças faltantes (atualizada)

### Concluído (acumulado até 24 jun 2026)
- [x] Família 8 (LRS, PX, triplex) na deal-idea-library
- [x] Firme pockets GIS/WM na glpg-focus + scans
- [x] Sizing DCM corrigido
- [x] HubSpot Fase 0 em morning scan e weekly scan
- [x] Capital IQ obrigatório (Fase 2 com tabela de gatilhos)
- [x] Signals Lake: schema documentado, estrutura feed/index/snapshot confirmada
- [x] Morning scan v0.9 em produção (FIDC always-on, deck_type, fidc_trigger — rodando seg-sex 7h04 BRT)
- [x] Signals Lake com ingestão diária ativa (feed/2026-06/ com sinais de 22 e 23 jun gravados)
- [x] **Pitch-Page Library v0.3** — 14 deck types, 3 novos decks analisados (PROP-FIDC, PROP-ECR, PROP-CAPT)
- [x] **field-mapping.md v0.1** — bridge ideation-engine JSON → galapagos-deck-architect por page_id
- [x] **SESSION-PROTOCOL.md** — memória persistente entre sessões; catálogo de 50+ skills
- [x] **FIDC always-on** — sub-arquétipo 5.3-FIDC na deal-idea-library + check no morning scan

### Bloqueados (aguardando input externo)

- **PDF LRS corrompido** (8.3): stream error ao processar `Seguro Garantia Judicial IB.pdf`.
  Arquétipo 8.1 construído a partir de descrição verbal. Ação: Carlos providenciar versão
  corrigida do PDF; ao receber, importar e validar arquétipo contra documento oficial.

- **PX: fee e operacionalidade** (8.3 / 8.2): apresentação do veículo PX pendente.
  Seção 7.2 do glpg-focus.md marcada como "fee TBD". Ação: Carlos enviar apresentação;
  ao receber, atualizar arquétipo 8.2 e glpg-focus.md.

### Pendências de alto impacto (ordenadas por prioridade)

1. **Estadão newsletter** (8.1) — aguardando primeiros emails após cadastro de 23 jun.
   Quando chegar: verificar se o skill captura corretamente via Outlook MCP. Sem ação
   adicional necessária por ora — skill já configurado para ler `@estadao.com.br`.

2. **Catalogar a Pitch-Page Library + correspondência arquétipo-para-páginas** (8.6).
   Pré-requisito do one-click de pitch. Ação: carregar decks do OneDrive (nível Capital),
   extrair páginas-tipo, montar catálogo como arquivo de referência estruturado.

3. **Resolução de entidade + score de confiança** (8.2).
   Sinais de fontes diferentes sobre a mesma empresa não se agregam (sem CNPJ/ticker como
   chave comum). Score de confiança ausente impede ranking de qualidade. Ação: adicionar
   campo `cnpj` ou `ticker` ao schema; implementar score por fonte (CVM filing > news > rumor).

4. **Pesquisa fresca + handoff de dados ideia-para-slide** (8.6).
   Rotina que refaz market sizing e múltiplos no momento da geração não está automatizada.
   Mapeamento campo-a-campo (tese → slide) não formalizado. Completa o one-click fim-a-fim.

5. **Loop de realimentação estruturado** (8.4).
   Diferencial de inteligência coletiva: deal fecha/morre → banqueiro registra via Granola
   → sinal sintético no lake → Anexo D atualizado. Processo a definir e formalizar.

6. **Escrita de volta no HubSpot + dedup entre banqueiros** (8.5).
   Ideias geradas não criam deal/opportunity no HubSpot. Dois banqueiros podem cobrir a
   mesma empresa sem saber. Ação: definir trigger de escrita e dedup logic.

7. **Rotinas de validação encadeadas por arquétipo** (8.3).
   Capital IQ já é obrigatório, mas a sequência de chamadas ainda é manual. Ação:
   automatizar a sequência de consultas por família de arquétipo no morning scan.

8. **Valor Econômico via Outlook** (8.1).
   URL bloqueada por política Cowork. Workaround: newsletter diária via Outlook MCP.
   Ação: Carlos garantir que a newsletter do Valor chega na inbox corporativa e está
   sendo capturada pelo Outlook MCP no scan.

9. **Política de retenção e deduplicação de sinais no lake** (8.1).
   Sinais redundantes sobre a mesma empresa acumulam sem dedup. Ação: definir janela de
   retenção e lógica de dedup por (company, signal_type, date).

10. **Camada multi-banker** (8.7).
    Identidade do banqueiro (setor de cobertura, contatos HubSpot) e permissionamento por
    banqueiro. Habilita o produto de time. Fora de escopo imediato; registrado para v2.

---

## 10. Glossário rápido

- **Signals Lake:** repositório de sinais vivos, atualizado diariamente.
- **Deal-Idea Library:** catálogo de arquétipos de transação, 8 famílias, ~48 arquétipos.
- **Arquétipo:** um tipo de jogada de IB (ex: carve-out de unidade não-core), com gatilho, tese, fee, validação.
- **Família 8:** produtos proprietários GLPG: LRS (Letras de Risco de Seguro via seguradora GLPG), PX (veículo de precatórios), Triplex (combinação LRS + PX + carve-out).
- **LRS (Letras de Risco de Seguro):** instrumento da seguradora GLPG. Substitui depósitos judiciais (IPCA) por seguro garantia judicial (CDI). Arbitragem CDI-IPCA para o cliente.
- **PX:** veículo GLPG que compra precatórios com deságio. Empresa usa precatórios para quitar dívida fiscal com a União pelo valor de face, obtendo desconto efetivo de 25-35%.
- **Triplex (Arquétipo 8.3):** diagnóstico combinado para empresa alavancada: LRS + PX + carve-out. Cada perna gera fee independente.
- **Firme pocket:** capacidade de alocação firme em emissões DCM. GIS: high grade A+, até 25% da emissão. WM: high yield. Diferencial competitivo vs. boutiques sem balanço.
- **Mural task:** a rotina de scraping que alimenta o lake.
- **Fee play:** captura de fee de nicho (laudo, fairness) em transação onde GLPG não lidera.
- **CORE / ADJACENT / STRETCH:** tags de aderência ao foco GLPG.
- **Pitch Generation Engine:** subsistema que vira a ideia filtrada em pitch book (Seção 5).
- **Pitch-Page Library:** catálogo de páginas-tipo de slide, a extrair dos decks passados no OneDrive. Status: faltando.
- **Signal-to-pitch:** o fluxo fim-a-fim que esta spec descreve.
- **Diagnóstico triplex:** sequência Capital IQ que verifica dívida fiscal (PX), depósitos judiciais (LRS), unidades periféricas (carve-out) e dívida de mercado (DCM refi) em um único fluxo.
