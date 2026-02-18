const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, ExternalHyperlink,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopType, TabStopPosition
} = require("docx");

// Colors
const DARK_BLUE = "1B3A5C";
const MED_BLUE = "2E75B6";
const LIGHT_BLUE = "D5E8F0";
const DARK_GRAY = "333333";
const MED_GRAY = "666666";
const LIGHT_GRAY = "F2F2F2";
const GREEN = "2E7D32";
const RED = "C62828";
const ORANGE = "E65100";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

// Helper: header cell
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

// Helper: regular cell
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

// Helper: section title
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

function multiPara(runs) {
  return new Paragraph({
    spacing: { after: 120 },
    children: runs.map(r => new TextRun({ font: "Arial", size: 20, color: DARK_GRAY, ...r }))
  });
}

// KPI Box table
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
    // =================== COVER PAGE ===================
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
          children: [new TextRun({ text: "Deep Research Report", font: "Arial", size: 28, color: DARK_GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Company Intelligence & Financial Analysis", font: "Arial", size: 22, color: MED_GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 600, after: 100 },
          children: [new TextRun({ text: "February 2026", font: "Arial", size: 22, color: MED_GRAY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "CONFIDENTIAL", font: "Arial", size: 20, bold: true, color: RED })]
        }),
      ]
    },

    // =================== MAIN CONTENT ===================
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
              new TextRun({ text: "Fazenda Futuro \u2014 Deep Research Report", font: "Arial", size: 16, color: MED_GRAY }),
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
              new TextRun({ text: "Page ", font: "Arial", size: 16, color: MED_GRAY }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: MED_GRAY }),
            ]
          })]
        })
      },
      children: [
        // ===== EXECUTIVE SUMMARY =====
        sectionTitle("1. EXECUTIVE SUMMARY"),
        para("Fazenda Futuro (international brand: Future Farm) is Brazil's pioneering plant-based meat company, founded in 2019 by serial entrepreneurs Marcos Leta and Alfredo Strechinsky. After raising ~US$90M across three funding rounds and reaching a peak valuation of ~US$400M (R$2.2 billion) in 2021, the company underwent a major strategic pivot in 2024, retreating from aggressive international expansion to refocus on the Brazilian market."),
        para("This report compiles all publicly available data on the company's strategy, operations, financials, competitive position, and current status."),
        new Paragraph({ spacing: { before: 200, after: 200 } }),

        // KPI boxes
        kpiRow([
          { value: "~US$90M", label: "Total Funding Raised" },
          { value: "~US$400M", label: "Peak Valuation (2021)" },
          { value: "20,000", label: "Retail Points (Brazil)" },
          { value: "2019", label: "Year Founded" },
        ]),

        new Paragraph({ spacing: { after: 200 } }),

        // ===== COMPANY OVERVIEW =====
        sectionTitle("2. COMPANY OVERVIEW"),
        subTitle("2.1 Identity & Foundation"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [
              cell("Legal Name", 3120, { bold: true, shading: LIGHT_GRAY }),
              cell("Fazenda Futuro Produtos Aliment\u00edcios S.A.", 6240)
            ]}),
            new TableRow({ children: [
              cell("International Brand", 3120, { bold: true, shading: LIGHT_GRAY }),
              cell("Future Farm", 6240)
            ]}),
            new TableRow({ children: [
              cell("Founded", 3120, { bold: true, shading: LIGHT_GRAY }),
              cell("2019 (development began 2017)", 6240)
            ]}),
            new TableRow({ children: [
              cell("Founders", 3120, { bold: true, shading: LIGHT_GRAY }),
              cell("Marcos Leta (CEO) & Alfredo Strechinsky", 6240)
            ]}),
            new TableRow({ children: [
              cell("HQ", 3120, { bold: true, shading: LIGHT_GRAY }),
              cell("Rio de Janeiro, Brazil", 6240)
            ]}),
            new TableRow({ children: [
              cell("Factory", 3120, { bold: true, shading: LIGHT_GRAY }),
              cell("Volta Redonda, RJ (600-700 tons/month)", 6240)
            ]}),
            new TableRow({ children: [
              cell("Employees", 3120, { bold: true, shading: LIGHT_GRAY }),
              cell("~150-235 (reduced after 2024 restructuring)", 6240)
            ]}),
            new TableRow({ children: [
              cell("Website", 3120, { bold: true, shading: LIGHT_GRAY }),
              cell("fazendafuturo.io / futurefarm.io", 6240)
            ]}),
            new TableRow({ children: [
              cell("Instagram", 3120, { bold: true, shading: LIGHT_GRAY }),
              cell("@fazendafuturo (375K followers, 1,460 posts)", 6240)
            ]}),
          ]
        }),

        new Paragraph({ spacing: { after: 100 } }),

        subTitle("2.2 Founder Background"),
        para("Both founders previously created Do Bem, a premium natural juice company sold to AmBev (AB InBev subsidiary) in 2016. This entrepreneurial track record gave them both capital and consumer goods expertise to launch Fazenda Futuro."),
        para("US operations were led by Alexandre Ruberti (former President of Red Bull Distribution Company USA, 16 years at Red Bull), hired as CEO of Future Farm USA to spearhead North American entry."),

        subTitle("2.3 Mission & Positioning"),
        para("\"Mudando a forma como o mundo come\" (Changing the way the world eats). The company positions itself as a technology-driven food company using AI to develop plant-based meat alternatives that replicate taste, texture, and succulence of animal protein. All products are GMO-free and gluten-free."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== PRODUCT PORTFOLIO =====
        sectionTitle("3. PRODUCT PORTFOLIO"),
        subTitle("3.1 Current Product Line"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2340, 3510, 3510],
          rows: [
            new TableRow({ children: [hCell("Product", 2340), hCell("Details", 3510), hCell("Key Specs", 3510)] }),
            new TableRow({ children: [
              cell("Futuro Burger 4.0", 2340, { bold: true }),
              cell("Flagship. Launched 2024 with True Texture Technology. Available 115g & 230g.", 3510),
              cell("14g protein, 159 kcal, 4.7g carbs, 9.6g sat fat", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Carne Mo\u00edda", 2340, { bold: true }),
              cell("Plant-based ground meat for versatile cooking", 3510),
              cell("Soy + pea protein blend", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Alm\u00f4ndega", 2340, { bold: true }),
              cell("Plant-based meatballs", 3510),
              cell("Ready-to-cook format", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Chicken", 2340, { bold: true }),
              cell("Plant-based chicken strips", 3510),
              cell("Textured soy protein base", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Lingu\u00ed\u00e7a", 2340, { bold: true }),
              cell("Plant-based sausage", 3510),
              cell("Brazilian-style", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Tuna", 2340, { bold: true }),
              cell("Plant-based canned fish (launched 2021)", 3510),
              cell("Novel category for Brazil", 3510)
            ]}),
            new TableRow({ children: [
              cell("Futuro Aveia", 2340, { bold: true }),
              cell("Oat milk line: Original, Chocolate, Vanilla, Cooking. 1L packs.", 3510),
              cell("Launched 2024 at P\u00e3o de A\u00e7\u00facar, Carrefour", 3510)
            ]}),
          ]
        }),

        new Paragraph({ spacing: { after: 100 } }),

        subTitle("3.2 Technology Differentiator"),
        para("True Texture Technology: An AI-powered system described as an \"artificial tongue\" that captures and replicates flavor profiles. Uses textured soy protein, isolated soy protein, pea protein, coconut fat, and beets (for iron/color). The Futuro Burger 4.0 represents 4 years of iterative development on this platform."),

        subTitle("3.3 Pipeline"),
        para("Products in development include plant-based cheese, honey, and bacon alternatives, extending the portfolio beyond meat into adjacent plant-based categories."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== FUNDING & FINANCIALS =====
        sectionTitle("4. FUNDING & FINANCIALS"),
        subTitle("4.1 Funding History"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1400, 1200, 1560, 1800, 3400],
          rows: [
            new TableRow({ children: [
              hCell("Round", 1400), hCell("Date", 1200), hCell("Amount", 1560), hCell("Valuation", 1800), hCell("Lead Investors", 3400)
            ]}),
            new TableRow({ children: [
              cell("Series A", 1400, { bold: true }),
              cell("Jul 2019", 1200),
              cell("US$8.5M", 1560, { bold: true }),
              cell("US$100M", 1800),
              cell("Monashees, Go4it Capital", 3400)
            ]}),
            new TableRow({ children: [
              cell("Series B", 1400, { bold: true }),
              cell("Sep 2020", 1200),
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
              cell([new TextRun({ text: "Peak: US$400M", font: "Arial", size: 18, bold: true, color: "FFFFFF" })], 1800, { shading: DARK_BLUE }),
              cell([new TextRun({ text: "9+ institutional investors", font: "Arial", size: 18, color: "FFFFFF" })], 3400, { shading: DARK_BLUE }),
            ]}),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        subTitle("4.2 Key Investors"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2800, 2200, 4360],
          rows: [
            new TableRow({ children: [hCell("Investor", 2800), hCell("Type", 2200), hCell("Notes", 4360)] }),
            new TableRow({ children: [cell("BTG Pactual", 2800, { bold: true }), cell("Investment Bank", 2200), cell("Largest institutional investor. Exited mid-2024 with ~33% loss.", 4360)] }),
            new TableRow({ children: [cell("Monashees+", 2800, { bold: true }), cell("VC Fund", 2200), cell("Participated all rounds (A, B, C). Top-tier LATAM VC.", 4360)] }),
            new TableRow({ children: [cell("Go4it Capital", 2800, { bold: true }), cell("Family Office", 2200), cell("Marc Lemann & Cesar Villares. All rounds.", 4360)] }),
            new TableRow({ children: [cell("Rage Capital", 2800, { bold: true }), cell("European VC", 2200), cell("Series C co-lead. Airbnb investor track record.", 4360)] }),
            new TableRow({ children: [cell("XP Inc", 2800, { bold: true }), cell("Brazilian Fintech", 2200), cell("Series C participant.", 4360)] }),
            new TableRow({ children: [cell("ENFINI / PWR Capital", 2800, { bold: true }), cell("Investment Firm", 2200), cell("Series B participant.", 4360)] }),
            new TableRow({ children: [cell("Turim MFO", 2800, { bold: true }), cell("Family Office", 2200), cell("Series B/C participant.", 4360)] }),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        subTitle("4.3 Valuation Trajectory"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2340, 2340, 2340, 2340],
          rows: [
            new TableRow({ children: [hCell("Period", 2340), hCell("Valuation", 2340), hCell("Multiple vs Prior", 2340), hCell("Context", 2340)] }),
            new TableRow({ children: [cell("Jul 2019", 2340), cell("US$100M", 2340, { bold: true }), cell("Baseline", 2340), cell("Series A post-money", 2340)] }),
            new TableRow({ children: [cell("Sep 2020", 2340), cell("~US$130M", 2340, { bold: true }), cell("1.3x", 2340), cell("Pre-Series B investment", 2340)] }),
            new TableRow({ children: [cell("Nov 2021", 2340), cell([new TextRun({ text: "US$400M", font: "Arial", size: 18, bold: true, color: GREEN })], 2340), cell([new TextRun({ text: "4.0x from A", font: "Arial", size: 18, bold: true, color: GREEN })], 2340), cell("Peak \u2014 plant-based hype", 2340)] }),
            new TableRow({ children: [cell("Mid-2024", 2340), cell([new TextRun({ text: "Significantly lower", font: "Arial", size: 18, bold: true, color: RED })], 2340), cell([new TextRun({ text: "BTG exited -33%", font: "Arial", size: 18, color: RED })], 2340), cell("Sector downturn, pivot", 2340)] }),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        subTitle("4.4 Financial Metrics (Limited Public Data)"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 6240],
          rows: [
            new TableRow({ children: [hCell("Metric", 3120), hCell("Data Point", 6240)] }),
            new TableRow({ children: [cell("Revenue", 3120, { bold: true }), cell("Estimated US$5-25M annually (Owler); not officially disclosed", 6240)] }),
            new TableRow({ children: [cell("Gross Margin", 3120, { bold: true }), cell("44% (stated by CEO Marcos Leta)", 6240)] }),
            new TableRow({ children: [cell("EBITDA / Net Income", 3120, { bold: true }), cell("Not disclosed. Likely operating at a loss during expansion phase.", 6240)] }),
            new TableRow({ children: [cell("Addressable Market (BR)", 3120, { bold: true }), cell("R$200M annually (CEO estimate, 2024)", 6240)] }),
            new TableRow({ children: [cell("Production Capacity", 3120, { bold: true }), cell("600-700 tons/month (potential: 1,200-1,300 tons)", 6240)] }),
            new TableRow({ children: [cell("Distribution", 3120, { bold: true }), cell("20,000 retail points in Brazil (2024)", 6240)] }),
          ]
        }),

        new Paragraph({ spacing: { after: 100 } }),

        subTitle("4.5 BTG Pactual Exit (Aug 2024)"),
        para("BTG Pactual's BoostLAB Ventures fund sold its stake back to founders Marcos Leta and Alfredo Strechinsky. The FF Multistrat\u00e9gia fund recorded a 32.79% reduction in NAV from the Fazenda Futuro position. This signals the company's valuation dropped significantly from the R$2.2B peak. Founders regained full control with a smaller group of partners and two smaller funds."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== STRATEGY & PIVOT =====
        sectionTitle("5. STRATEGIC EVOLUTION"),
        subTitle("5.1 Phase 1: Explosive Growth (2019-2022)"),
        para("Initial strategy: rapid product expansion + aggressive international growth. Expanded from Brazil to 23-30 countries including US, UK, Germany, Chile, Colombia. Hired former Red Bull executive Alexandre Ruberti as US CEO. Target: 65% of sales from US market within 2 years."),

        subTitle("5.2 Phase 2: The Pivot (2023-2024)"),
        para("Reality check triggered by multiple factors:"),

        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Plant-based sector investment declined ~50% in 2024 globally", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Beyond Meat stock collapsed below US$1; Impossible Foods conducting layoffs", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Brazilian addressable market reassessed at only R$200M (vs implied billions at peak valuation)", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "International expansion burning cash without proportional returns", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [new TextRun({ text: "Founders bought out BTG Pactual at ~33% loss, regaining control", font: "Arial", size: 20 })] }),

        subTitle("5.3 Phase 3: Refocused Operations (2024+)"),
        para("New strategic pillars per CEO Marcos Leta:"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Brazil-first: refocused on 20,000 domestic retail points", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Flexitarians over vegans: targeting occasional plant-based consumers, not committed vegans", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "\"Less social media, more street presence\": grassroots consumer engagement", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Lean operations: smaller team, less external capital dependency", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [new TextRun({ text: "Product innovation: Futuro Burger 4.0, oat milk line, pipeline expansion", font: "Arial", size: 20 })] }),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== COMPETITIVE LANDSCAPE =====
        sectionTitle("6. COMPETITIVE LANDSCAPE"),
        subTitle("6.1 Brazil Plant-Based Market"),
        para("The Brazilian plant-based market reached R$1.1 billion in retail sales in 2023 (up 38% YoY). Plant-based meats alone projected at R$800M by 2025. Key drivers: health consciousness (especially Gen Z), sustainability concerns, and a growing flexitarian movement \u2014 26% of Brazilians consume plant-based meat at least once/month."),

        new Paragraph({ spacing: { after: 100 } }),

        subTitle("6.2 Competitive Matrix"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1800, 1400, 1600, 2000, 2560],
          rows: [
            new TableRow({ children: [
              hCell("Company", 1800), hCell("Type", 1400), hCell("Market Share", 1600), hCell("Key Products", 2000), hCell("Status", 2560)
            ]}),
            new TableRow({ children: [
              cell("Seara Incr\u00edvel (JBS)", 1800, { bold: true }),
              cell("Meat Giant", 1400),
              cell([new TextRun({ text: "60%+", font: "Arial", size: 18, bold: true, color: GREEN })], 1600),
              cell("Steak, ground meat, chicken", 2000),
              cell("Market leader. Massive distribution.", 2560)
            ]}),
            new TableRow({ children: [
              cell("Fazenda Futuro", 1800, { bold: true }),
              cell("Startup", 1400),
              cell("~15-20% est.", 1600),
              cell("Burger, ground, sausage, milk", 2000),
              cell("Pioneer. Refocusing on Brazil.", 2560)
            ]}),
            new TableRow({ children: [
              cell("PlantPlus (Marfrig+ADM)", 1800, { bold: true }),
              cell("JV", 1400),
              cell("Growing", 1600),
              cell("Burgers", 2000),
              cell("Leveraging Marfrig distribution.", 2560)
            ]}),
            new TableRow({ children: [
              cell("NotCo", 1800, { bold: true }),
              cell("Startup", 1400),
              cell("Niche", 1600),
              cell("Multi-category", 2000),
              cell("Chilean. Regional expansion.", 2560)
            ]}),
            new TableRow({ children: [
              cell("Beyond Meat", 1800, { bold: true }),
              cell("US Public Co", 1400),
              cell("Declining", 1600),
              cell("Burger, sausage", 2000),
              cell([new TextRun({ text: "Stock <$1. Survival mode.", font: "Arial", size: 18, color: RED })], 2560)
            ]}),
            new TableRow({ children: [
              cell("Sadia Veg&Tal (BRF)", 1800, { bold: true }),
              cell("Meat Giant", 1400),
              cell("Retreated", 1600),
              cell("Vegetal line", 2000),
              cell("BRF abandoned plant-based 2023.", 2560)
            ]}),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        subTitle("6.3 Global Industry Context (2025)"),
        para("The global plant-based industry experienced a sharp correction after 2022's peak hype. Beyond Meat rebranded to \"Beyond\" and pivoted to protein drinks; stock collapsed. Impossible Foods pursuing European expansion but profitability remains distant. Private investment in plant-based sector declined ~50% in 2024. However, Brazil's domestic market shows resilience with 20-40% annual growth, driven by currency advantages for local producers and strong consumer adoption."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== TIMELINE =====
        sectionTitle("7. KEY TIMELINE"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1400, 7960],
          rows: [
            new TableRow({ children: [hCell("Year", 1400), hCell("Event", 7960)] }),
            new TableRow({ children: [cell("2009", 1400, { bold: true }), cell("Marcos Leta & Alfredo Strechinsky found Do Bem juice company", 7960)] }),
            new TableRow({ children: [cell("2016", 1400, { bold: true }), cell("Do Bem sold to AmBev (AB InBev subsidiary)", 7960)] }),
            new TableRow({ children: [cell("2017", 1400, { bold: true }), cell("Founders begin studying Brazilian food market; Fazenda Futuro R&D starts", 7960)] }),
            new TableRow({ children: [cell("2019", 1400, { bold: true }), cell("Official launch with Futuro Burger. Series A: US$8.5M at US$100M valuation.", 7960)] }),
            new TableRow({ children: [cell("2020", 1400, { bold: true }), cell("Series B: US$21-25M. Sausage launch. Fast Company World Changing Ideas Award.", 7960)] }),
            new TableRow({ children: [cell("2021", 1400, { bold: true }), cell("Series C: US$58M at US$400M valuation. Tuna & oat milk launches. US market entry.", 7960)] }),
            new TableRow({ children: [cell("2022", 1400, { bold: true }), cell("Expands to 23-30 countries, 10,000+ retail points. Peak international presence.", 7960)] }),
            new TableRow({ children: [cell("2023", 1400, { bold: true }), cell("Plant-based sector downturn begins. Company starts reassessing strategy.", 7960)] }),
            new TableRow({ children: [cell("2024", 1400, { bold: true, color: RED }), cell([new TextRun({ text: "PIVOT: Founders buy out BTG Pactual (-33% loss). Return to Brazil focus. Lean operations. Futuro Burger 4.0 & oat milk launches. 20,000 domestic retail points.", font: "Arial", size: 18, color: DARK_GRAY })], 7960)] }),
            new TableRow({ children: [cell("2025+", 1400, { bold: true }), cell("Continued Brazil-first strategy. Product innovation. Profitability-focused model.", 7960)] }),
          ]
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== CRITICAL ANALYSIS =====
        sectionTitle("8. CRITICAL ANALYSIS"),

        subTitle("8.1 Valuation vs Market Reality"),
        para("The most striking data point is the disconnect between peak valuation (R$2.2B / ~US$400M) and the CEO's own 2024 assessment of the Brazilian addressable market at only R$200M annually. This implies the company was valued at ~11x the entire addressable market \u2014 a significant overvaluation driven by sector euphoria rather than fundamentals."),

        subTitle("8.2 Capital Efficiency"),
        para("With ~US$90M raised and the company pivoting to \"lean operations,\" capital efficiency during the expansion phase appears poor. The Series C alone (US$58M, 64% of total funding) was raised at peak hype and likely deployed with low ROI on international expansion that was subsequently abandoned."),

        subTitle("8.3 Competitive Threat"),
        para("The entry of JBS (via Seara Incr\u00edvel) with 60%+ market share is the dominant competitive threat. JBS brings massive distribution, manufacturing scale, and brand recognition that a startup cannot match. Fazenda Futuro's innovation advantage is real but may be insufficient against this scale disadvantage."),

        subTitle("8.4 Positive Signals"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "44% gross margin is healthy for a food company", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Founder-led control regained \u2014 aligned incentives", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "20,000 retail points is substantial distribution in Brazil", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Brazil's plant-based market continues to grow 20-40% annually", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Less external capital dependency reduces pressure", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [new TextRun({ text: "Active Instagram presence (375K followers) shows continued brand engagement", font: "Arial", size: 20 })] }),

        subTitle("8.5 Risk Factors"),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Small addressable market (R$200M) limits growth ceiling", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "JBS/Seara dominance (60%+ share) with expanding product line", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "No disclosed path to profitability", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "Plant-based sector globally in downturn; investor appetite reduced", font: "Arial", size: 20 })] }),
        new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [new TextRun({ text: "Limited financial transparency \u2014 company does not disclose revenue or P&L", font: "Arial", size: 20 })] }),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== SOURCES =====
        sectionTitle("9. SOURCES"),
        para("All data in this report was compiled from publicly available sources including:", { italics: true }),
        new Paragraph({ spacing: { after: 100 } }),

        para("Crunchbase, PitchBook, Tracxn, Owler (company/funding databases)", { bold: true }),
        para("TechCrunch, Food Dive, Fast Company, VegEconomist (industry press)"),
        para("Brazil Journal, InfoMoney, InvestNews, Valor Econ\u00f4mico, CNN Brasil (Brazilian financial press)"),
        para("Investidor10 (BTG fund data)"),
        para("Vegan Business, GFI Brasil (plant-based industry reports)"),
        para("LAVCA, Contxto (LATAM VC/startup coverage)"),
        para("Grand View Research, IMARC Group (market sizing)"),
        para("fazendafuturo.io, futurefarm.io (company websites)"),
        para("Instagram @fazendafuturo (social media)"),

        new Paragraph({ spacing: { before: 400 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: MED_BLUE, space: 8 } },
          spacing: { before: 200 },
          children: [new TextRun({ text: "End of Report \u2014 February 2026", font: "Arial", size: 18, color: MED_GRAY, italics: true })]
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/intelligent-beautiful-feynman/mnt/Claude/Future-Farm/Fazenda-Futuro-Deep-Research.docx", buffer);
  console.log("Report created successfully!");
});
