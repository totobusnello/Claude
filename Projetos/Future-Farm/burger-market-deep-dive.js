const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat
} = require("docx");

// Colors
const DARK = "1B2A4A";
const ACCENT = "2E75B6";
const GREEN = "27AE60";
const RED = "E74C3C";
const ORANGE = "F39C12";
const LIGHT_BG = "F0F4F8";
const WHITE = "FFFFFF";
const GRAY = "666666";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// ── Helpers ──
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: [new TextRun({ font: "Arial", size: 22, color: "333333", ...opts.run, text })],
  });
}

function boldPara(label, value) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ font: "Arial", size: 22, bold: true, color: DARK, text: label }),
      new TextRun({ font: "Arial", size: 22, color: "333333", text: value }),
    ],
  });
}

function spacer(h = 200) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

// KPI Box row
function kpiRow(items) {
  const colW = Math.floor(9360 / items.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: items.map(() => colW),
    rows: [
      new TableRow({
        children: items.map((item, i) =>
          new TableCell({
            borders: noBorders,
            width: { size: colW, type: WidthType.DXA },
            shading: { fill: item.color || ACCENT, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 40 },
                children: [new TextRun({ font: "Arial", size: 28, bold: true, color: WHITE, text: item.value })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ font: "Arial", size: 18, color: WHITE, text: item.label })],
              }),
            ],
          })
        ),
      }),
    ],
  });
}

// Data table
function dataTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: headers.map((h, i) =>
          new TableCell({
            borders,
            width: { size: colWidths[i], type: WidthType.DXA },
            shading: { fill: DARK, type: ShadingType.CLEAR },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ font: "Arial", size: 20, bold: true, color: WHITE, text: h })] })],
          })
        ),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((cell, ci) =>
            new TableCell({
              borders,
              width: { size: colWidths[ci], type: WidthType.DXA },
              shading: { fill: ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR },
              margins: cellMargins,
              children: [new Paragraph({ children: [new TextRun({ font: "Arial", size: 20, color: "333333", text: String(cell) })] })],
            })
          ),
        })
      ),
    ],
  });
}

