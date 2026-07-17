# Viridi — Modelo de Negócio & Unit Economics

> Como a Viridi ganha dinheiro, quem paga o quê, e por que cada lado fica melhor dentro da plataforma do que fora.
> Base: pesquisa (docs/01) + desenho de produto (docs/02). Números ilustrativos marcados; validação de tributarista pendente nos itens fiscais.

---

## 1. A resolução da tensão central (comissão × "sem dupla tributação")

Os inputs originais carregavam uma contradição aparente: o pitch do Elias promete "sem comissão, sem dupla tributação" e o documento de visão propõe comissão de 8% estilo iFood. A pesquisa resolveu:

- A "dupla tributação" real é o **efeito cascata do Simples**: o paisagista que revende paga imposto sobre o **valor cheio** da planta, não sobre a margem dele.
- A comissão da Viridi é cobrada **do viveiro** (que ganha um canal de vendas) — não é um segundo elo de revenda. São coisas diferentes e compatíveis.
- **O mecanismo que junta tudo é o Carrinho Direto com margem preservada:**

| Fluxo | Modelo antigo (revenda) | Modelo Viridi (Carrinho Direto) |
|---|---|---|
| Viveiro vende por | R$ 21.000 (ao paisagista) | R$ 21.000 (fatura direto ao cliente) |
| Paisagista cobra do cliente | R$ 27.000 (revenda com markup) | R$ 27.000 (R$ 21k itens + **R$ 6.000 honorário de especificação/gestão**) |
| Imposto do paisagista | Anexo I sobre R$ 27.000 ≈ **R$ 2.268** | Anexo III/IV sobre R$ 6.000 ≈ **R$ 360–540** |
| Capital de giro do paisagista | Adianta R$ 21.000 (ou pede sinal) | **Zero** — cliente paga, split distribui |
| Risco de inadimplência | Do paisagista | Da plataforma/custódia |

**O paisagista não perde a margem — ele a converte de "markup de revenda" (tributado cheio, com capital de giro e risco) em "honorário de serviço" (tributado só sobre a margem, sem capital, sem risco).** Economia de ~R$ 1.700–1.900 no exemplo + liberação de caixa. O produto oferece dois modos: **fee transparente** (cliente vê itens + honorários, padrão arquitetura) ou **bundled** (preço por item já com a margem do paisagista embutida; o split reparte automaticamente). O paisagista escolhe por cliente.

É por isso que o paisagista traz a obra para dentro — e é isso que mata a desintermediação pela raiz: **sair da plataforma custa imposto, capital de giro e risco.**

## 2. Linhas de receita (empilhadas por fase)

| # | Linha | Mecânica | Quem paga | Fase | Referência |
|---|---|---|---|---|---|
| 1 | **Comissão de marketplace** | 6–8% sobre GMV de plantas/insumos | Viveiro | MVP | iFood/MELI; B2B 3–8% |
| 2 | **Margem de logística** | Frete orquestrado com spread (equiv. 2–5% GMV) | Cliente (no pedido) | MVP | GoMaterials |
| 3 | **Fintech I — pagamento** | Spread de parcelamento (até 24x) + Pix | Cliente/viveiro | MVP | padrão adquirência |
| 4 | **Fintech II — capital** | Antecipação de recebível ao viveiro; net terms 30/60d à construtora | Viveiro/construtora | V1 | Faire/Resolve — o lock-in |
| 5 | **SaaS Viveiro Pro** | Assinatura: analytics, CRM, gestão de estoque, destaque | Viveiro | V1 | híbrido SaaS+mktplace |
| 6 | **Ads/destaque** | Posicionamento pago na busca e cotação | Viveiro | V1 | iFood Ads (>5% em Faire) |
| 7 | **Seguro** | Carga + garantia de pega estendida | Cliente | V2 | visão original |
| 8 | **Private label** | Insumos commodity marca Viridi (terra, substrato, tutores) | Todos | V2 | Infra.Market: 60% da receita, margem 8–12% |
| 9 | **Manutenção recorrente** | Take sobre contratos de manutenção pós-obra | Cliente | V2 | recorrência |

**Take efetivo blended alvo: 10–14% no ano 2, 14–18% na maturidade** — com comissão nominal baixa (6–8%) que não assusta o supply. Nunca ancorar o modelo na comissão: benchmarks mostram compressão inevitável (Ankorstore 20%→3%).

## 3. Unit economics — pedido-tipo de R$ 30.000

Mix: R$ 21.000 plantas/insumos + R$ 9.000 serviço do paisagista (honorário R$ 6.000 embutido no exemplo da seção 1 é alternativa; aqui uso o mix 70/30 dos inputs).

**Receita Viridi no pedido (MVP, ilustrativo):**

