# Viridi — Desenho do Produto

> Como a plataforma funciona: tese de produto, personas, jornadas, módulos e faseamento.
> Base: visão original (inputs/) + achados da pesquisa (docs/01_MARKET_RESEARCH.md). Vai além dos mockups — e diz onde diverge deles.

---

## 1. Tese de produto

**A Viridi não é um site onde se compra plantas. É o sistema operacional da obra de paisagismo.**

A pesquisa mudou uma premissa central: quem decide a compra no B2B de paisagismo não é "o comprador navegando numa vitrine" — é o **paisagista especificando um projeto**. Ele escolhe as espécies, os portes, as quantidades e o cronograma; o cliente só paga. Marketplaces que ignoraram isso (LandscapeHub) viraram catálogo bonito sem transação. Marketplaces que operaram o fluxo inteiro (GoMaterials) cresceram.

Por isso o produto é **specifier-led**: a porta de entrada é a ferramenta de trabalho do paisagista. O marketplace, a logística, o pagamento e o compliance ficam **embutidos no fluxo da obra** — e é aí que a Viridi monetiza.

```
┌─────────────────────────────────────────────────────────┐
│  CAMADA 1 — VIRIDI STUDIO (o hábito diário)             │
│  Workspace do paisagista: projetos, especificação,      │
│  orçamentos, cronograma, cliente                        │
├─────────────────────────────────────────────────────────┤
│  CAMADA 2 — MARKETPLACE (a transação)                   │
│  Catálogo multi-viveiro, estoque real, cotação de obra, │
│  Carrinho Direto, avaliações                            │
├─────────────────────────────────────────────────────────┤
│  CAMADA 3 — INFRA (o moat)                              │
│  Logística orquestrada · Split payment & custódia ·     │
│  Compliance fiscal/fitossanitário · Crédito · Dados     │
└─────────────────────────────────────────────────────────┘
```

O usuário vê o Studio. O dinheiro passa pelo Marketplace. A defesa competitiva mora na Infra.

---

## 2. Personas

| Persona | Quem é | Dor central | O que a Viridi entrega |
|---|---|---|---|
| **Paisagista / arquiteto** (pivô) | 9–16 mil empresas no BR, maioria micro; especifica e executa | Cota 15 viveiros por WhatsApp, coordena frete na mão, revende com imposto em cascata | Especifica em minutos, cota a obra inteira, cliente paga direto, margem preservada sem risco fiscal |
| **Viveirista médio** (supply-âncora) | Cauda dos ~8.300 viveiros (Holambra/Atibaia/Campinas); produz bem, não sabe vender digital | Sem site, sem marketing, sem alcance; depende de atravessador/relacionamento | Vitrine profissional + demanda qualificada + antecipação de recebível + PTV/nota automatizadas |
| **Construtora / incorporadora** | Alto padrão SP (segmento dobrou em 2025); compra paisagismo como pacote | Procurement opaco, sem comparabilidade, sem rastreio, risco de replantio | Cotação comparável multi-fornecedor, contrato, cronograma de entregas faseadas, garantia |
| **Transportador especializado** | Nicho concentrado (frota de viveiro, Transtim/Hamil, Munck avulso) | Ociosidade, negociação por telefone, sem agenda consolidada | Fluxo de cargas casadas com rota/agenda, pagamento garantido via plataforma |
| **Cliente final (pagador)** | Dono da casa/empresa; não escolhe planta, escolhe paisagista | Não entende o orçamento, paga caro sem transparência, dupla tributação embutida | Recebe link do orçamento aprovado, paga parcelado/Pix direto ao produtor, acompanha entrega |

**Decisão de produto:** o cliente final **não navega catálogo no MVP** — ele recebe, aprova e paga. (Os mockups atuais têm sabor B2C — home com "inspiração", busca aberta; isso vira Fase 3, não MVP.)

---

## 3. As quatro jornadas que definem o produto

### J1 — Cotação de Obra (RFQ multi-viveiro) — *a killer feature B2B*
O paisagista não compra SKU a SKU; ele tem uma **lista de plantas de projeto** (memorial descritivo). Na Viridi:
1. Sobe a lista — planilha, PDF do projeto, ou foto (IA extrai: espécie, porte, quantidade).
2. A plataforma **quebra a lista em lotes** e cota simultaneamente nos viveiros com estoque compatível.
3. Retorna em horas o **quadro comparativo**: preço, qualidade (fotos reais do lote, datadas), distância, frete calculado, prazo, disponibilidade parcial/total.
4. O paisagista monta a combinação vencedora (pode misturar viveiros) com frete consolidado.

*Hoje isso são 15 ligações + 3 dias de WhatsApp. Na Viridi: uma tarde.*

### J2 — Carrinho Direto (o mecanismo fiscal virando feature)
1. Paisagista fecha a cotação e aperta **"Enviar para o cliente"**.
2. Cliente recebe link com o orçamento visual (plantas, fotos, valores, cronograma) e **paga direto** — Pix, cartão em até 24x, boleto.
3. O split (padrão Bacen, como iFood/MELI) distribui: viveiros recebem cada um sua parte, transportador a sua, paisagista o serviço, Viridi a comissão.
4. **3 notas automáticas**: viveiro emite produto ao cliente; paisagista emite serviço; Viridi emite intermediação. Dinheiro em custódia até confirmação de entrega.

*Elimina o elo de revenda (economia de ~5–6 p.p. do pedido — argumento de venda ao paisagista E ao cliente), sem o paisagista perder o controle da obra.*

