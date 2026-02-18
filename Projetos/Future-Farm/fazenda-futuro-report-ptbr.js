const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopType, TabStopPosition
} = require("docx");

const DARK_BLUE = "1B3A5C";
const MED_BLUE = "2E75B6";
const LIGHT_BLUE = "D5E8F0";
const DARK_GRAY = "333333";
const MED_GRAY = "666666";
const LIGHT_GRAY = "F2F2F2";
const GREEN = "2E7D32";
const RED = "C62828";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function hCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: DARK_BLUE, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text, bold: true, font: "Arial", size: 18, color: "FFFFFF" })] })]
  });
}

function cell(text, width, opts = {}) {
  const runs = Array.isArray(text)
    ? text
    : [new TextRun({ text, font: "Arial", size: 18, color: opts.color || DARK_GRAY, bold: opts.bold || false })];
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, children: runs })]
  });
}

function sectionTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, font: "Arial", size: 28, bold: true, color: DARK_BLUE })]
  });
}

function subTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: MED_BLUE })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 20, color: opts.color || DARK_GRAY, bold: opts.bold || false, italics: opts.italics || false })]
  });
}

function bullet(text) {
  return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, font: "Arial", size: 20, color: DARK_GRAY })] });
}

function kpiRow(items) {
  const colW = Math.floor(9360 / items.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: items.map(() => colW),
    rows: [
      new TableRow({
        children: items.map(item => new TableCell({
          borders: { top: { style: BorderStyle.SINGLE, size: 3, color: MED_BLUE }, bottom: noBorder, left: noBorder, right: noBorder },
          width: { size: colW, type: WidthType.DXA },
          shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 150, right: 150 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.value, font: "Arial", size: 28, bold: true, color: DARK_BLUE })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40 }, children: [new TextRun({ text: item.label, font: "Arial", size: 16, color: MED_GRAY })] })
          ]
        }))
      })
    ]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: DARK_BLUE },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: MED_BLUE },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
    ]
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [
    // =================== CAPA ===================
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        new Paragraph({ spacing: { before: 3000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "FAZENDA FUTURO", font: "Arial", size: 56, bold: true, color: DARK_BLUE })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "(Future Farm)", font: "Arial", size: 32, color: MED_BLUE })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: MED_BLUE, space: 1 } },
          spacing: { after: 400 },
          children: []
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Relat\u00f3rio de Pesquisa Profunda", font: "Arial", size: 28, color: DARK_GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Intelig\u00eancia Corporativa & An\u00e1lise Financeira", font: "Arial", size: 22, color: MED_GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 600, after: 100 },
          children: [new TextRun({ text: "Fevereiro 2026", font: "Arial", size: 22, color: MED_GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "CONFIDENCIAL", font: "Arial", size: 20, bold: true, color: RED })]
        }),
      ]
    },

    // =================== CONTE\u00daDO PRINCIPAL ===================
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: MED_BLUE, space: 4 } },
            children: [
              new TextRun({ text: "Fazenda Futuro \u2014 Relat\u00f3rio de Pesquisa Profunda", font: "Arial", size: 16, color: MED_GRAY }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 4 } },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "P\u00e1gina ", font: "Arial", size: 16, color: MED_GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: MED_GRAY }),
            ]
          })]
        })
      },
      children: [
        // ===== RESUMO EXECUTIVO =====
        sectionTitle("1. RESUMO EXECUTIVO"),
        para("A Fazenda Futuro (marca internacional: Future Farm) \u00e9 a empresa pioneira de carnes plant-based do Brasil, fundada em 2019 pelos empreendedores seriais Marcos Leta e Alfredo Strechinsky. Ap\u00f3s captar ~US$90M em tr\u00eas rodadas de investimento e atingir um valuation de pico de ~US$400M (R$2,2 bilh\u00f5es) em 2021, a empresa passou por uma grande pivotagem estrat\u00e9gica em 2024, recuando da expans\u00e3o internacional agressiva para refocar no mercado brasileiro."),
        para("Este relat\u00f3rio compila todos os dados publicamente dispon\u00edveis sobre estrat\u00e9gia, opera\u00e7\u00f5es, financials, posi\u00e7\u00e3o competitiva e status atual da empresa."),
        new Paragraph({ spacing: { before: 200, after: 200 } }),

        kpiRow([
          { value: "~US$90M", label: "Total Captado" },
          { value: "~US$400M", label: "Valuation Pico (2021)" },
          { value: "20.000", label: "PDVs no Brasil" },
          { value: "2019", label: "Ano de Funda\u00e7\u00e3o" },
        ]),

        new Paragraph({ spacing: { after: 200 } }),

        // ===== VIS\u00c3O GERAL =====
        sectionTitle("2. VIS\u00c3O GERAL DA EMPRESA"),
        subTitle("2.1 Identidade & Funda\u00e7\u00e3o"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [cell("Raz\u00e3o Social", 3120, { bold: true, shading: LIGHT_GRAY }), cell("Fazenda Futuro Produtos Aliment\u00edcios S.A.", 6240)] }),
            new TableRow({ children: [cell("Marca Internacional", 3120, { bold: true, shading: LIGHT_GRAY }), cell("Future Farm", 6240)] }),
            new TableRow({ children: [cell("Funda\u00e7\u00e3o", 3120, { bold: true, shading: LIGHT_GRAY }), cell("2019 (desenvolvimento iniciado em 2017)", 6240)] }),
            new TableRow({ children: [cell("Fundadores", 3120, { bold: true, shading: LIGHT_GRAY }), cell("Marcos Leta (CEO) & Alfredo Strechinsky", 6240)] }),
            new TableRow({ children: [cell("Sede", 3120, { bold: true, shading: LIGHT_GRAY }), cell("Rio de Janeiro, RJ", 6240)] }),
            new TableRow({ children: [cell("F\u00e1brica", 3120, { bold: true, shading: LIGHT_GRAY }), cell("Volta Redonda, RJ (600-700 toneladas/m\u00eas)", 6240)] }),
            new TableRow({ children: [cell("Funcion\u00e1rios", 3120, { bold: true, shading: LIGHT_GRAY }), cell("~150-235 (reduzido ap\u00f3s reestrutura\u00e7\u00e3o de 2024)", 6240)] }),
            new TableRow({ children: [cell("Site", 3120, { bold: true, shading: LIGHT_GRAY }), cell("fazendafuturo.io / futurefarm.io", 6240)] }),
            new TableRow({ children: [cell("Instagram", 3120, { bold: true, shading: LIGHT_GRAY }), cell("@fazendafuturo (375 mil seguidores, 1.460 posts)", 6240)] }),
          ]
        }),

        new Paragraph({ spacing: { after: 100 } }),

        subTitle("2.2 Background dos Fundadores"),
        para("Ambos fundaram anteriormente a Do Bem, empresa de sucos naturais premium vendida para a AmBev (subsidi\u00e1ria da AB InBev) em 2016. Essa experi\u00eancia empreendedora lhes deu capital e expertise em bens de consumo para lan\u00e7ar a Fazenda Futuro."),
        para("As opera\u00e7\u00f5es nos EUA foram lideradas por Alexandre Ruberti (ex-presidente da Red Bull Distribution Company USA, 16 anos na Red Bull), contratado como CEO da Future Farm USA para liderar a entrada na Am\u00e9rica do Norte."),

        subTitle("2.3 Miss\u00e3o & Posicionamento"),
        para("\"Mudando a forma como o mundo come.\" A empresa se posiciona como uma food tech que utiliza Intelig\u00eancia Artificial para desenvolver alternativas plant-based que replicam sabor, textura e sucul\u00eancia da prote\u00edna animal. Todos os produtos s\u00e3o livres de transg\u00eanicos (non-GMO) e sem gl\u00faten."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== PORTF\u00d3LIO DE PRODUTOS =====
        sectionTitle("3. PORTF\u00d3LIO DE PRODUTOS"),
        subTitle("3.1 Linha Atual"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2340, 3510, 3510],
          rows: [
            new TableRow({ children: [hCell("Produto", 2340), hCell("Detalhes", 3510), hCell("Especifica\u00e7\u00f5es", 3510)] }),
            new TableRow({ children: [
              cell("Futuro Burger 4.0", 2340, { bold: true }),
              cell("Carro-chefe. Lan\u00e7ado 2024 com True Texture Technology. Dispon\u00edvel 115g e 230g.", 3510),
              cell("14g prote\u00edna, 159 kcal, 4,7g carboidratos, 9,6g gordura sat.", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Carne Mo\u00edda", 2340, { bold: true }),
              cell("Carne mo\u00edda vegetal para uso vers\u00e1til na cozinha", 3510),
              cell("Blend de prote\u00edna de soja + ervilha", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Alm\u00f4ndega", 2340, { bold: true }),
              cell("Alm\u00f4ndegas plant-based", 3510),
              cell("Formato pronto para cozinhar", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Chicken", 2340, { bold: true }),
              cell("Tiras de frango plant-based", 3510),
              cell("Base de prote\u00edna texturizada de soja", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Lingu\u00ed\u00e7a", 2340, { bold: true }),
              cell("Lingu\u00ed\u00e7a plant-based estilo brasileiro", 3510),
              cell("Formato tradicional brasileiro", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Tuna", 2340, { bold: true }),
              cell("Atum vegetal em conserva (lan\u00e7ado 2021)", 3510),
              cell("Categoria inovadora no Brasil", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Aveia", 2340, { bold: true }),
              cell("Leite de aveia: Original, Chocolate, Baunilha, Culin\u00e1rio. Packs de 1L.", 3510),
              cell("Lan\u00e7ado 2024 no P\u00e3o de A\u00e7\u00facar e Carrefour", 3510)
            ]}),
          ]
        }),

        new Paragraph({ spacing: { after: 100 } }),

        subTitle("3.2 Diferencial Tecnol\u00f3gico"),
        para("True Texture Technology: sistema baseado em IA descrito como uma \"l\u00edngua artificial\" que captura e replica perfis de sabor. Utiliza prote\u00edna texturizada de soja, prote\u00edna isolada de soja, prote\u00edna de ervilha, gordura de coco e beterraba (para ferro/colora\u00e7\u00e3o). O Futuro Burger 4.0 representa 4 anos de desenvolvimento iterativo nesta plataforma."),

        subTitle("3.3 Pipeline de Produtos"),
        para("Produtos em desenvolvimento incluem queijo, mel e bacon plant-based, expandindo o portf\u00f3lio al\u00e9m de carnes para categorias adjacentes."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== CAPTA\u00c7\u00d5ES & FINANCEIRO =====
        sectionTitle("4. CAPTA\u00c7\u00d5ES & DADOS FINANCEIROS"),
        subTitle("4.1 Hist\u00f3rico de Capta\u00e7\u00f5es"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1400, 1200, 1560, 1800, 3400],
          rows: [
            new TableRow({ children: [
              hCell("Rodada", 1400), hCell("Data", 1200), hCell("Valor", 1560), hCell("Valuation", 1800), hCell("Investidores L\u00edderes", 3400)
            ]}),
            new TableRow({ children: [
              cell("Series A", 1400, { bold: true }),
              cell("Jul 2019", 1200),
              cell("US$8,5M", 1560, { bold: true }),
              cell("US$100M", 1800),
              cell("Monashees, Go4it Capital", 3400)
            ]}),
            new TableRow({ children: [
              cell("Series B", 1400, { bold: true }),
              cell("Set 2020", 1200),
              cell("US$21-25M", 1560, { bold: true }),
              cell("~US$130M", 1800),
              cell("BTG Pactual, ENFINI Investments", 3400)
            ]}),
            new TableRow({ children: [
              cell("Series C", 1400, { bold: true }),
              cell("Nov 2021", 1200),
              cell("US$58M", 1560, { bold: true }),
              cell([new TextRun({ text: "US$400M", font: "Arial", size: 18, bold: true, color: GREEN })], 1800),
              cell("BTG Pactual, Rage Capital, XP Inc", 3400)
            ]}),
            new TableRow({ children: [
              cell([new TextRun({ text: "TOTAL", font: "Arial", size: 18, bold: true, color: "FFFFFF" })], 1400, { shading: DARK_BLUE }),
              cell("", 1200, { shading: DARK_BLUE }),
              cell([new TextRun({ text: "~US$90M", font: "Arial", size: 18, bold: true, color: "FFFFFF" })], 1560, { shading: DARK_BLUE }),
              cell([new TextRun({ text: "Pico: US$400M", font: "Arial", size: 18, bold: true, color: "FFFFFF" })], 1800, { shading: DARK_BLUE }),
              cell([new TextRun({ text: "9+ investidores institucionais", font: "Arial", size: 18, color: "FFFFFF" })], 3400, { shading: DARK_BLUE }),
            ]}),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        subTitle("4.2 Principais Investidores"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2800, 2200, 4360],
          rows: [
            new TableRow({ children: [hCell("Investidor", 2800), hCell("Tipo", 2200), hCell("Observa\u00e7\u00f5es", 4360)] }),
            new TableRow({ children: [cell("BTG Pactual", 2800, { bold: true }), cell("Banco de Investimento", 2200), cell("Maior investidor institucional. Saiu em meados de 2024 com preju\u00edzo de ~33%.", 4360)] }),
            new TableRow({ children: [cell("Monashees+", 2800, { bold: true }), cell("Fundo de VC", 2200), cell("Participou de todas as rodadas (A, B, C). VC de refer\u00eancia na Am\u00e9rica Latina.", 4360)] }),
            new TableRow({ children: [cell("Go4it Capital", 2800, { bold: true }), cell("Family Office", 2200), cell("Marc Lemann & Cesar Villares. Todas as rodadas.", 4360)] }),
            new TableRow({ children: [cell("Rage Capital", 2800, { bold: true }), cell("VC Europeu", 2200), cell("Co-l\u00edder da Series C. Track record com Airbnb.", 4360)] }),
            new TableRow({ children: [cell("XP Inc", 2800, { bold: true }), cell("Fintech Brasileira", 2200), cell("Participou da Series C.", 4360)] }),
            new TableRow({ children: [cell("ENFINI / PWR Capital", 2800, { bold: true }), cell("Empresa de Investimento", 2200), cell("Participou da Series B.", 4360)] }),
            new TableRow({ children: [cell("Turim MFO", 2800, { bold: true }), cell("Family Office", 2200), cell("Participou das Series B e C.", 4360)] }),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        subTitle("4.3 Trajet\u00f3ria de Valuation"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2340, 2340, 2340, 2340],
          rows: [
            new TableRow({ children: [hCell("Per\u00edodo", 2340), hCell("Valuation", 2340), hCell("M\u00faltiplo vs Anterior", 2340), hCell("Contexto", 2340)] }),
            new TableRow({ children: [cell("Jul 2019", 2340), cell("US$100M", 2340, { bold: true }), cell("Base", 2340), cell("Post-money Series A", 2340)] }),
            new TableRow({ children: [cell("Set 2020", 2340), cell("~US$130M", 2340, { bold: true }), cell("1,3x", 2340), cell("Pr\u00e9-investimento Series B", 2340)] }),
            new TableRow({ children: [cell("Nov 2021", 2340), cell([new TextRun({ text: "US$400M", font: "Arial", size: 18, bold: true, color: GREEN })], 2340), cell([new TextRun({ text: "4,0x vs Series A", font: "Arial", size: 18, bold: true, color: GREEN })], 2340), cell("Pico \u2014 hype plant-based", 2340)] }),
            new TableRow({ children: [cell("Meados 2024", 2340), cell([new TextRun({ text: "Significativamente menor", font: "Arial", size: 18, bold: true, color: RED })], 2340), cell([new TextRun({ text: "BTG saiu com -33%", font: "Arial", size: 18, color: RED })], 2340), cell("Crise do setor, pivotagem", 2340)] }),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        subTitle("4.4 M\u00e9tricas Financeiras (Dados P\u00fablicos Limitados)"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [hCell("M\u00e9trica", 3120), hCell("Dado", 6240)] }),
            new TableRow({ children: [cell("Receita", 3120, { bold: true }), cell("Estimada em US$5-25M/ano (Owler); n\u00e3o divulgada oficialmente", 6240)] }),
            new TableRow({ children: [cell("Margem Bruta", 3120, { bold: true }), cell("44% (declarado pelo CEO Marcos Leta)", 6240)] }),
            new TableRow({ children: [cell("EBITDA / Lucro L\u00edquido", 3120, { bold: true }), cell("N\u00e3o divulgado. Provavelmente operando com preju\u00edzo durante fase de expans\u00e3o.", 6240)] }),
            new TableRow({ children: [cell("Mercado Endere\u00e7\u00e1vel (BR)", 3120, { bold: true }), cell("R$200M/ano (estimativa do CEO, 2024)", 6240)] }),
            new TableRow({ children: [cell("Capacidade Produtiva", 3120, { bold: true }), cell("600-700 ton/m\u00eas (potencial: 1.200-1.300 ton)", 6240)] }),
            new TableRow({ children: [cell("Distribui\u00e7\u00e3o", 3120, { bold: true }), cell("20.000 pontos de venda no Brasil (2024)", 6240)] }),
          ]
        }),

        new Paragraph({ spacing: { after: 100 } }),

        subTitle("4.5 Sa\u00edda do BTG Pactual (Ago 2024)"),
        para("O fundo BoostLAB Ventures do BTG Pactual vendeu sua participa\u00e7\u00e3o de volta aos fundadores Marcos Leta e Alfredo Strechinsky. O fundo FF Multistrat\u00e9gia registrou uma redu\u00e7\u00e3o de 32,79% no patrim\u00f4nio l\u00edquido a partir da posi\u00e7\u00e3o na Fazenda Futuro. Isso sinaliza que o valuation da empresa caiu significativamente em rela\u00e7\u00e3o ao pico de R$2,2B. Os fundadores retomaram o controle total com um grupo menor de parceiros e dois fundos menores."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== EVOLU\u00c7\u00c3O ESTRAT\u00c9GICA =====
        sectionTitle("5. EVOLU\u00c7\u00c3O ESTRAT\u00c9GICA"),
        subTitle("5.1 Fase 1: Crescimento Explosivo (2019-2022)"),
        para("Estrat\u00e9gia inicial: expans\u00e3o r\u00e1pida de produtos + crescimento internacional agressivo. Expandiu do Brasil para 23-30 pa\u00edses incluindo EUA, Reino Unido, Alemanha, Chile e Col\u00f4mbia. Contratou ex-executivo da Red Bull, Alexandre Ruberti, como CEO nos EUA. Meta: 65% do faturamento vindo do mercado americano em 2 anos."),

        subTitle("5.2 Fase 2: A Pivotagem (2023-2024)"),
        para("Choque de realidade provocado por m\u00faltiplos fatores:"),
        bullet("Investimento no setor plant-based caiu ~50% globalmente em 2024"),
        bullet("A\u00e7\u00f5es da Beyond Meat desabaram abaixo de US$1; Impossible Foods fazendo demiss\u00f5es"),
        bullet("Mercado endere\u00e7\u00e1vel brasileiro reavaliado em apenas R$200M (vs bilh\u00f5es impl\u00edcitos no valuation de pico)"),
        bullet("Expans\u00e3o internacional queimando caixa sem retorno proporcional"),
        bullet("Fundadores recompraram participa\u00e7\u00e3o do BTG Pactual com ~33% de desconto, retomando controle"),

        subTitle("5.3 Fase 3: Opera\u00e7\u00f5es Refocadas (2024+)"),
        para("Novos pilares estrat\u00e9gicos segundo o CEO Marcos Leta:"),
        bullet("Brasil primeiro: refoco nos 20.000 PDVs dom\u00e9sticos"),
        bullet("Flexitarianos ao inv\u00e9s de veganos: mirando consumidores ocasionais de plant-based"),
        bullet("\"Menos redes sociais, mais presen\u00e7a na rua\": engajamento direto com o consumidor"),
        bullet("Opera\u00e7\u00e3o enxuta: equipe menor, menos depend\u00eancia de capital externo"),
        bullet("Inova\u00e7\u00e3o de produto: Futuro Burger 4.0, linha de leite de aveia, expans\u00e3o do pipeline"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== CEN\u00c1RIO COMPETITIVO =====
        sectionTitle("6. CEN\u00c1RIO COMPETITIVO"),
        subTitle("6.1 Mercado Plant-Based no Brasil"),
        para("O mercado plant-based brasileiro atingiu R$1,1 bilh\u00e3o em vendas no varejo em 2023 (alta de 38% a/a). Carnes plant-based projetadas para R$800M at\u00e9 2025. Principais drivers: consci\u00eancia sobre sa\u00fade (especialmente Gera\u00e7\u00e3o Z), preocupa\u00e7\u00f5es com sustentabilidade e um crescente movimento flexitariano \u2014 26% dos brasileiros consomem carne plant-based pelo menos 1x/m\u00eas."),

        new Paragraph({ spacing: { after: 100 } }),

        subTitle("6.2 Matriz Competitiva"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1800, 1400, 1600, 2000, 2560],
          rows: [
            new TableRow({ children: [
              hCell("Empresa", 1800), hCell("Tipo", 1400), hCell("Market Share", 1600), hCell("Produtos-Chave", 2000), hCell("Status", 2560)
            ]}),
            new TableRow({ children: [
              cell("Seara Incr\u00edvel (JBS)", 1800, { bold: true }),
              cell("Frigor\u00edfico", 1400),
              cell([new TextRun({ text: "60%+", font: "Arial", size: 18, bold: true, color: GREEN })], 1600),
              cell("Bife, carne mo\u00edda, frango", 2000),
              cell("L\u00edder de mercado. Distribui\u00e7\u00e3o massiva.", 2560)
            ]}),
            new TableRow({ children: [
              cell("Fazenda Futuro", 1800, { bold: true }),
              cell("Startup", 1400),
              cell("~15-20% est.", 1600),
              cell("Burger, mo\u00edda, lingu\u00ed\u00e7a, leite", 2000),
              cell("Pioneira. Refocando no Brasil.", 2560)
            ]}),
            new TableRow({ children: [
              cell("PlantPlus (Marfrig+ADM)", 1800, { bold: true }),
              cell("Joint Venture", 1400),
              cell("Crescendo", 1600),
              cell("Hamb\u00fargueres", 2000),
              cell("Alavancando distribui\u00e7\u00e3o Marfrig.", 2560)
            ]}),
            new TableRow({ children: [
              cell("NotCo", 1800, { bold: true }),
              cell("Startup", 1400),
              cell("Nicho", 1600),
              cell("Multi-categoria", 2000),
              cell("Chilena. Expans\u00e3o regional.", 2560)
            ]}),
            new TableRow({ children: [
              cell("Beyond Meat", 1800, { bold: true }),
              cell("Empresa P\u00fablica (EUA)", 1400),
              cell("Em decl\u00ednio", 1600),
              cell("Burger, salsicha", 2000),
              cell([new TextRun({ text: "A\u00e7\u00e3o <US$1. Modo sobreviv\u00eancia.", font: "Arial", size: 18, color: RED })], 2560)
            ]}),
            new TableRow({ children: [
              cell("Sadia Veg&Tal (BRF)", 1800, { bold: true }),
              cell("Frigor\u00edfico", 1400),
              cell("Saiu", 1600),
              cell("Linha vegetal", 2000),
              cell("BRF abandonou plant-based em 2023.", 2560)
            ]}),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        subTitle("6.3 Contexto Global da Ind\u00fastria (2025)"),
        para("A ind\u00fastria global de plant-based passou por uma forte corre\u00e7\u00e3o ap\u00f3s o pico de hype em 2022. A Beyond Meat fez rebrand para \"Beyond\" e pivotou para bebidas proteicas; a a\u00e7\u00e3o desabou. A Impossible Foods busca expans\u00e3o europeia mas a lucratividade segue distante. Investimento privado no setor caiu ~50% em 2024. Contudo, o mercado dom\u00e9stico brasileiro mostra resili\u00eancia com crescimento anual de 20-40%, impulsionado por vantagens cambiais para produtores locais e forte ado\u00e7\u00e3o pelo consumidor."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== LINHA DO TEMPO =====
        sectionTitle("7. LINHA DO TEMPO"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1400, 7960],
          rows: [
            new TableRow({ children: [hCell("Ano", 1400), hCell("Evento", 7960)] }),
            new TableRow({ children: [cell("2009", 1400, { bold: true }), cell("Marcos Leta & Alfredo Strechinsky fundam a Do Bem (empresa de sucos)", 7960)] }),
            new TableRow({ children: [cell("2016", 1400, { bold: true }), cell("Do Bem vendida para AmBev (subsidi\u00e1ria da AB InBev)", 7960)] }),
            new TableRow({ children: [cell("2017", 1400, { bold: true }), cell("Fundadores come\u00e7am a estudar o mercado aliment\u00edcio brasileiro; in\u00edcio do P&D da Fazenda Futuro", 7960)] }),
            new TableRow({ children: [cell("2019", 1400, { bold: true }), cell("Lan\u00e7amento oficial com o Futuro Burger. Series A: US$8,5M com valuation de US$100M.", 7960)] }),
            new TableRow({ children: [cell("2020", 1400, { bold: true }), cell("Series B: US$21-25M. Lan\u00e7amento da lingu\u00ed\u00e7a. Pr\u00eamio Fast Company World Changing Ideas.", 7960)] }),
            new TableRow({ children: [cell("2021", 1400, { bold: true }), cell("Series C: US$58M com valuation de US$400M. Lan\u00e7amento de atum vegetal e leite de aveia. Entrada no mercado americano.", 7960)] }),
            new TableRow({ children: [cell("2022", 1400, { bold: true }), cell("Expans\u00e3o para 23-30 pa\u00edses, 10.000+ PDVs. Pico da presen\u00e7a internacional.", 7960)] }),
            new TableRow({ children: [cell("2023", 1400, { bold: true }), cell("In\u00edcio da crise no setor plant-based. Empresa come\u00e7a a reavaliar estrat\u00e9gia.", 7960)] }),
            new TableRow({ children: [cell("2024", 1400, { bold: true, color: RED }), cell([new TextRun({ text: "PIVOTAGEM: Fundadores recompram participa\u00e7\u00e3o do BTG (-33%). Retorno ao foco Brasil. Opera\u00e7\u00e3o enxuta. Lan\u00e7amento Futuro Burger 4.0 e leite de aveia. 20.000 PDVs dom\u00e9sticos.", font: "Arial", size: 18, color: DARK_GRAY })], 7960)] }),
            new TableRow({ children: [cell("2025+", 1400, { bold: true }), cell("Continuidade da estrat\u00e9gia Brasil-primeiro. Inova\u00e7\u00e3o de produto. Modelo focado em lucratividade.", 7960)] }),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== AN\u00c1LISE CR\u00cdTICA =====
        sectionTitle("8. AN\u00c1LISE CR\u00cdTICA"),

        subTitle("8.1 Valuation vs Realidade do Mercado"),
        para("O dado mais marcante \u00e9 a desconex\u00e3o entre o valuation de pico (R$2,2B / ~US$400M) e a pr\u00f3pria avalia\u00e7\u00e3o do CEO em 2024, de que o mercado endere\u00e7\u00e1vel brasileiro \u00e9 de apenas R$200M por ano. Isso implica que a empresa foi avaliada em ~11x o mercado endere\u00e7\u00e1vel inteiro \u2014 um sobrevaluation significativo impulsionado pela euforia setorial e n\u00e3o por fundamentos."),

        subTitle("8.2 Efici\u00eancia de Capital"),
        para("Com ~US$90M captados e a empresa pivotando para \"opera\u00e7\u00e3o enxuta\", a efici\u00eancia de capital durante a fase de expans\u00e3o parece baixa. S\u00f3 a Series C (US$58M, 64% do total) foi captada no pico do hype e provavelmente foi empregada com baixo ROI na expans\u00e3o internacional que foi subsequentemente abandonada."),

        subTitle("8.3 Amea\u00e7a Competitiva"),
        para("A entrada da JBS (via Seara Incr\u00edvel) com 60%+ de market share \u00e9 a principal amea\u00e7a competitiva. A JBS traz distribui\u00e7\u00e3o massiva, escala de produ\u00e7\u00e3o e reconhecimento de marca que uma startup n\u00e3o consegue igualar. A vantagem de inova\u00e7\u00e3o da Fazenda Futuro \u00e9 real, mas pode ser insuficiente contra essa diferen\u00e7a de escala."),

        subTitle("8.4 Sinais Positivos"),
        bullet("Margem bruta de 44% \u00e9 saud\u00e1vel para uma empresa de alimentos"),
        bullet("Controle dos fundadores retomado \u2014 incentivos alinhados"),
        bullet("20.000 PDVs \u00e9 uma distribui\u00e7\u00e3o substancial no Brasil"),
        bullet("Mercado plant-based brasileiro continua crescendo 20-40% ao ano"),
        bullet("Menor depend\u00eancia de capital externo reduz press\u00e3o"),
        bullet("Presen\u00e7a ativa no Instagram (375 mil seguidores) mostra engajamento cont\u00ednuo da marca"),

        subTitle("8.5 Fatores de Risco"),
        bullet("Mercado endere\u00e7\u00e1vel pequeno (R$200M) limita o teto de crescimento"),
        bullet("Domin\u00e2ncia da JBS/Seara (60%+ de share) com linha de produtos em expans\u00e3o"),
        bullet("Sem caminho divulgado para lucratividade"),
        bullet("Setor plant-based globalmente em baixa; apetite de investidores reduzido"),
        bullet("Transpar\u00eancia financeira limitada \u2014 empresa n\u00e3o divulga receita ou P&L"),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== FONTES =====
        sectionTitle("9. FONTES"),
        para("Todos os dados deste relat\u00f3rio foram compilados a partir de fontes publicamente dispon\u00edveis, incluindo:", { italics: true }),
        new Paragraph({ spacing: { after: 100 } }),

        para("Crunchbase, PitchBook, Tracxn, Owler (bases de dados de empresas e investimentos)", { bold: true }),
        para("TechCrunch, Food Dive, Fast Company, VegEconomist (imprensa setorial)"),
        para("Brazil Journal, InfoMoney, InvestNews, Valor Econ\u00f4mico, CNN Brasil (imprensa financeira brasileira)"),
        para("Investidor10 (dados do fundo BTG)"),
        para("Vegan Business, GFI Brasil (relat\u00f3rios da ind\u00fastria plant-based)"),
        para("LAVCA, Contxto (cobertura de VC/startups na Am\u00e9rica Latina)"),
        para("Grand View Research, IMARC Group (dimensionamento de mercado)"),
        para("fazendafuturo.io, futurefarm.io (sites da empresa)"),
        para("Instagram @fazendafuturo (m\u00eddias sociais)"),

        new Paragraph({ spacing: { before: 400 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: MED_BLUE, space: 8 } },
          spacing: { before: 200 },
          children: [new TextRun({ text: "Fim do Relat\u00f3rio \u2014 Fevereiro 2026", font: "Arial", size: 18, color: MED_GRAY, italics: true })]
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/intelligent-beautiful-feynman/mnt/Claude/Future-Farm/Fazenda-Futuro-Pesquisa-Profunda.docx", buffer);
  console.log("Relat\u00f3rio em PT-BR criado com sucesso!");
});