// Callout box
function callout(title, text, fillColor = "FFF3CD") {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: { style: BorderStyle.SINGLE, size: 3, color: ORANGE }, bottom: noBorder, left: noBorder, right: noBorder },
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: fillColor, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: [
              new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ font: "Arial", size: 22, bold: true, color: DARK, text: title })] }),
              new Paragraph({ children: [new TextRun({ font: "Arial", size: 20, color: "555555", text })] }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ── BUILD DOC ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // ── COVER ──
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        spacer(2000),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
          new TextRun({ font: "Arial", size: 56, bold: true, color: DARK, text: "Mercado de Hambúrgueres" }),
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
          new TextRun({ font: "Arial", size: 56, bold: true, color: ACCENT, text: "Plant-Based Congelados" }),
        ] }),
        spacer(200),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
          new TextRun({ font: "Arial", size: 28, color: GRAY, text: "Deep Dive: Brasil e Comparativo Global" }),
        ] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [
          new TextRun({ font: "Arial", size: 24, color: GRAY, text: "Fevereiro 2026 | Pesquisa Nuvini" }),
        ] }),
        spacer(400),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: ACCENT } },
          spacing: { before: 200 },
          children: [new TextRun({ font: "Arial", size: 20, color: GRAY, text: "Documento confidencial - Uso interno" })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ── MAIN CONTENT ──
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: ACCENT } },
            spacing: { after: 200 },
            children: [new TextRun({ font: "Arial", size: 16, color: GRAY, text: "Mercado de Hambúrgueres Plant-Based Congelados | Deep Dive" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
            children: [
              new TextRun({ font: "Arial", size: 16, color: GRAY, text: "Página " }),
              new TextRun({ font: "Arial", size: 16, color: GRAY, children: [PageNumber.CURRENT] }),
            ],
          })],
        }),
      },
      children: [
        // ── 1. VISAO GERAL ──
        heading("1. Visão Geral do Segmento", HeadingLevel.HEADING_1),
        para("Este relatório foca exclusivamente no segmento de hambúrgueres plant-based congelados — o sub-segmento onde a Fazenda Futuro alega ter ~70% de market share. Analisamos dados de mercado, preços, distribuição e concorrência para validar e contextualizar essa afirmação."),
        spacer(100),
        kpiRow([
          { value: "~R$ 550M", label: "Mercado Burgers PB Brasil (est.)", color: ACCENT },
          { value: "50%", label: "Burgers no total PB Meat", color: GREEN },
          { value: "38%+", label: "Crescimento anual 2023", color: ORANGE },
          { value: "3-5x", label: "Premium vs Carne Bovina", color: RED },
        ]),
        spacer(200),

        callout("Nota Metodológica",
          "O mercado total de carnes plant-based no Brasil foi de R$ 1,1 bilhão em 2023 (GFI Brasil). Burgers representam ~50% das vendas da categoria (Just Food). O segmento específico de hambúrgueres PB congelados é estimado em R$ 550M. A alegação de 70% de share da FF com R$38M de faturamento implica um mercado de apenas R$54M — o que se referiria a um nicho ainda mais específico (ex: burger PB congelado em formato artesanal/premium)."),
        spacer(200),

        // ── 2. TAMANHO DO MERCADO BRASIL ──
        heading("2. Tamanho do Mercado no Brasil", HeadingLevel.HEADING_1),
        heading("2.1 Segmentação do Mercado Plant-Based", HeadingLevel.HEADING_2),

        dataTable(
          ["Segmento", "Tamanho (2023)", "% do Total", "Fonte"],
          [
            ["Alimentos Plant-Based (total)", "~R$ 3-4 bilhões", "100%", "Euromonitor"],
            ["Carnes Plant-Based (total)", "R$ 1,1 bilhão", "~30%", "GFI Brasil"],
            ["Hambúrgueres PB (estimado)", "~R$ 550 milhões", "~50% de PB Meat", "Just Food/estimativa"],
            ["Alternativas de Proteína (IMARC)", "USD 522,8M (2025)", "-", "IMARC Group"],
          ],
          [2800, 2200, 1600, 2760]
        ),
        spacer(200),

        heading("2.2 Dados de Crescimento", HeadingLevel.HEADING_2),
        dataTable(
          ["Métrica", "Valor", "Período", "Fonte"],
          [
            ["Crescimento vendas PB meat", "+38%", "2022-2023", "GFI Brasil"],
            ["Crescimento volume", "+22%", "2022-2023", "GFI Brasil"],
            ["CAGR projetado (meat subs)", "27,17%", "2025-2034", "IMARC Group"],
            ["CAGR projetado (PB meat)", "43,7%", "2024-2030", "Grand View Research"],
            ["Crescimento varejo alimentar", "+4,7%", "2024", "Abras"],
          ],
          [2800, 1800, 2000, 2760]
        ),
        spacer(200),

        callout("Insight Chave",
          "O Pão de Açúcar reportou que hambúrgueres vegetais já representam 1/3 das vendas totais de hamburgueres congelados (incluindo carne bovina). Isso mostra a penetração significativa do segmento PB no burger congelado.", "E8F5E9"),
        spacer(200),

        // ── 3. LANDSCAPE COMPETITIVO ──
        heading("3. Landscape Competitivo no Brasil", HeadingLevel.HEADING_1),
        heading("3.1 Market Share por Marca", HeadingLevel.HEADING_2),

        dataTable(
          ["Marca", "Grupo", "Share Estimado", "PDVs", "Observação"],
          [
            ["Fazenda Futuro", "Independente", "~25% (PdA)", "~2.000", "Líder em burger premium; 74,8% em promo"],
            ["Seara Incrível", "JBS", "Alega #1", "Nacional", "Força de distribuição JBS"],
            ["Sadia Veg&Tal", "BRF", "Relevante", "Nacional", "Rede de distribuição BRF"],
            ["PlantPlus Foods", "Marfrig+ADM", "B2B foco", "BK/Outback", "Fornecedor exclusivo BK"],
            ["NotCo", "Independente", "Crescendo", "SP/RJ", "Parceria Burger King"],
            ["Beyond Meat", "Importado", "Mínimo", "19 lojas SP", "Preço muito alto"],
            ["Superbom", "Independente", "Nicho", "25.000+", "Foco canal natural/saúde"],
            ["Mr. Veggy", "Independente", "Nicho", "Regional", "Player menor"],
          ],
          [1600, 1400, 1400, 1360, 3600]
        ),
        spacer(200),

        callout("Sobre a Alegação de 70% Market Share da Fazenda Futuro",
          "A Fazenda Futuro alcançou 74,8% de share durante um período promocional específico. No Pão de Açúcar (principal rede), seu share sustentado é de ~25% da categoria burger (PB + carne). O fundador Marcos Leta citou 70% em \"substitutos de carne vegetal\" de forma ampla. O dado de 70% NÃO representa share sustentado do mercado total de burgers PB congelados. Com R$38M de faturamento, o share real no mercado de R$550M seria de ~7%. A alegação de 70% pode se referir a um sub-nicho específico (ex: burger artesanal PB premium em SP).", "FFF3CD"),
        spacer(200),

        heading("3.2 Preços no Varejo (Fev/2026)", HeadingLevel.HEADING_2),
        dataTable(
          ["Marca", "Produto", "Peso", "Preço (R$)", "R$/kg"],
          [
            ["Fazenda Futuro", "Future Burger", "230g (2un)", "16,99-18,99", "73,91-82,57"],
            ["Fazenda Futuro", "Future Burger 2.0", "230g (2un)", "18,90", "82,17"],
            ["Seara Incrível", "Standard", "226g (2un)", "19,90", "88,05"],
            ["Seara Incrível", "Gourmet", "310g", "20,00", "64,52"],
            ["Sadia Veg&Tal", "Burger Vegetal", "226g (2un)", "19,90", "88,05"],
            ["PlantPlus Foods", "Standard", "226g (2un)", "21,00", "92,92"],
            ["Superbom", "BBQ Vegetal", "350g", "~25,00", "~71,43"],
          ],
          [1700, 1800, 1500, 1800, 2560]
        ),
        spacer(200),

        heading("3.3 Comparativo com Burger Bovino Convencional", HeadingLevel.HEADING_2),
        dataTable(
          ["Tipo", "Marca Exemplo", "Preço (R$)", "R$/kg", "Premium PB"],
          [
            ["PB Congelado (média)", "Fazenda Futuro", "17-19", "74-83", "-"],
            ["Bovino Econômico", "Perdigão Standard", "2,69-4,99", "~15-25", "3-5x"],
            ["Bovino Premium", "Sadia Angus", "24,37", "~50-60", "1,3-1,5x"],
            ["Bovino Gourmet", "Perdigão Montana", "18,89", "~40-50", "1,5-2x"],
          ],
          [2000, 2000, 1800, 1600, 1960]
        ),
        spacer(100),
        para("O premium dos hambúrgueres plant-based em relação ao bovino econômico é de 3-5x, mas em relação ao bovino premium/gourmet o gap é menor (1,3-2x). Isso posiciona o PB burger como competitivo no segmento premium."),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 4. CANAL FOODSERVICE ──
        heading("4. Canal Foodservice / QSR", HeadingLevel.HEADING_1),

        dataTable(
          ["Rede", "Produto", "Fornecedor", "Status"],
          [
            ["Burger King", "Rebel Whopper / Whopper de Plantas", "Marfrig/PlantPlus Foods", "Nacional, menu permanente"],
            ["Outback", "Aussie Plant Burger", "Marfrig (Revolution)", "Nacional, menu permanente"],
            ["Bob's", "Opções plant-based", "Não divulgado", "Disponível"],
          ],
          [1800, 3000, 2400, 2160]
        ),
        spacer(200),

        callout("Sinal de Alerta: Foodservice",
          "O Burger King Brasil declarou em 2024 que \"a demanda de hambúrguer à base de planta parou de crescer\" (Bloomberg Línea). Isso indica saturação no canal foodservice, embora o varejo continue crescendo.", "FFEBEE"),
        spacer(200),

        // ── 5. COMPARATIVO GLOBAL ──
        heading("5. Comparativo Global: Burgers Plant-Based", HeadingLevel.HEADING_1),
        heading("5.1 EUA", HeadingLevel.HEADING_2),

        kpiRow([
          { value: "USD 3,21B", label: "PB Meat Total (2024)", color: DARK },
          { value: "28,4%", label: "Share dos Burgers", color: ACCENT },
          { value: "~USD 912M", label: "Burgers PB (est.)", color: GREEN },
          { value: "15%", label: "Penetração Domiciliar", color: RED },
        ]),
        spacer(200),

        dataTable(
          ["Marca", "Share EUA", "Observação"],
          [
            ["Beyond Meat", "~22%", "Líder, mas em declínio; SKUs caindo 10% YoY"],
            ["Impossible Foods", "~9%", "Forte em foodservice"],
            ["MorningStar Farms (Kellogg's)", "Significativo", "Líder histórico em veggie burger"],
            ["Gardein (ConAgra)", "Significativo", "Player estabelecido"],
          ],
          [3000, 2000, 4360]
        ),
        spacer(100),
        para("Tendência EUA: Vendas em varejo em declínio (USD 8,1B → abaixo em 2023). Penetração domiciliar caiu de 19% (2022) para 15% (2023). Porém, foodservice cresceu e representa 53,4% da receita PB meat. SKUs por loja caíram 31% desde 2021."),
        spacer(200),

        heading("5.2 Europa", HeadingLevel.HEADING_2),
        kpiRow([
          { value: "USD 1,56B", label: "PB Meat Total (2024)", color: DARK },
          { value: "37,7%", label: "Share dos Burgers", color: ACCENT },
          { value: "~USD 588M", label: "Burgers PB (est.)", color: GREEN },
          { value: "32%", label: "Penetração (DE/UK)", color: ORANGE },
        ]),
        spacer(200),

        dataTable(
          ["País", "Destaque", "Dado Chave"],
          [
            ["Alemanha", "Líder europeu (23,9% do mercado)", "32% dos domicílios compraram PB meat (2024)"],
            ["UK", "Mercado maduro", "32% penetração domiciliar; Vivera (JBS) forte"],
            ["Holanda", "Atingiu paridade de preço", "Burgers PB 78 centavos mais baratos que carne (2022)"],
          ],
          [2000, 3500, 3860]
        ),
        spacer(100),
        para("A Holanda é o único mercado que atingiu paridade de preço entre burgers PB e bovinos. Na Europa, burgers estão underperforming vs. produtos tipo carne moída e tiras. Unilever avalia vender The Vegetarian Butcher por resultados abaixo do esperado."),
        spacer(200),

        heading("5.3 China", HeadingLevel.HEADING_2),
        kpiRow([
          { value: "USD 1,37B", label: "PB Total (2024)", color: DARK },
          { value: "19,7%", label: "CAGR projetado", color: GREEN },
          { value: "31,2%", label: "Share da Ásia-Pacífico", color: ACCENT },
        ]),
        spacer(100),
        para("O mercado chinês de PB é focado predominantemente em ingredientes para hotpot e foodservice, não em burgers congelados no varejo. Players: OmniPork, Zhenmeat, Starfield, Hey Maet. Beyond Meat e Impossible entraram via KFC, Starbucks e Taco Bell."),
        spacer(200),

        heading("5.4 Tabela Comparativa Global", HeadingLevel.HEADING_2),
        dataTable(
          ["Região", "PB Meat (2024)", "Burgers %", "Burgers (est.)", "CAGR", "Penetração"],
          [
            ["EUA", "USD 3,21B", "28,4%", "~USD 912M", "18,1%", "15% domicílios"],
            ["Europa", "USD 1,56B", "37,7%", "~USD 588M", "Crescendo", "32% (DE/UK)"],
            ["China", "USD 1,37B", "Baixo", "N/D", "19,7%", "Foco hotpot"],
            ["Brasil", "R$ 1,1B (~USD 220M)", "~50%", "~USD 110M", "27-44%", "15% flex/veg"],
          ],
          [1400, 1700, 1200, 1700, 1200, 2160]
        ),
        spacer(100),
        para("O Brasil tem o maior CAGR projetado e a maior proporção de burgers dentro da categoria PB meat (50% vs 28-38% nos EUA/Europa), indicando que burgers são o principal gateway para proteínas alternativas no mercado brasileiro."),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 6. FAZENDA FUTURO DEEP DIVE ──
        heading("6. Fazenda Futuro: Análise Detalhada", HeadingLevel.HEADING_1),

        heading("6.1 Posicionamento e Capacidade", HeadingLevel.HEADING_2),
        dataTable(
          ["Métrica", "Dado", "Fonte"],
          [
            ["Faturamento alegado", "R$ 38 milhões (2024)", "Informação do cliente"],
            ["Valuation (último)", "R$ 374M / ~USD 100M", "Bloomberg Línea"],
            ["Capacidade produtiva", "130-150 ton/mês", "Reportagens"],
            ["Nova fábrica", "MG (dobrou capacidade jun/2023)", "Investnews"],
            ["PDVs", "~2.000 pontos nacionais", "Fast Company / Just Food"],
            ["Foco mercado-alvo", "R$ 200M/ano (addressable)", "Marcos Leta (2024)"],
          ],
          [3000, 3200, 3160]
        ),
        spacer(200),

        heading("6.2 Reconciliação do Market Share", HeadingLevel.HEADING_2),
        dataTable(
          ["Cenário", "Mercado Total", "Share FF", "Receita Implícita", "Plausível?"],
          [
            ["70% do PB burger total (~R$550M)", "R$ 550M", "70%", "R$ 385M", "Não (faturamento = R$38M)"],
            ["70% do PB meat total (R$1,1B)", "R$ 1,1B", "70%", "R$ 770M", "Não"],
            ["R$38M = 70% de nicho", "R$ 54M", "70%", "R$ 38M", "Possível (nicho específico)"],
            ["R$38M no mercado R$550M", "R$ 550M", "~7%", "R$ 38M", "Mais realista"],
            ["R$38M = 25% de sub-segmento", "R$ 152M", "25%", "R$ 38M", "Consistente com PdA data"],
          ],
          [2600, 1600, 1200, 1800, 2160]
        ),
        spacer(200),

        callout("Conclusão sobre o Market Share",
          "Com R$38M de faturamento, a Fazenda Futuro provavelmente detém 7-10% do mercado total de burgers PB congelados no Brasil (~R$550M). A alegação de 70% pode se referir a: (1) período promocional específico (74,8% documentado), (2) sub-nicho de burger artesanal premium PB em SP/RJ, ou (3) market share antes da entrada massiva de JBS (Seara) e BRF (Sadia). O dado do Pão de Açúcar (~25% da categoria total de burgers) é o mais confiável e independente.", "E3F2FD"),
        spacer(200),

        // ── 7. TENDENCIAS ──
        heading("7. Tendências-Chave do Segmento", HeadingLevel.HEADING_1),

        heading("7.1 Positivas", HeadingLevel.HEADING_3),
        ...[
          "Brasil: crescimento de 38% em vendas e 22% em volume (2022-2023) no total PB meat",
          "Burgers PB já representam 1/3 das vendas de burgers congelados no Pão de Açúcar",
          "CAGR projetado de 27-44% para o Brasil (maior do mundo)",
          "Canal foodservice em expansão (BK, Outback, Bob's)",
          "15% da população brasileira se declara flexitariana/vegetariana/vegana (Euromonitor 2024)",
        ].map(t => new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { after: 60 },
          children: [new TextRun({ font: "Arial", size: 22, color: "333333", text: t })],
        })),
        spacer(100),

        heading("7.2 Desafios", HeadingLevel.HEADING_3),
        ...[
          "Premium de 3-5x vs. carne bovina econômica limita adoção massiva",
          "BK Brasil reporta que demanda PB \"parou de crescer\" no foodservice",
          "EUA: penetração domiciliar caindo (19% → 15%), SKUs em declínio",
          "Europa: Holanda com vendas caindo 5,9% em 2024; Unilever quer vender The Vegetarian Butcher",
          "Textura e sabor ainda não satisfazem expectativas de muitos consumidores",
          "Beyond Meat com distribuição mínima no Brasil (19 lojas) por preço elevado",
        ].map(t => new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { after: 60 },
          children: [new TextRun({ font: "Arial", size: 22, color: "333333", text: t })],
        })),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 8. FONTES ──
        heading("8. Fontes e Referências", HeadingLevel.HEADING_1),
        ...[
          "GFI Brasil - Mercado brasileiro de carnes vegetais ultrapassou R$1B em 2023",
          "Grand View Research - Brazil Plant Based Meat Market Report",
          "IMARC Group - Brazil Meat Alternatives Market 2025-2034",
          "Euromonitor - Plant-Based Eating and Alternative Proteins",
          "Just Food - The plant-based potential in beef-loving Brazil",
          "Fast Company - Introducing plant-based protein to a meat-loving nation",
          "Bloomberg Línea - Marcos Leta / Fazenda Futuro profile",
          "Food Dive - Brazil's Future Farm US expansion",
          "vegconomist - Rising Plant-Based Brands in Brazil",
          "USDA Report - Brazil's Plant-Based Food Trends (São Paulo ATO)",
          "Bloomberg Línea - BK demanda PB parou de crescer",
          "Future Market Insights - Plant-Based Burger Market Report",
          "SPINS - 2024 Trend Predictions",
          "GFI Europe - European plant-based sales data",
          "Market Data Forecast - Europe Plant Based Meat Market",
          "Mordor Intelligence - China Plant-Based Market / South America Meat Substitute Market",
          "Pão de Açúcar, Carrefour, Sonda Delivery - Dados de preços no varejo (fev/2026)",
        ].map(t => new Paragraph({
          numbering: { reference: "bullets", level: 0 },
          spacing: { after: 40 },
          children: [new TextRun({ font: "Arial", size: 20, color: GRAY, text: t })],
        })),
        spacer(200),

        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
          spacing: { before: 400 },
          children: [new TextRun({ font: "Arial", size: 18, color: GRAY, text: "Relatório gerado em Fevereiro 2026 | Nuvini Research" })],
        }),
      ],
    },
  ],
});

const outPath = "/sessions/intelligent-beautiful-feynman/mnt/Claude/Future-Farm/Mercado-Burgers-PlantBased-DeepDive.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("OK:", outPath, `(${buf.length} bytes)`);
});
