---
name: create-presentation
description: Create PowerPoint presentations using the templates collection. Use when user says "criar apresentacao", "montar deck", "fazer slides", "presentation", "powerpoint", "criar slides", "montar apresentacao".
---

# Create Presentation

## Overview

Skill para criar apresentacoes profissionais usando a colecao de 93 templates PowerPoint disponivel em `templates/powerpoint/allpowerpointtemplates/`. Guia o usuario na escolha do template ideal e gera a estrutura completa dos slides com conteudo.

## Quick Start

Quando o usuario pedir para criar uma apresentacao:

1. Pergunte o **tipo/objetivo** (pitch, board meeting, financeiro, treinamento, etc.)
2. Pergunte o **tom desejado** (formal, moderno, clean, elegante)
3. Pergunte preferencia **Dark ou Light**
4. Sugira 2-3 templates adequados com justificativa
5. Gere a estrutura dos slides com conteudo

## Instructions

### Step 1: Identificar o Contexto

Colete as seguintes informacoes do usuario:
- **Objetivo**: Qual o proposito da apresentacao?
- **Audiencia**: Quem vai assistir? (investidores, board, equipe, clientes)
- **Tom**: Formal, moderno, casual, tecnico?
- **Quantidade de slides**: Estimativa desejada
- **Conteudo principal**: Topicos/dados a incluir

### Step 2: Selecionar Template

Use esta matriz de decisao:

| Objetivo | Templates Recomendados | Justificativa |
|----------|----------------------|---------------|
| Pitch investidores | pitch-deck, marketing-pitch, trend | Foco em metricas, visual impactante |
| Board meeting | corporate, company-profile, bridgewater | Tom serio, profissional |
| Relatorio financeiro | monex, investments, financial-capital | Layouts para graficos e numeros |
| Proposta comercial | advantage, elevate, bright, deluxe | Visual vendedor, clean |
| Treinamento | training, teaching, learn | Didatico, espacos para conteudo |
| Imobiliario | branch-homes, realtor, rosewood | Foco em imagens, elegante |
| Startup/Tech | zoom, star, live, interactive | Moderno, dinamico |
| Multipurpose | ONE, SMPL, nova, porto | Versatil, varias opcoes de cor |

**Priorize templates com Dark + Light** quando o usuario quiser opcoes de visual.
**Priorize templates com XML Colors** quando customizacao de cores for importante.

### Step 3: Definir Estrutura dos Slides

Estrutura padrao por tipo de apresentacao:

**Pitch Deck (10-15 slides):**
1. Capa (titulo, logo, data)
2. Problema
3. Solucao
4. Produto/Demo
5. Modelo de Negocio
6. Mercado (TAM/SAM/SOM)
7. Traction/Metricas
8. Competidores
9. Time
10. Financeiro (projections)
11. Ask (investimento desejado)
12. Contato

**Board Meeting (8-12 slides):**
1. Capa
2. Agenda
3. Executive Summary
4. KPIs/Metricas
5. Financeiro
6. Operacional
7. Desafios/Riscos
8. Proximos Passos
9. Q&A

**Proposta Comercial (8-10 slides):**
1. Capa
2. Sobre Nos
3. Entendimento do Problema
4. Nossa Solucao
5. Metodologia
6. Cases/Portfolio
7. Timeline
8. Investimento/Preco
9. Proximos Passos
10. Contato

**Treinamento (15-20 slides):**
1. Capa
2. Objetivos
3. Agenda
4. Conteudo (multiplos slides)
5. Exercicios/Atividades
6. Resumo
7. Q&A
8. Avaliacao

### Step 4: Gerar Conteudo

Para cada slide, forneca:
- **Titulo** do slide
- **Subtitulo** (quando aplicavel)
- **Bullet points** com conteudo (3-5 por slide)
- **Notas do apresentador** (opcional)
- **Sugestao visual**: que tipo de grafico, imagem ou layout usar

### Step 5: Instrucoes de Implementacao

Informe ao usuario:
1. Qual template abrir: caminho completo do .pptx
2. Como aplicar XML de cores (se aplicavel): copiar o .xml para a pasta de temas do PowerPoint
3. Fontes necessarias: quais instalar (Lato, Montserrat, Roboto, etc.)
4. Onde encontrar a documentacao: PDF na pasta do template

## Fontes da Colecao

| Combinacao | Templates | Onde Baixar |
|------------|-----------|-------------|
| Lato + Montserrat | 37 templates | Google Fonts |
| Rooto + Lato | 6 templates | Google Fonts (Lato) |
| Roboto | 4 templates | Google Fonts |
| Montserrat | 13 templates | Google Fonts |
| Muli/Mulish | 2 templates | Google Fonts (Mulish) |

## Localizacao dos Templates

```
templates/powerpoint/allpowerpointtemplates/
```

Catalogo completo com detalhes: `templates/powerpoint/README.md`

## Best Practices

**Do:**
- Sugira 2-3 templates, nao mais - excesso de opcoes paralisa
- Priorize templates com Dark + Light para dar opcao ao usuario
- Adapte a estrutura de slides ao tempo disponivel da apresentacao
- Inclua notas do apresentador com talking points
- Sugira uso de XML Colors quando a marca do usuario tem cores especificas

**Avoid:**
- Nao sugira templates de real estate para pitch de tech (e vice-versa)
- Nao force estruturas rigidas - adapte ao conteudo do usuario
- Nao ignore a audiencia na escolha do template
- Nao recomende mais de 20 slides a menos que seja treinamento

## Examples

### Example 1: Pitch para Investidores
**User**: "Preciso criar um pitch deck para apresentar minha startup de fintech para investidores"
**Acao**: Sugerir pitch-deck (Dark) ou monex (Dark) + estrutura de 12 slides focada em metricas e financeiro.

### Example 2: Reuniao de Board
**User**: "Tenho reuniao de board na segunda, preciso montar a apresentacao trimestral"
**Acao**: Sugerir corporate (Light) ou company-profile (Light) + estrutura de 10 slides com KPIs e financeiro.

### Example 3: Treinamento de Equipe
**User**: "Preciso fazer um material de treinamento sobre o novo processo de vendas"
**Acao**: Sugerir training ou teaching + estrutura de 15-18 slides com exercicios praticos.
