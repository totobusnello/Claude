# Logística de Plantas Vivas e Tese Fiscal do Marketplace Viridi

> Pesquisa 2026-07-17 · **[VERIFICADO]** = fonte citada · **[INTERPRETAÇÃO]** = análise do pesquisador, validar com especialista. **Não é parecer jurídico.**

---

## PILAR A — LOGÍSTICA DE PLANTAS VIVAS NO BRASIL

### 1. Modalidades de transporte e players

- Não existe um mercado amplo e pulverizado de "transportadoras de plantas" — o setor é **concentrado em poucos players especializados de longa data**: Transtim (30+ anos, frota própria, flores e plantas) e Hamil Transportes (especializada em flores e plantas) são os nomes que aparecem consistentemente [VERIFICADO — presença web/institucional, sem dados de preço público]. [Transtim](https://transtim.com.br/) · [Hamil Transportes](https://hamiltransportes.com.br/servicos/flores-plantas/)
- **Para árvores grandes (Munck), a logística tende a ser verticalizada pelo próprio viveiro**, não terceirizada a uma transportadora genérica: Atacadão das Árvores, Shop das Plantas e Viveiro das Árvores operam frota própria (carretas + caminhão Munck + tratores) e entregam mudas/árvores adultas (2 a 12 metros) para todo o país [VERIFICADO, fontes institucionais dos próprios viveiros]. [Atacadão das Árvores](http://www.atacadaodasarvores.luanreflorestamento.com.br/arvores-e-palmeiras-adultas/) · [Shop das Plantas](http://www.shopdasplantas.com.br/) · [Viveiro das Árvores](https://viveirodasarvores.com/)
- **Achado operacional relevante para Viridi**: para SKUs de grande porte, o modelo de "viveiro entrega direto" (frota do próprio fornecedor) é mais viável do que a Viridi montar frota própria com Munck — a plataforma pode **orquestrar/agregar entregas de fornecedores já equipados**, em vez de internalizar ativos pesados.
- Não há **tabela pública de custo por km ou por viagem** para esse nicho. Único dado quantitativo obtido: cargas "vivas/perecíveis/especiais" podem ter **sobretaxa de até 35% sobre o valor-base do frete** [VERIFICADO via cotefrete.com.br]. [Frete para Plantas — Cotefrete](https://cotefrete.com.br/transportadoras-cargas-especiais/plantas) · [ANTT — Calculadora de Piso Mínimo de Frete](https://calculadorafrete.antt.gov.br/)

### 2. Restrições regulatórias e fitossanitárias

- Transporte interestadual (e às vezes intermunicipal, dependendo da praga regulamentada) de mudas exige **PTV — Permissão de Trânsito Vegetal**, instituída pela **Instrução Normativa MAPA nº 28/2016** [VERIFICADO]. A PTV é emitida **por carregamento** (uma PTV por viagem, não por contrato/período) → operação de escala em marketplace gera **muitas emissões administrativas recorrentes**. [MAPA — Controle de Trânsito de Vegetais](https://www.gov.br/agricultura/pt-br/assuntos/sanidade-animal-e-vegetal/sanidade-vegetal/controle-de-transito-de-vegetais)
- Emissão e fiscalização **descentralizadas por estado** (CDA-SP, IDARON-RO, IMA-MG, ADAPAR-PR, CIDASC-SC), cada um com portal e regras próprias — fricção real para marketplace multi-UF. [CDA-SP — Emissão de PTV](https://www.defesa.agricultura.sp.gov.br/www/servicos/?%2Fcertificacao-fitossanitaria-emissao-de-ptv%2F=&cod=43)
- A PTV serve de base para o **CFO (Certificado Fitossanitário de Origem)** emitido por viveiros/produtores credenciados (via curso/habilitação CFO/CFOC) — **o viveiro precisa estar credenciado**, não é automático [VERIFICADO, IN 28/2016].
- **Mortalidade/perecibilidade**: sem estatística nacional consolidada de mortalidade em transporte comercial de mudas [LIMITAÇÃO DE DADOS — validar operacionalmente com viveiros parceiros]. Fatores críticos consistentes entre fontes: manuseio no viveiro + tempo/condições de transporte + manuseio no destino. [Moby — Perecibilidade no Transporte Agrícola](https://mobyweb.com.br/perecibilidade-no-transporte-agricola/)

### 3. Transportadoras especializadas e marketplaces de frete

- Existem transportadoras especializadas (Transtim, Hamil), mas é um **mercado de nicho pequeno e concentrado**, não um ecossistema líquido.
- Marketplaces de frete genéricos (FreteBras, Central do Frete) **aceitam** carga viva/perecível/plantas como categoria especial, com sobretaxa — infraestrutura utilizável, mas com prêmio de preço e sem SLA especializado. [FreteBras](https://www.fretebras.com.br/) · [Central do Frete](https://centraldofrete.com/)

---

## PILAR B — A TESE FISCAL ("dupla tributação")

### 1. Tributação hoje: ICMS, PIS/COFINS, Simples Nacional

- **ICMS sobre mudas em SP**: havia isenção interna para saída de "mudas de plantas" (plantas jovens destinadas ao plantio, NÃO plantas adultas) — **art. 50 do Anexo I do RICMS/SP**, amparo nos **Convênios ICMS 54/91 e 100/97**. **A isenção expirou em 31/12/2024 e não foi renovada** — a partir de 2025 não há base legal para aplicá-la em SP [VERIFICADO, RC 30816/2024 e RC 28255/2023, Sefaz-SP]. Qual regime substitui (tributação normal vs. redução de base como "insumo agropecuário" sob Convênio 100/97) **precisa de validação de tributarista**. [RC 30816/2024](https://legislacao.fazenda.sp.gov.br/Paginas/RC30816_2024.aspx) · [RC 28255/2023](https://legislacao.fazenda.sp.gov.br/Paginas/RC28255_2023.aspx) · [RICMS/SP Art. 50](https://legislacao.fazenda.sp.gov.br/Paginas/an1art050.aspx)
- **PIS/COFINS**: sementes e mudas destinadas a plantio têm **alíquota zero desde a Lei 10.925/2004** (condicionado a registro Renasem/RNC) — benefício que **NÃO se estende a optantes do Simples Nacional**. A **LC 224/2025 reduz esse benefício a partir de 01/04/2026** [VERIFICADO]. [Contadorperito](https://www.contadorperito.com/materia/50402/pis-pasep-e-cofins-aliquota-zero-sementes-e-mudas-industrializacao-por-encomenda) · [LC 224/25](https://camaraportuguesa-rj.com.br/lc-224-25-fim-da-aliquota-zero-de-pis-cofins-na-aquisicao-de-produtos-agropecuarios-e-restricoes-a-utilizacao-dos-respectivos-creditos/)
- **Simples Nacional — dois regimes distintos na mesma cadeia** [VERIFICADO]:
  - **Revenda/comércio de plantas** (CNAE 4789-0/02) → **Anexo I** da LC 123/06, alíquotas nominais 4%–19% (efetivas menores por faixa), **sem benefício federal específico** para plantas ornamentais.
  - **Serviço de paisagismo** (CNAE 8130-3/00) → **Anexo IV**, alíquotas nominais a partir de 4,5% (CPP à parte, fora do DAS). ISS no local da execução (código 7.11 — "Jardinagem, inclusive corte e poda de árvores").
  - Empresa que vende planta E presta serviço precisa **segregar receitas** entre os dois anexos — doutrina estabelecida. [Blog eSimples](https://blog.esimplesauditoria.com.br/plantas-ornamentais/) · [Rotina Fiscal — Paisagismo](https://www.rotinafiscal.com.br/tributos-e-declaracoes/atividades-economicas/paisagismo) · [CNAE 8130-3/00](https://www.contabeis.com.br/ferramentas/simples-nacional/8130300) · [CNAE 4789-0/02](https://www.contabeis.com.br/ferramentas/simples-nacional/4789002/)

### 2. A "dupla tributação" é real? Em que regime, e quanto vale?

**[INTERPRETAÇÃO — validar com tributarista]**

O termo "dupla tributação" tecnicamente é impreciso (não é bitributação jurídica clássica), mas o **fenômeno econômico é real e tem nome técnico: efeito cascata do regime cumulativo do Simples Nacional**. O Simples tributa **faturamento bruto**, não valor agregado. Quando o paisagista compra a planta do viveiro (que já embutiu seu custo tributário no preço) e revende ao cliente final pelo valor cheio, ele paga Simples (Anexo I) **sobre o valor total da revenda, não sobre o markup** — tributação em cascata sobre a mesma mercadoria em dois elos sucessivos, sem crédito compensável entre optantes do Simples.

**Quantificação ilustrativa — pedido de R$ 30.000** (ordem de grandeza; mix ~70% plantas R$ 21.000 + ~30% serviço R$ 9.000):

| | Modelo A — hoje (paisagista revende) | Modelo B — marketplace (cliente paga viveiro direto) |
|---|---|---|
| Plantas (R$ 21.000) | Paisagista fatura como revenda → Simples Anexo I, efetiva ilustrativa ~8,4% → **≈ R$ 1.774** | Viveiro fatura direto ao cliente (evento tributário único e inevitável) |
| Serviço/projeto (R$ 9.000) | Anexo IV, efetiva ilustrativa ~6% → **≈ R$ 540** | Igual: **≈ R$ 540** |
| Comissão da plataforma (~8% do GMV de plantas ≈ R$ 1.680) | — | Nota de intermediação (CNAE 7490-1/04), ~8–9% sobre a comissão → **≈ R$ 140–150** |
| **Total do "segundo elo" de imposto** | **≈ R$ 2.314 (~7,7% do pedido)** | **≈ R$ 690 (~2,3% do pedido)** |
| **Economia estimada** | | **≈ R$ 1.600–1.800 (5–6 p.p. do GMV do pedido)** |

Sensível à faixa de RBT12 real de cada parceiro (efetiva do Simples varia ~4%–19%) e ao mix materiais/serviço. **Validar com tributarista com dados reais.** [Tabela Simples Nacional 2026 — Contabilizei](https://www.contabilizei.com.br/contabilidade-online/tabela-simples-nacional-completa/)

**Ressalva crítica de veredito**: a economia é real, mas **não é exclusiva de um marketplace** — qualquer paisagista já pode hoje estruturar orçamento em que o cliente compra materiais direto do fornecedor e ele fatura só mão de obra/projeto (prática comum na construção civil). O marketplace **não desbloqueia estrutura fiscal inédita**; ele **viabiliza operacionalmente, em escala e com confiança/custódia**, algo legalmente possível de forma artesanal. O valor da Viridi é **execução** (catálogo agregado, split payment, garantia de entrega, gestão de disputas), não "brecha fiscal proprietária".

### 3. Estruturação legal — split payment, notas, precedentes

- **Split de pagamento** (Bacen — Circular 3.682/2013, Resolução BCB 150/2021): divisão de recebíveis entre múltiplos beneficiários na liquidação financeira — usado por iFood, Mercado Livre e marketplaces em geral [VERIFICADO — não confundir com o "split payment" da reforma tributária]. [Enotas](https://enotas.com.br/blog/o-que-e-split-de-pagamento/) · [Stone](https://conteudo.stone.com.br/split-de-pagamento-tudo-o-que-voce-precisa-saber/)
- **Quem emite o quê** (estrutura padrão de marketplace, replicável para a Viridi) [VERIFICADO/padrão de mercado]:
  - **Viveiro** emite nota fiscal de **produto** (venda das plantas) diretamente ao cliente final.
  - **Plataforma (Viridi)** emite nota de **serviço de intermediação/comissão** (CNAE sugerido: 74.90-1-04) sobre o take rate.
  - **Paisagista** emite nota de **serviço de projeto/execução** (paisagismo, Anexo IV/ISS).
  - Desenho de "3 notas, 3 papéis" — padrão usado por marketplaces B2B agro (ex.: [Agro2Business](https://agro2business.com/), comissão 1%–6,9%) e consistente com iFood/Mercado Livre.

### 4. Reforma tributária (CBS/IBS) — muda a tese?

- O **split payment da reforma tributária** (Decreto 12.955/2026, sob a LC 214/2025) é diferente do split Bacen: IBS/CBS **retido automaticamente na liquidação financeira**, antes de o valor chegar ao vendedor [VERIFICADO].
- **Cronograma**: estreia em **2027, opcional, restrita a B2B** (6 arranjos: boleto, Pix Dinâmico/Automático/Estático, TED, TEF). Avança por setor até o **regime pleno em 2033** (extinção de ICMS e ISS). [Finsiders](https://finsidersbrasil.com.br/regulamentacao/split-payment-2027-regulamento-cbs-ibs-reforma-tributaria/) · [Machado Meyer](https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/tributario-ij/split-payment-o-que-as-empresas-devem-fazer-agora-para-se-preparar-para-o-novo-modelo-de-arrecadacao-do-ibs-e-da-cbs) · [Mattos Filho](https://www.mattosfilho.com.br/unico/regulamentos-ibs-cbs/)
- **Implicação prática**: "sem nota, não há liquidação" — se o viveiro estiver irregular, **a plataforma responde solidariamente e precisa reter o imposto**. Eleva a régua de compliance do onboarding, mas **valida e formaliza o desenho de "3 notas"** como o modelo compliant daqui pra frente.
- **O split payment NÃO resolve a cascata do Simples por si só** — é mecanismo de arrecadação/retenção, não de desenho de incidência. A cascata só desaparece com a **não-cumulatividade plena do IBS/CBS em 2033** (a LC 214/2025 prevê opção híbrida para Simples gerar crédito ao comprador não-Simples — aplicação prática **precisa de validação tributária**).
- Mudas/plantas ornamentais **não** aparecem nas listas de alíquota zero (cesta básica) nem no Anexo XV (hortifrúti para consumo humano). Existe **redução de 60% de IBS/CBS para produtos agropecuários/florestais "in natura"** — **pode** se aplicar a mudas de viveiro não beneficiadas [INTERPRETAÇÃO — analisar NCM específico com tributarista]. [IOB — Cesta Básica](https://noticias.iob.com.br/reforma-tributaria-isencao-cesta-basica/) · [jscontadores — Hortifrúti](https://jscontadores.com.br/reforma-tributaria-garante-aliquota-zero-para-hortifruti-e-amplia-possibilidade-de-creditos-fiscais/)

---

## Veredito executivo

1. **Tese fiscal: PROCEDE PARCIALMENTE.** Cascata do Simples é real; economia ilustrativa de **~5–6 p.p. do GMV** (≈ R$ 1.600–1.800 num pedido de R$ 30 mil). Mas não é exclusiva do marketplace — o valor da Viridi é viabilizar em escala com confiança e custódia. Base tributária das plantas está ficando **mais cara** (fim da isenção ICMS-SP mudas 2024; redução do PIS/COFINS zero em 2026) — o que **aumenta** o valor de eliminar o elo de revenda.
2. **Logística:** árvores grandes → orquestrar frotas dos próprios viveiros (não montar frota); PTV por carregamento no interestadual (fricção que a plataforma pode automatizar = feature de compliance); transporte especializado é nicho concentrado (Transtim, Hamil) + frete genérico com sobretaxa de até 35%.
3. **Reforma tributária:** valida o modelo de 3 notas, torna a plataforma corresponsável por compliance do vendedor (régua de onboarding sobe — barreira de entrada que favorece quem estruturar primeiro), e só elimina a cascata de fato em 2033.

---

*Pesquisa via agent researcher, 2026-07-17. Não é parecer jurídico — pontos marcados exigem validação de tributarista.*
