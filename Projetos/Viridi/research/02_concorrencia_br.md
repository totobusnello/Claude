# Cenário Competitivo Brasileiro — Marketplace de Plantas/Paisagismo (Viridi)

> **Objeto:** marketplace digital de plantas/paisagismo (conecta viveiros, paisagistas, construtoras, transportadoras, cliente final). MVP B2B em SP. Features-âncora: busca com estoque em tempo real, frete especializado, IA que especifica plantas por foto, gestão de projetos.
> **Data:** 2026-07-17 · **Método:** 10 buscas web (PT-BR) · `[V]` = verificado c/ URL · `[I]` = inferência do pesquisador.

## 0. Sizing
- `[V]` PIB da cadeia de flores e plantas ornamentais: **R$ 21,23 bi em 2024** (+9,95% vs 2023) — [Rural Centro/IBRAFLOR](https://www.ruralcentro.com.br/noticias/veiling-holambra-e-a-maior-bolsa-de-negociacoes-de-flores-da-america-latina-48904), [Jornal Spasso](https://jornalspassocidades.com.br/ibraflor-divulga-crescimento-da-floricultura-no-brasil/)
- `[V]` Plantas ornamentais: ~R$ 1 bi/ano, ~5% a.a. — [Sebrae](https://sebrae.com.br/sites/PortalSebrae/artigos/o-mercado-brasileiro-de-flores-e-plantas-ornamentais,456649f6ced44510VgnVCM1000004c00210aRCRD)
- `[I]` O subconjunto da Viridi (árvore de grande porte + insumo + frete pesado + mão de obra B2B) é alto ticket, alta fricção, hoje via WhatsApp — máxima oportunidade de digitalização.

## 1. E-commerces B2C
- **Cobasi** `[V]` 234 lojas / R$ 3,1 bi; pós-fusão **Petz**: R$ 7 bi / 483 lojas ([Terra](https://www.terra.com.br/economia/fusao-petz-cobasi-aprovada-no-cade-cria-grupo-com-faturamento-de-r-7-bi-e-483-lojas,4487cedb3ff236c8034a1bb4347a2c069moyx5eo.html)). Foco pet, jardim acessório, não B2B porte. **BAIXO-MÉDIO**
- **Plantei** `[I]` garden center online D2C consolidado, sem dado de rodada; ticket baixo, sem árvore/frete pesado. **BAIXO**
- **Giuliana Flores** `[V]` maior floricultura online, franchising desde 2025 ([IstoÉ Dinheiro](https://istoedinheiro.com.br/como-a-giuliana-flores-entrega-qualquer-lugar)). Flores de corte/presente — adjacente. **BAIXO**
- **Leroy Merlin** `[I]` home center DIY B2C. **BAIXO-MÉDIO**
- **Mercado Livre/Amazon/Shopee** `[I]` horizontais; vegetal de porte não cabe na malha padrão. **MÉDIO** (Risco 2)

## 2. Marketplace B2B agregador — **ACHADO: CATEGORIA VAZIA**
`[V]` Nenhuma busca retornou marketplace horizontal multi-viveiro com estoque em tempo real p/ profissional. Só viveiros single-seller: [Oficina do Paisagista](https://www.oficinadopaisagista.com.br/) ("maior viveiro de árvores do BR"), [Sítio Morrinhos](https://sitiomorrinhos.com.br/), [Portal das Palmeiras](https://portaldaspalmeiras.com.br/) (14 viveiros próprios), [Planta Legal Brasil](https://plantalegalbrasil.com.br/) (rastreabilidade), [Viveiro Porto Amazonas](https://www.viveiroportoamazonas.com.br/atacado-mudas-plantas), [Shop das Plantas](http://www.shopdasplantas.com.br/).

`[I]` Oferta digitalizada mas isolada — ninguém agrega. Viveiros grandes já resolveram venda direta (resistirão a desintermediação); gap de onboarding está na **cauda de viveiros médios**. **BAIXO hoje (vazio), campo de batalha central.**

## 3. Veiling Holambra — incumbente estrutural, **ameaça ALTO**
`[V]` Maior bolsa de flores/plantas da América Latina; **35–40% do atacado nacional**; região concentra ~70% do país; **450+ produtores, 1.000+ clientes, 2.500 variedades** ([Veiling](https://veiling.com.br/a-cooperativa/), [Rural Centro](https://www.ruralcentro.com.br/noticias/veiling-holambra-e-a-maior-bolsa-de-negociacoes-de-flores-da-america-latina-48904)).
`[V]` **Veiling Online**: webshop com escolha por **foto**, venda **em tempo real** ([Veiling](https://veiling.com.br/)); atende paisagistas via feiras/Veiling Market.
`[I]` Único com liquidez + canal digital comprovados (NÃO é greenfield). Limitações que abrem espaço: (1) cooperativa **fechada** aos cooperados; (2) foco em corte/ornamental, não árvore de porte/insumo/frete pesado/mão de obra; (3) leilão logístico centralizado, não software na obra do paisagista.

## 4. Apps/softwares
- **IA identificação:** PictureThis `[V]` >98% precisão ([site](https://www.picturethisai.com/pt/)), PlantNet `[V]` grátis científico. `[I]` Fazem o **inverso** da Viridi — identificam "que planta é", não "especifique e gere carrinho". **BAIXO/complementar.**
- **Projeto:** SketchUp `[V]`, Lands Design/RhinoLands `[V]` (8.000+ espécies). Desenho, sem transação. **BAIXO.**
- **ERP viveiro/floricultura BR:** **VerdeSoft** `[V]` (ERP de viveiro: produção→financeiro, rastreabilidade por lote, QR — [site](https://verdesoft.com.br/)); Soften, GestãoClick, Otimizer, eGestor, Linvix. `[I]` Nenhum acopla marketplace de demanda — VerdeSoft é **parceiro/aquisição**, não rival. **BAIXO-MÉDIO.**

## 5. Serviços
- **GetNinjas** `[V]` / **Triider** `[V]` — mão de obra pontual (jardineiro), modelo de lead, não vendem planta. **BAIXO.**
- **FreteBras/CargoX** `[V]` (40k+ ofertas de frete) — frete **genérico**, não especializado em vegetal de porte. **MÉDIO** (Risco 3).
- `[I]` Ninguém junta produto + frete especializado + mão de obra num fluxo único.

## 6. Startups agtech/greentech
`[V]` Agtechs BR: US$ 273 mi / 74 rodadas em 2022, ~41% em SP ([Liga Ventures](https://liga.ventures/insights/relatorios/startup-landscape-agtechs/)); marketplaces do agro citados como tese-chave ([Brasilagro](https://www.brasilagro.com.br/conteudo/agronegocio-se-rende-a-tecnologia-e-aposta-em-solucoes-criadas-por-starups.html)). Mais próxima: **Brota** `[V]` (hortas urbanas, ~R$ 3,27 mi captados — [Techenet](https://www.techenet.com/2023/10/startup-de-hortas-urbanas-que-recebe-r-1-milhao-em-investimentos/)) — adjacente.
`[I]` **Nenhuma startup B2B de paisagismo com aporte relevante encontrada** — nicho descoberto por VC (validação + cautela: perecível/logística pesada podem ser barreira de execução, não só de visão).

## (a) Matriz-síntese de ameaças

| Player | Nível |
|---|---|
| Veiling Holambra | **ALTO** |
| ML/Amazon/Shopee; FreteBras/CargoX | **MÉDIO** |
| Cobasi/Petz, Leroy; viveiros single-seller grandes | **BAIXO-MÉDIO / MÉDIO** |
| PictureThis/PlantNet/SketchUp/Lands; VerdeSoft/ERPs | **BAIXO / BAIXO-MÉDIO** |
| GetNinjas/Triider; Plantei/Giuliana/Brota | **BAIXO** |
| **Marketplace B2B multi-viveiro** | **VAZIO (white space)** |

## (b) White space
`[I]` Ninguém no BR combina num fluxo único:
1. **Agregação multi-viveiro aberta** com busca/estoque/preço/frete em tempo real (Veiling é fechado e focado em corte);
2. **Frete especializado de vegetal de porte** acoplado ao pedido;
3. **IA de especificação vegetal foto→carrinho** (inexistente; apps fazem o inverso);
4. **Software do paisagista na obra** (orçamento/projeto/entrega/CRM) integrado à compra.

A tese "ERP + Marketplace + Logística + IA do paisagismo" **não tem equivalente no BR**.

## (c) 3 riscos competitivos
1. **Veiling verticaliza (ALTO)** — já tem liquidez + webshop por foto; se abrir além dos cooperados e entrar em árvore/frete, ocupa o white space. Mitigação: velocidade + foco em porte/insumo/mão de obra (fora do DNA de flor de corte) + cauda de viveiros médios.
2. **Horizontal ataca o nicho (MÉDIO)** — ML/Amazon com frete parceiro. Mitigação: vegetal de porte não cabe na malha padrão; IA de especificação + gestão de obra são o fosso.
3. **Varejo de capital desce / frete sobe (MÉDIO)** — Cobasi-Petz (R$ 7 bi)/Leroy via M&A, ou FreteBras/CargoX subindo da logística. Mitigação: vantagem de insider (Helena Elias + Jardim Paulistano conhecem comprador e vendedor) + densidade de features integradas.

### Achados registrados (vazios = sinal)
- Categoria "marketplace B2B agregador multi-viveiro": **VAZIA**.
- IA especificação→carrinho: **inexistente no BR**.
- Frete de vegetal de porte integrado ao pedido: **inexistente**.
- Startup agtech B2B paisagismo com aporte: **não encontrada**.

---

*Pesquisa via agent market-researcher, 2026-07-17.*
