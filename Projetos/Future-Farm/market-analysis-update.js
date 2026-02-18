const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageNumber, PageBreak, TabStopType, TabStopPosition
} = require("docx");

const DB = "1B3A5C", MB = "2E75B6", LB = "D5E8F0", DG = "333333", MG = "666666", LG = "F2F2F2", GR = "2E7D32", RD = "C62828", OR = "E65100", YL = "F9A825";

const bd = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const bds = { top: bd, bottom: bd, left: bd, right: bd };
const nb = { style: BorderStyle.NONE, size: 0 };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };

function hC(t, w) {
  return new TableCell({ borders: bds, width: { size: w, type: WidthType.DXA }, shading: { fill: DB, type: ShadingType.CLEAR }, margins: cm, verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, font: "Arial", size: 18, color: "FFFFFF" })] })] });
}
function c(t, w, o = {}) {
  const r = Array.isArray(t) ? t : [new TextRun({ text: t, font: "Arial", size: 18, color: o.color || DG, bold: o.bold || false })];
  return new TableCell({ borders: bds, width: { size: w, type: WidthType.DXA }, shading: o.sh ? { fill: o.sh, type: ShadingType.CLEAR } : undefined, margins: cm, verticalAlign: "center",
    children: [new Paragraph({ alignment: o.al || AlignmentType.LEFT, children: r })] });
}
function s1(t) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: t, font: "Arial", size: 28, bold: true, color: DB })] }); }
function s2(t) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text: t, font: "Arial", size: 24, bold: true, color: MB })] }); }
function p(t, o = {}) { return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: t, font: "Arial", size: 20, color: o.color || DG, bold: o.bold || false, italics: o.it || false })] }); }
function mp(runs) { return new Paragraph({ spacing: { after: 120 }, children: runs.map(r => new TextRun({ font: "Arial", size: 20, color: DG, ...r })) }); }
function bl(t) { return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: t, font: "Arial", size: 20, color: DG })] }); }

function alertBox(text, color) {
  const colW = 9360;
  return new Table({
    width: { size: colW, type: WidthType.DXA },
    columnWidths: [colW],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: { style: BorderStyle.SINGLE, size: 4, color }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }, left: { style: BorderStyle.SINGLE, size: 4, color }, right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
      width: { size: colW, type: WidthType.DXA },
      shading: { fill: "FFF8E1", type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [new Paragraph({ children: [new TextRun({ text, font: "Arial", size: 20, color: DG, bold: true })] })]
    })] })]
  });
}