| Linha | Cálculo | Valor |
|---|---|---|
| Comissão viveiro | 8% × R$ 21.000 | R$ 1.680 |
| Margem de frete | frete R$ 2.500 cobrado, R$ 2.000 custo | R$ 500 |
| Spread pagamento | ~1,2% sobre R$ 30.000 transacionado | R$ 360 |
| **Receita total** | | **R$ 2.540 (~8,5% do pedido / ~12% do GMV de produto)** |

**Custos variáveis do pedido:** ops de cotação assistida (~R$ 150), custo de adquirência não repassado (~R$ 200), QA/suporte (~R$ 100) → **margem de contribuição ~R$ 2.090 (~82%)**. Sem CAC: no MVP a demanda vem da rede própria (ver GTM).

**E cada lado ganha:** viveiro vende sem esforço comercial e antecipa recebível · paisagista economiza ~R$ 1.700 de imposto, zera capital de giro e cota em horas · cliente paga em 24x com custódia e garantia · transportador enche agenda. **Take de ~8,5% comprando uma economia sistêmica maior que ele — é isso que torna o modelo defensável.**

## 4. Cold start & go-to-market

**A vantagem injusta:** Helena Elias Paisagismo + Jardim Paulistano Paisagismo são **demanda própria desde o dia 1** — dogfooding com GMV real (obras de alto padrão), sem CAC, gerando o dataset inicial de cotações e frete. Poucos marketplaces nascem com um lado da liquidez garantido.

| Fase | Supply | Demanda | Meta de saída |
|---|---|---|---|
| **0–6m (MVP)** | 20–30 viveiros âncora curados (cauda média de Holambra/Atibaia/Campinas — warm intros do Elias) | Obras próprias + 30–50 paisagistas convidados do círculo | 50 obras transacionadas; RFQ < 24h em 80%; NPS specifier > 60 |
| **6–18m (V1)** | 150+ viveiros; integração de estoque (VerdeSoft/ERPs); insumos | 300–500 paisagistas SP + 2–3 construtoras piloto (alto padrão) | GMV run-rate R$ 20–40 mi/ano; fintech ativa; retenção de obra > 70% |
| **18–36m (V2)** | Multi-polo (RJ serra, Sul); equipamentos; private label | Construtoras em escala; abertura B2C (mockups atuais) | GMV R$ 60–120 mi/ano (SOM); take blended 12%+; breakeven operacional à vista |

**Sequência de adoção (single-player first):** o Studio é útil ao paisagista **antes** de qualquer transação (organizar projetos, gerar orçamentos bonitos com o catálogo mestre). Ferramenta grátis → hábito → primeira cotação → primeira transação. Modelo REKKI/Choco: o app vira o WhatsApp do setor antes de cobrar.

## 5. Riscos & mitigações

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| **Desintermediação** (paisagista fecha por fora após descobrir o viveiro) | Alta | Alto | Carrinho Direto: sair custa imposto + capital de giro + risco; custódia/garantia; crédito; fee 0% em relação pré-existente cadastrada (padrão Faire) |
| **Veiling verticalizar** | Média | Alto | Velocidade; foco em porte/insumo/serviço (fora do DNA de flor de corte); cauda de viveiros não-cooperados; Studio como fosso de workflow |
| **Baixa frequência** (project-based) | Alta | Médio | Cotação por obra; entregas faseadas; manutenção recorrente; construtoras (pipeline contínuo) |
| **Execução logística** (planta viva, Munck, PTV) | Média | Alto | Asset-light: orquestrar frota de viveiro + especializadas; compliance automatizado como produto; começar raio 150km SP |
| **Chicken-egg** | Média | Alto | Demanda própria (dogfooding) + supply curado pequeno e profundo antes de largo |
| **Conflito de interesse** (Helena Elias como demanda âncora e sócia) | Média | Médio | Governança explícita: preços de mercado, mesmas condições dos demais paisagistas, transparência no cap table |
| **Tese fiscal invalidada em detalhe** | Baixa | Médio | Parecer de tributarista antes do lançamento; modelo funciona mesmo sem o argumento fiscal (conveniência + capital de giro sustentam sozinhos) |

## 6. O que precisa ser verdade (kill criteria do MVP)

1. Paisagistas **de fora do círculo** adotam o Studio e repetem (≥ 2 obras no trimestre) — senão é ferramenta interna, não plataforma.
2. Viveiros médios mantêm **estoque/foto atualizados** com o incentivo de demanda — senão o catálogo apodrece e o RFQ falha.
3. A cotação multi-viveiro fecha em **< 24h com ops enxuto** — senão o custo de serviço come o take.
4. Parecer tributário confirma o Carrinho Direto **sem risco de autuação** para paisagista e plataforma.

Se 2 desses falharem no piloto de 6 meses, repensar antes de escalar capital.

---

*Consolidação executiva e roadmap: `../VIRIDI_PLAN.md`.*