### J3 — Entrega orquestrada
1. Cada lote ganha **janela de entrega casada com o cronograma da obra** (terra antes das mudas; palmeiras no dia do Munck).
2. Matching de transporte: frota do próprio viveiro → transportadora especializada → Munck/guindaste para porte.
3. **PTV/CFO emitidos no fluxo** quando interestadual (a burocracia que hoje trava o setor vira um clique).
4. Rastreio em tempo real; recebimento com checklist fotográfico; disputa/replacement dentro da plataforma.

### J4 — Pós-obra recorrente (o antídoto à baixa frequência)
1. Obra entregue vira **ativo vivo cadastrado**: espécies, datas de plantio, garantias.
2. Plano de manutenção (poda, adubação, replantio) com paisagistas parceiros — receita recorrente.
3. Reposição por garantia de pega em 1 clique (a planta que não pegou já está especificada).
4. O jardim vira cliente permanente da plataforma — não um pedido que acabou.

---

## 4. Módulos e faseamento

| Módulo | MVP (0–6m) | V1 (6–18m) | V2 (18–36m) |
|---|---|---|---|
| **Studio (workspace)** | Projetos, lista de plantas, orçamento, envio ao cliente | Cronograma, CRM de clientes, biblioteca de specs reutilizáveis | Integração SketchUp/Lands, colaboração com construtora |
| **Catálogo** | Taxonomia mestre (espécie/porte/padrão), fotos reais de lote, ~30 viveiros curados SP | Estoque sincronizado (integração VerdeSoft/ERPs), 150+ viveiros, insumos (terra, substrato, pedras) | Nacional multi-polo, vasos/irrigação/iluminação, equipamentos |
| **Cotação de Obra (RFQ)** | Upload planilha → cotação multi-viveiro assistida (ops humano no loop) | Automatizada com SLA de resposta; disponibilidade parcial inteligente | Leilão reverso opcional para grandes volumes |
| **Carrinho Direto + pagamentos** | Split + custódia + Pix/cartão parcelado; 3 notas (emissão assistida) | Notas 100% automáticas; prazo B2B (net terms 30/60d) para construtoras | Crédito próprio/FIDC, seguro embarcado |
| **Logística** | Orquestração manual-assistida (frota de viveiro + parceiros); agendamento | Matching automático, PTV/CFO no fluxo, rastreio | Malha otimizada multi-obra, Munck marketplace |
| **IA — Viridi Specify** | Extração de lista de plantas de PDF/planilha/foto de projeto | Foto do espaço → sugestão de composição → carrinho; equivalências de espécies por clima/orçamento | Copiloto completo de especificação (solo, insolação, manutenção projetada) |
| **Manutenção/recorrência** | — | Registro do jardim + plano de manutenção | Marketplace de manutenção, garantia estendida |
| **App cliente final (B2C)** | Só link de pagamento/acompanhamento | Portal do cliente (obra, entregas, garantias) | Descoberta B2C completa (a home dos mockups atuais) |

**Ops no loop é deliberado no MVP** (modelo GoMaterials): curadoria e cotação assistida por humanos garantem qualidade enquanto o volume não justifica automação — e geram o dataset que treina a automação.

---

## 5. IA — onde ela é diferencial de verdade

1. **Specify (foto/projeto → carrinho):** ninguém faz no Brasil; os apps existentes fazem o inverso (identificar planta). É a feature-vitrine — mas só converte porque o marketplace por trás tem estoque real.
2. **Catálogo mestre normalizado:** 2.500 espécies / 17.500 variedades com sinônimos regionais ("alfineteiro" = "podocarpo"), portes padronizados, equivalências. **Este dataset não existe no país — cada cotação enriquece; é o data moat.**
3. **Preço e frete preditivos:** curva de preço por espécie/porte/região/estação; estimativa de frete por volumetria vegetal (ninguém sabe precificar caminhão de palmeira hoje).
4. **Matching de qualidade:** visão computacional sobre fotos de lote (padrão de copa, enraizamento) para score de qualidade — reduz a assimetria que hoje obriga o paisagista a "ir ver pessoalmente".

## 6. Norte de métricas

- **North star: GMV de obras ativas/mês** (não GMV bruto — obra ativa mede o hábito do specifier).
- Liquidez: **% de itens de RFQ cotados em < 24h** (meta MVP: 80%).
- Specifier love: **nº de obras/paisagista/trimestre** (frequência construída).
- Anti-desintermediação: **% de recompra do mesmo par paisagista-viveiro DENTRO da plataforma** (se cair, o lock-in de serviços falhou).
- Saúde do supply: **% do estoque com foto de lote < 30 dias**.

## 7. Sobre os mockups existentes (inputs/JPEGS)

**Aproveitar:** identidade (wordmark, símbolo de conexão, paleta verde-escuro/off-white) está pronta e forte; telas de rastreamento, projeto (Residência Atibaia, progresso 65%) e croqui apontam exatamente para o Studio; fluxo carrinho→checkout→split já desenhado.
**Rever:** a home atual é B2C-discovery ("para você se inspirar") — no MVP a home é o **dashboard de obras do paisagista**; busca aberta vira Cotação de Obra; onboarding de 4 telas reposicionar para o profissional. Nada se perde: a experiência B2C dos mockups é a Fase 3 (V2) já desenhada.

---

*Modelo de negócio e unit economics: `03_BUSINESS_MODEL.md`.*