function kpiRow(items) {
  const colW = Math.floor(9360 / items.length);
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: items.map(() => colW),
    rows: [new TableRow({ children: items.map(item => new TableCell({
      borders: { top: { style: BorderStyle.SINGLE, size: 3, color: item.bc || MB }, bottom: nb, left: nb, right: nb },
      width: { size: colW, type: WidthType.DXA },
      shading: { fill: item.bg || LB, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 100, right: 100 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.value, font: "Arial", size: 26, bold: true, color: item.vc || DB })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 30 }, children: [new TextRun({ text: item.label, font: "Arial", size: 15, color: MG })] })
      ]
    })) })]
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Arial", color: DB }, paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial", color: MB }, paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
    ]
  },
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  sections: [
    // CAPA
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        new Paragraph({ spacing: { before: 2400 } }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "FAZENDA FUTURO", font: "Arial", size: 52, bold: true, color: DB })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Atualiza\u00e7\u00e3o de Pesquisa", font: "Arial", size: 28, color: MB })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: MB, space: 1 } }, spacing: { after: 400 }, children: [] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "An\u00e1lise de Mercado, Market Share & Valida\u00e7\u00e3o de Dados", font: "Arial", size: 24, color: DG })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Mercado Plant-Based: Brasil, EUA, Europa e China", font: "Arial", size: 22, color: MG })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 500, after: 80 }, children: [new TextRun({ text: "Fevereiro 2026", font: "Arial", size: 22, color: MG })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CONFIDENCIAL", font: "Arial", size: 20, bold: true, color: RD })] }),
      ]
    },
    // CONTE\u00daDO
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: MB, space: 4 } }, children: [new TextRun({ text: "Fazenda Futuro \u2014 Atualiza\u00e7\u00e3o de Mercado & Valida\u00e7\u00e3o", font: "Arial", size: 16, color: MG })], tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC", space: 4 } }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P\u00e1gina ", font: "Arial", size: 16, color: MG }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: MG })] })] }) },
      children: [

        // ===== QUEST\u00c3O CENTRAL =====
        s1("QUEST\u00c3O CENTRAL: RECONCILIA\u00c7\u00c3O DOS DADOS"),
        p("Duas afirma\u00e7\u00f5es foram feitas sobre a Fazenda Futuro que precisam ser validadas:"),
        new Paragraph({ spacing: { after: 150 } }),

        alertBox("\u26a0\ufe0f AFIRMA\u00c7\u00c3O 1: \"A Fazenda Futuro faturou R$38M no \u00faltimo ano\"", OR),
        new Paragraph({ spacing: { after: 100 } }),
        alertBox("\u26a0\ufe0f AFIRMA\u00c7\u00c3O 2: \"A Fazenda Futuro tem 70% de market share\"", OR),
        new Paragraph({ spacing: { after: 200 } }),

        p("O PROBLEMA MATEM\u00c1TICO:", { bold: true }),
        mp([
          { text: "Se o faturamento \u00e9 R$38M e o market share \u00e9 70%, ent\u00e3o o mercado total seria apenas ", bold: false },
          { text: "~R$54M", bold: true, color: RD },
          { text: ". Mas dados do GFI/Euromonitor mostram o mercado de carnes plant-based em ", bold: false },
          { text: "R$1,1 bilh\u00e3o (2023)", bold: true, color: GR },
          { text: ". A diferen\u00e7a de 20x indica que estamos medindo coisas diferentes.", bold: false },
        ]),

        new Paragraph({ spacing: { after: 150 } }),

        // ===== O QUE DESCOBRIMOS =====
        s1("1. VALIDA\u00c7\u00c3O DAS AFIRMA\u00c7\u00d5ES"),

        s2("1.1 Faturamento R$38M"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2340, 3510, 3510],
          rows: [
            new TableRow({ children: [hC("Fonte", 2340), hC("Dado", 3510), hC("Observa\u00e7\u00e3o", 3510)] }),
            new TableRow({ children: [c("Growjo", 2340, { bold: true }), c("US$41,1M/ano", 3510), c("Estimativa baseada em sinais de mercado", 3510)] }),
            new TableRow({ children: [c("Owler", 2340, { bold: true }), c("US$5-25M/ano", 3510), c("Range amplo, menos preciso", 3510)] }),
            new TableRow({ children: [c("CEO Marcos Leta", 2340, { bold: true }), c("N\u00e3o divulga receita", 3510), c("\"N\u00e3o divulgamos por raz\u00f5es estrat\u00e9gicas\"", 3510)] }),
          ]
        }),
        new Paragraph({ spacing: { after: 100 } }),
        mp([
          { text: "VEREDICTO: ", bold: true, color: OR },
          { text: "PLAUS\u00cdVEL. ", bold: true },
          { text: "O Growjo estima ~US$41M (~R$205M ao c\u00e2mbio atual, ou ~R$38M se medido quando o d\u00f3lar era mais baixo). A empresa n\u00e3o confirma oficialmente. R$38M \u00e9 compat\u00edvel com uma opera\u00e7\u00e3o de 600-700 ton/m\u00eas vendendo a pre\u00e7os de varejo.", bold: false },
        ]),

        new Paragraph({ spacing: { after: 200 } }),

        s2("1.2 Market Share de 70%"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2340, 2340, 2340, 2340],
          rows: [
            new TableRow({ children: [hC("Fonte", 2340), hC("Fazenda Futuro", 2340), hC("Seara Incr\u00edvel", 2340), hC("Outros", 2340)] }),
            new TableRow({ children: [
              c("Nielsen (geral)", 2340, { bold: true }),
              c([new TextRun({ text: "6,2%", font: "Arial", size: 18, bold: true, color: RD })], 2340),
              c([new TextRun({ text: "60,7%", font: "Arial", size: 18, bold: true, color: GR })], 2340),
              c("33,1%", 2340)
            ]}),
            new TableRow({ children: [
              c("LinkedIn FF (geral)", 2340, { bold: true }),
              c([new TextRun({ text: "53,6%", font: "Arial", size: 18, bold: true, color: OR })], 2340),
              c("N/I", 2340),
              c("N/I", 2340)
            ]}),
            new TableRow({ children: [
              c("LinkedIn FF (burgers)", 2340, { bold: true }),
              c([new TextRun({ text: "74,8%", font: "Arial", size: 18, bold: true, color: OR })], 2340),
              c("N/I", 2340),
              c("N/I", 2340)
            ]}),
          ]
        }),
        new Paragraph({ spacing: { after: 100 } }),

        alertBox("\u274c CONTRADI\u00c7\u00c3O CR\u00cdTICA: Nielsen mostra 6,2% para a FF, enquanto a pr\u00f3pria empresa afirma 53-75%. A Seara Incr\u00edvel lidera com 60,7% segundo Nielsen.", RD),
        new Paragraph({ spacing: { after: 100 } }),

        mp([
          { text: "VEREDICTO: ", bold: true, color: RD },
          { text: "PROVAVELMENTE FALSO no mercado total. ", bold: true },
          { text: "A Nielsen, fonte independente mais confi\u00e1vel, mostra a FF com apenas 6,2% do mercado plant-based total, onde a Seara Incr\u00edvel domina com 60,7%. O claim de 70-75% pode ser verdadeiro APENAS para o segmento espec\u00edfico de hamb\u00fargueres plant-based congelados (um sub-segmento muito menor do mercado total).", bold: false },
        ]),

        new Paragraph({ spacing: { after: 200 } }),

        s2("1.3 A Reconcilia\u00e7\u00e3o dos N\u00fameros"),
        p("Os dados s\u00f3 fazem sentido quando entendemos as diferentes defini\u00e7\u00f5es de \"mercado\":"),
        new Paragraph({ spacing: { after: 100 } }),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3200, 1800, 1800, 2560],
          rows: [
            new TableRow({ children: [hC("Defini\u00e7\u00e3o de Mercado", 3200), hC("Tamanho", 1800), hC("FF Share", 1800), hC("L\u00f3gica", 2560)] }),
            new TableRow({ children: [
              c("Todo alimento plant-based (carne + leite + queijo)", 3200),
              c("~R$1,8B", 1800, { bold: true }),
              c("~2%", 1800),
              c("Muito amplo para a FF", 2560)
            ]}),
            new TableRow({ children: [
              c("Carnes + frutos do mar plant-based (total)", 3200),
              c([new TextRun({ text: "R$1,1B", font: "Arial", size: 18, bold: true, color: GR })], 1800),
              c([new TextRun({ text: "~3-6%", font: "Arial", size: 18, bold: true })], 1800),
              c("Inclui Seara (60%+ share)", 2560)
            ]}),
            new TableRow({ children: [
              c("Mercado endere\u00e7\u00e1vel (estimativa CEO)", 3200),
              c("R$200M", 1800, { bold: true }),
              c("~19%", 1800),
              c("Provavelmente exclui Seara", 2560)
            ]}),
            new TableRow({ children: [
              c([new TextRun({ text: "Hamb\u00fargueres plant-based congelados (sub-segmento)", font: "Arial", size: 18, bold: true })], 3200),
              c([new TextRun({ text: "~R$50-80M", font: "Arial", size: 18, bold: true, color: OR })], 1800),
              c([new TextRun({ text: "~50-75%", font: "Arial", size: 18, bold: true, color: OR })], 1800),
              c([new TextRun({ text: "\u2190 Aqui faz sentido", font: "Arial", size: 18, bold: true, color: OR })], 2560)
            ]}),
          ]
        }),

        new Paragraph({ spacing: { after: 150 } }),

        mp([
          { text: "CONCLUS\u00c3O: ", bold: true },
          { text: "O claim de 70% provavelmente se refere ao sub-segmento de hamb\u00fargueres plant-based congelados, onde a FF \u00e9 de fato dominante. No mercado plant-based TOTAL (R$1,1B), a FF tem apenas ~3-6% e a Seara Incr\u00edvel lidera com 60%+. A sua intui\u00e7\u00e3o est\u00e1 correta: o mercado N\u00c3O \u00e9 t\u00e3o pequeno e a FF N\u00c3O tem tanto share assim no mercado amplo.", bold: false },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== TAMANHO DO MERCADO GLOBAL =====
        s1("2. TAMANHO DO MERCADO PLANT-BASED POR REGI\u00c3O"),

        s2("2.1 Vis\u00e3o Geral Comparativa"),

        kpiRow([
          { value: "R$1,1B", label: "Brasil (carne PB)", bc: GR, bg: "E8F5E9", vc: GR },
          { value: "US$8,1B", label: "EUA (total PB)", bc: MB, bg: LB, vc: DB },
          { value: "\u20ac4,7B", label: "Europa-6 (total PB)", bc: MB, bg: LB, vc: DB },
          { value: "US$6-9B", label: "China (total PB est.)", bc: OR, bg: "FFF3E0", vc: OR },
        ]),
        new Paragraph({ spacing: { after: 200 } }),

        s2("2.2 Brasil \u2014 Mercado Detalhado"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3500, 1800, 1400, 2660],
          rows: [
            new TableRow({ children: [hC("Segmento", 3500), hC("Tamanho 2023", 1800), hC("Crescimento", 1400), hC("Fonte", 2660)] }),
            new TableRow({ children: [
              c([new TextRun({ text: "Carne + frutos do mar plant-based", font: "Arial", size: 18, bold: true })], 3500),
              c([new TextRun({ text: "R$1,1 bilh\u00e3o", font: "Arial", size: 18, bold: true, color: GR })], 1800),
              c("+38% a/a", 1400),
              c("Euromonitor / GFI Brasil", 2660)
            ]}),
            new TableRow({ children: [
              c("Leite plant-based", 3500, { bold: true }),
              c("R$673 milh\u00f5es", 1800, { bold: true }),
              c("+9,5% a/a", 1400),
              c("Euromonitor / GFI Brasil", 2660)
            ]}),
            new TableRow({ children: [
              c("Alternativas l\u00e1cteas total (leite+queijo+iogurte)", 3500),
              c("~US$998M", 1800),
              c("N/A", 1400),
              c("Grand View Research", 2660)
            ]}),
            new TableRow({ children: [
              c([new TextRun({ text: "TOTAL (carne + leite)", font: "Arial", size: 18, bold: true, color: "FFFFFF" })], 3500, { sh: DB }),
              c([new TextRun({ text: "~R$1,77B", font: "Arial", size: 18, bold: true, color: "FFFFFF" })], 1800, { sh: DB }),
              c([new TextRun({ text: "", font: "Arial", size: 18, color: "FFFFFF" })], 1400, { sh: DB }),
              c([new TextRun({ text: "Calculado", font: "Arial", size: 18, color: "FFFFFF" })], 2660, { sh: DB }),
            ]}),
          ]
        }),
        new Paragraph({ spacing: { after: 100 } }),

        p("Dados de consumidor (GFI Brasil 2024):", { bold: true }),
        bl("26% dos brasileiros consomem carne plant-based pelo menos 1x/m\u00eas"),
        bl("48% usam alternativas plant-based ao leite"),
        bl("21% se identificam como flexitarianos"),
        bl("5% se identificam como veganos/vegetarianos"),
        bl("Proje\u00e7\u00e3o: mercado de carne PB deve chegar a R$2,2B at\u00e9 2026"),

        new Paragraph({ spacing: { after: 200 } }),

        s2("2.3 Estados Unidos \u2014 Mercado Detalhado"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3500, 1800, 1400, 2660],
          rows: [
            new TableRow({ children: [hC("Segmento", 3500), hC("Tamanho 2024", 1800), hC("Crescimento", 1400), hC("Fonte", 2660)] }),
            new TableRow({ children: [
              c([new TextRun({ text: "Total alimentos plant-based", font: "Arial", size: 18, bold: true })], 3500),
              c([new TextRun({ text: "US$8,1 bilh\u00f5es", font: "Arial", size: 18, bold: true, color: GR })], 1800),
              c([new TextRun({ text: "-4%", font: "Arial", size: 18, bold: true, color: RD })], 1400),
              c("SPINS / GFI", 2660)
            ]}),
            new TableRow({ children: [c("Carne + frutos do mar PB (varejo)", 3500), c("US$1,2B", 1800, { bold: true }), c([new TextRun({ text: "-7%", font: "Arial", size: 18, color: RD })], 1400), c("SPINS", 2660)] }),
            new TableRow({ children: [c("Carne PB (varejo + foodservice)", 3500), c("US$3,2-3,4B", 1800, { bold: true }), c("N/A", 1400), c("IMARC / Grand View", 2660)] }),
            new TableRow({ children: [c("Leite plant-based", 3500), c("US$2,8B", 1800, { bold: true }), c([new TextRun({ text: "-5%", font: "Arial", size: 18, color: RD })], 1400), c("SPINS", 2660)] }),
            new TableRow({ children: [c("Alternativas l\u00e1cteas total", 3500), c("US$7,27B", 1800, { bold: true }), c("+12% CAGR", 1400), c("Grand View Research", 2660)] }),
          ]
        }),
        new Paragraph({ spacing: { after: 100 } }),
        p("O mercado americano est\u00e1 em contrac\u00e3o no varejo (-4% em 2024). Penetra\u00e7\u00e3o domiciliar caiu de 63% (2022) para 59% (2024). Beyond Meat com receita -18% no Q1 2024. Contudo, foodservice segue crescendo.", { it: true }),

        new Paragraph({ spacing: { after: 200 } }),

        s2("2.4 Europa (6 pa\u00edses principais) \u2014 Mercado Detalhado"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3500, 1800, 1400, 2660],
          rows: [
            new TableRow({ children: [hC("Segmento", 3500), hC("Tamanho 2024", 1800), hC("Crescimento", 1400), hC("Fonte", 2660)] }),
            new TableRow({ children: [
              c([new TextRun({ text: "Total plant-based (6 pa\u00edses)", font: "Arial", size: 18, bold: true })], 3500),
              c([new TextRun({ text: "\u20ac4,7 bilh\u00f5es", font: "Arial", size: 18, bold: true, color: GR })], 1800),
              c("+1,7% valor", 1400),
              c("GFI Europa / Circana", 2660)
            ]}),
            new TableRow({ children: [c("Carne plant-based", 3500), c("\u20ac1,56-3,17B", 1800, { bold: true }), c("+16-19% CAGR", 1400), c("M\u00faltiplas fontes", 2660)] }),
            new TableRow({ children: [c("Leite plant-based", 3500), c("US$4,54B", 1800, { bold: true }), c("+7,1% CAGR", 1400), c("Persistence MR", 2660)] }),
          ]
        }),
        new Paragraph({ spacing: { after: 80 } }),

        p("Detalhe por pa\u00eds:", { bold: true }),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [1872, 1872, 1872, 1872, 1872],
          rows: [
            new TableRow({ children: [hC("Pa\u00eds", 1872), hC("Vendas PB", 1872), hC("Crescimento", 1872), hC("Per capita/ano", 1872), hC("Penetra\u00e7\u00e3o carne", 1872)] }),
            new TableRow({ children: [c("Alemanha", 1872, { bold: true }), c("\u20ac1,68B", 1872), c("+1,5% val / +7% vol", 1872), c("\u20ac19,92", 1872), c("32%", 1872)] }),
            new TableRow({ children: [c("It\u00e1lia", 1872, { bold: true }), c("\u20ac639M", 1872), c("Crescendo", 1872), c("N/A", 1872), c("N/A", 1872)] }),
            new TableRow({ children: [c("Fran\u00e7a", 1872, { bold: true }), c("\u20ac537M", 1872), c("+8,8%", 1872), c("N/A", 1872), c("N/A", 1872)] }),
            new TableRow({ children: [c("Holanda", 1872, { bold: true }), c("\u20ac288M", 1872), c([new TextRun({ text: "-5,9%", font: "Arial", size: 18, color: RD })], 1872), c("\u20ac15,78", 1872), c("N/A", 1872)] }),
            new TableRow({ children: [c("Reino Unido", 1872, { bold: true }), c("N/A", 1872), c([new TextRun({ text: "-3% val / -9% vol", font: "Arial", size: 18, color: RD })], 1872), c("N/A", 1872), c("33%", 1872)] }),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        s2("2.5 China \u2014 Mercado Detalhado"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3500, 1800, 1400, 2660],
          rows: [
            new TableRow({ children: [hC("Segmento", 3500), hC("Tamanho 2024-25", 1800), hC("Crescimento", 1400), hC("Fonte", 2660)] }),
            new TableRow({ children: [c("Substitutos de carne", 3500), c("US$1,44-2,71B", 1800, { bold: true }), c("+5-17% CAGR", 1400), c("Statista / IMARC", 2660)] }),
            new TableRow({ children: [c("Leite plant-based", 3500), c("US$3,45B", 1800, { bold: true }), c("+8,4% CAGR", 1400), c("Grand View Research", 2660)] }),
            new TableRow({ children: [c("Alternativas l\u00e1cteas total", 3500), c("US$6,0B", 1800, { bold: true }), c("+13,8% CAGR", 1400), c("Archive MR", 2660)] }),
          ]
        }),
        new Paragraph({ spacing: { after: 100 } }),
        p("China \u00e9 o mercado de maior crescimento. Previs\u00e3o de ter >50% do mercado global de substitutos de carne at\u00e9 2025. Principais players: OmniFoods (OmniPork), Zhenmeat. Meta governamental de redu\u00e7\u00e3o de 50% no consumo de carne at\u00e9 2030."),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== TABELA COMPARATIVA GLOBAL =====
        s1("3. QUADRO COMPARATIVO GLOBAL"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [2200, 1800, 1800, 1800, 1760],
          rows: [
            new TableRow({ children: [hC("M\u00e9trica", 2200), hC("Brasil", 1800), hC("EUA", 1800), hC("Europa-6", 1800), hC("China", 1760)] }),
            new TableRow({ children: [
              c("Carne plant-based", 2200, { bold: true }),
              c("R$1,1B", 1800, { bold: true }),
              c("US$1,2-3,4B", 1800, { bold: true }),
              c("\u20ac1,56-3,17B", 1800, { bold: true }),
              c("US$1,44-2,71B", 1760, { bold: true })
            ]}),
            new TableRow({ children: [c("Total plant-based", 2200, { bold: true }), c("~R$1,77B", 1800), c("US$8,1B", 1800), c("\u20ac4,7B", 1800), c("US$6-9B est.", 1760)] }),
            new TableRow({ children: [c("Crescimento geral", 2200, { bold: true }),
              c([new TextRun({ text: "+38% a/a", font: "Arial", size: 18, bold: true, color: GR })], 1800),
              c([new TextRun({ text: "-4%", font: "Arial", size: 18, bold: true, color: RD })], 1800),
              c("+1,7%", 1800),
              c([new TextRun({ text: "+5-17%", font: "Arial", size: 18, bold: true, color: GR })], 1760)
            ]}),
            new TableRow({ children: [c("Est\u00e1gio do mercado", 2200, { bold: true }), c("Alto crescimento", 1800), c([new TextRun({ text: "Maduro/Retra\u00e7\u00e3o", font: "Arial", size: 18, color: RD })], 1800), c("Est\u00e1vel", 1800), c("Emergente", 1760)] }),
            new TableRow({ children: [c("Penetra\u00e7\u00e3o carne PB", 2200, { bold: true }), c("26% 1x/m\u00eas", 1800), c("59% domiciliar", 1800), c("32-37%", 1800), c("Baixa, crescendo", 1760)] }),
            new TableRow({ children: [c("L\u00edder de mercado", 2200, { bold: true }), c("Seara (JBS)", 1800), c("Beyond Meat", 1800), c("Diversificado", 1800), c("OmniFoods", 1760)] }),
          ]
        }),

        new Paragraph({ spacing: { after: 200 } }),

        alertBox("\ud83d\udca1 INSIGHT: O Brasil \u00e9 o mercado de MAIOR CRESCIMENTO entre as 4 regi\u00f5es (+38% a/a). O mercado americano est\u00e1 em retra\u00e7\u00e3o. Isso valida a estrat\u00e9gia da FF de refocar no Brasil.", GR),

        new Paragraph({ children: [new PageBreak()] }),

        // ===== NOSSAS CONCLUS\u00d5ES =====
        s1("4. CONCLUS\u00d5ES & POSI\u00c7\u00c3O RECOMENDADA"),

        s2("4.1 Sobre o Mercado Brasileiro"),
        bl("O mercado N\u00c3O \u00e9 t\u00e3o pequeno quanto o claim de R$54M sugere"),
        bl("Carne plant-based total no Brasil = R$1,1 bilh\u00e3o (2023), crescendo +38% a/a"),
        bl("O CEO estimou R$200M como \"mercado endere\u00e7\u00e1vel\" \u2014 provavelmente referindo-se ao segmento espec\u00edfico onde compete (excluindo Seara/JBS)"),
        bl("Importante distinguir: R$1,1B (mercado total) vs R$200M (endere\u00e7\u00e1vel da FF) vs R$50-80M (sub-segmento de burgers)"),

        new Paragraph({ spacing: { after: 150 } }),

        s2("4.2 Sobre o Market Share da Fazenda Futuro"),
        bl("70% NEM DE PERTO no mercado total \u2014 Nielsen mostra 6,2% (Seara lidera com 60,7%)"),
        bl("70-75% \u00e9 poss\u00edvel APENAS no sub-segmento de hamb\u00fargueres plant-based congelados"),
        bl("A pr\u00f3pria FF afirma 74,8% em burgers vs 53,6% no mercado geral (dados do LinkedIn da empresa)"),
        bl("Concluimos: a afirma\u00e7\u00e3o de 70% \u00e9 uma leitura seletiva de um sub-segmento favor\u00e1vel"),

        new Paragraph({ spacing: { after: 150 } }),

        s2("4.3 Sobre o Faturamento"),
        bl("R$38M \u00e9 plaus\u00edvel (Growjo estima ~US$41M)"),
        bl("Compat\u00edvel com opera\u00e7\u00e3o de 600-700 ton/m\u00eas a pre\u00e7os de varejo"),
        bl("Empresa n\u00e3o confirma oficialmente, mas n\u00e3o contradiz esta ordem de grandeza"),

        new Paragraph({ spacing: { after: 150 } }),

        s2("4.4 Como Apresentar Esses Dados"),
        p("Recomendamos usar as seguintes formula\u00e7\u00f5es nos materiais:", { bold: true }),
        new Paragraph({ spacing: { after: 100 } }),

        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            new TableRow({ children: [hC("\u274c Evitar", 4680), hC("\u2705 Usar", 4680)] }),
            new TableRow({ children: [
              c("\"O mercado plant-based \u00e9 de R$54M\"", 4680, { color: RD }),
              c("\"O mercado de carne plant-based no Brasil atingiu R$1,1B em 2023 (+38% a/a)\"", 4680, { color: GR })
            ]}),
            new TableRow({ children: [
              c("\"FF tem 70% do mercado plant-based\"", 4680, { color: RD }),
              c("\"FF lidera o segmento de hamb\u00fargueres plant-based com ~75% de share\"", 4680, { color: GR })
            ]}),
            new TableRow({ children: [
              c("\"O mercado \u00e9 pequeno\"", 4680, { color: RD }),
              c("\"O mercado brasileiro cresce +38% a/a, o ritmo mais alto entre as 4 regi\u00f5es analisadas\"", 4680, { color: GR })
            ]}),
          ]
        }),

        new Paragraph({ spacing: { after: 300 } }),

        // ===== FONTES =====
        s1("5. FONTES PRINCIPAIS"),
        p("Dados de mercado:", { bold: true }),
        bl("GFI Brasil (Good Food Institute) \u2014 Databook e relat\u00f3rios de consumidor 2024"),
        bl("Euromonitor International \u2014 dados de varejo plant-based"),
        bl("SPINS / Circana \u2014 dados de varejo EUA e Europa"),
        bl("GFI Europa \u2014 European Plant-Based Sales Data 2024"),
        bl("Grand View Research, IMARC Group, Statista \u2014 dimensionamento por regi\u00e3o"),

        new Paragraph({ spacing: { after: 80 } }),
        p("Dados de empresa:", { bold: true }),
        bl("Nielsen \u2014 market share por player (Q2 dados)"),
        bl("Growjo \u2014 estimativa de receita"),
        bl("InvestNews, Brazil Journal, InfoMoney \u2014 entrevistas com CEO"),
        bl("LinkedIn Fazenda Futuro \u2014 claims de market share"),

        new Paragraph({ spacing: { before: 400 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 2, color: MB, space: 8 } },
          spacing: { before: 200 },
          children: [new TextRun({ text: "Fim do Relat\u00f3rio \u2014 Fevereiro 2026", font: "Arial", size: 18, color: MG, italics: true })]
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/intelligent-beautiful-feynman/mnt/Claude/Future-Farm/Fazenda-Futuro-Atualizacao-Mercado.docx", buffer);
  console.log("Relat\u00f3rio de atualiza\u00e7\u00e3o criado com sucesso!");
});
