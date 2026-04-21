#!/bin/bash
# =============================================================================
# Instalação dos MCPs Financeiros — 2026-03-22
# Gerado pelo weekly-setup-optimizer
#
# MCPs incluídos:
#   1. Financial Modeling Prep (FMP) — dados de mercado, balanços, M&A
#   2. Alpha Vantage — dados macro, forex, indicadores
#
# Pré-requisitos:
#   - Node.js 18+ (verificar: node --version)
#   - API keys dos serviços abaixo
#
# Como obter API keys:
#   FMP:          https://financialmodelingprep.com/developer/docs/
#   Alpha Vantage: https://www.alphavantage.co/support/#api-key (grátis)
# =============================================================================

set -euo pipefail

CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
BACKUP_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.backup.$(date +%Y%m%d%H%M%S).json"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Instalação MCPs Financeiros — 2026-03-22               ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ---------------------------------------------------------
# Verificar pré-requisitos
# ---------------------------------------------------------
echo "🔍 Verificando pré-requisitos..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale: brew install node"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Node.js v$NODE_VERSION encontrado. Recomendado: v18+"
fi

echo "✅ Node.js $(node --version)"
echo ""

# ---------------------------------------------------------
# Coletar API Keys
# ---------------------------------------------------------
echo "🔑 Configuração de API Keys:"
echo ""

# FMP API Key
if [ -z "${FMP_API_KEY:-}" ]; then
    echo "   Financial Modeling Prep (FMP):"
    echo "   → Obter em: https://financialmodelingprep.com/developer/docs/"
    echo "   → Plano gratuito: 250 requests/dia"
    echo "   → Plano pago (~$15/mês): 10.000 requests/dia + dados premium"
    echo ""
    read -p "   Cole sua FMP API Key (Enter para pular): " FMP_API_KEY
    echo ""
fi

# Alpha Vantage API Key
if [ -z "${ALPHA_VANTAGE_API_KEY:-}" ]; then
    echo "   Alpha Vantage:"
    echo "   → Obter em: https://www.alphavantage.co/support/#api-key"
    echo "   → Grátis: 25 requests/dia"
    echo "   → Premium (~$50/mês): requests ilimitados + dados em tempo real"
    echo ""
    read -p "   Cole sua Alpha Vantage API Key (Enter para pular): " ALPHA_VANTAGE_API_KEY
    echo ""
fi

# ---------------------------------------------------------
# Backup do config existente
# ---------------------------------------------------------
if [ -f "$CLAUDE_CONFIG" ]; then
    echo "📋 Backup do config atual → $BACKUP_FILE"
    cp "$CLAUDE_CONFIG" "$BACKUP_FILE"
fi

# ---------------------------------------------------------
# Testar instalação dos pacotes
# ---------------------------------------------------------
echo "📦 Testando pacotes npm..."

echo "   → Testando @houtini/fmp-mcp..."
npx -y @houtini/fmp-mcp --help > /dev/null 2>&1 && echo "   ✅ FMP MCP disponível" || echo "   ⚠️  FMP MCP: usar versão alternativa"

echo "   → Testando alpha-vantage-mcp..."
npx -y @alphavantage/mcp --help > /dev/null 2>&1 \
    || npx -y alpha-vantage-mcp --help > /dev/null 2>&1 \
    && echo "   ✅ Alpha Vantage MCP disponível" \
    || echo "   ℹ️  Alpha Vantage: será instalado via npm global"
echo ""

# ---------------------------------------------------------
# Gerar snippet de config para Claude Code
# ---------------------------------------------------------
echo "📝 Gerando configuração para Claude Code (~/.claude.json)..."

CLAUDE_CODE_CONFIG="$HOME/.claude.json"
SNIPPET_FILE="$HOME/Claude/docs/MCP_FINANCIAL_CONFIG_SNIPPET.json"

mkdir -p "$HOME/Claude/docs"

cat > "$SNIPPET_FILE" << JSONEOF
{
  "_instrucoes": "Adicione os blocos abaixo no seu ~/.claude.json dentro de 'mcpServers'",
  "_fmp_api_key": "Substitua YOUR_FMP_API_KEY pela sua chave de https://financialmodelingprep.com",
  "_alphavantage_api_key": "Substitua YOUR_ALPHA_VANTAGE_KEY pela sua chave de https://www.alphavantage.co",

  "mcpServers_ADICIONAR": {

    "financial-modeling-prep": {
      "command": "npx",
      "args": ["-y", "@houtini/fmp-mcp"],
      "env": {
        "FMP_API_KEY": "${FMP_API_KEY:-YOUR_FMP_API_KEY}"
      }
    },

    "financial-modeling-prep-alt": {
      "_nota": "Use este se o acima não funcionar",
      "command": "npx",
      "args": ["-y", "financial-modeling-prep-mcp-server"],
      "env": {
        "FMP_ACCESS_TOKEN": "${FMP_API_KEY:-YOUR_FMP_API_KEY}",
        "DYNAMIC_TOOL_DISCOVERY": "true"
      }
    },

    "alpha-vantage": {
      "command": "npx",
      "args": ["-y", "@berlinbra/alpha-vantage-mcp"],
      "env": {
        "ALPHA_VANTAGE_API_KEY": "${ALPHA_VANTAGE_API_KEY:-YOUR_ALPHA_VANTAGE_KEY}"
      }
    }

  }
}
JSONEOF

echo "   ✅ Snippet salvo em: ~/Claude/docs/MCP_FINANCIAL_CONFIG_SNIPPET.json"
echo ""

# ---------------------------------------------------------
# Tentar adicionar ao ~/.claude.json (Claude Code config)
# ---------------------------------------------------------
if [ -f "$CLAUDE_CODE_CONFIG" ]; then
    echo "🔧 Config do Claude Code encontrado em ~/.claude.json"
    echo "   → Backup criado: ~/.claude.json.bak"
    cp "$CLAUDE_CODE_CONFIG" "${CLAUDE_CODE_CONFIG}.bak"
    echo ""
    echo "   ⚠️  Adição automática ao .claude.json requer jq."

    if command -v jq &> /dev/null; then
        # Adicionar FMP MCP se API key fornecida
        if [ -n "${FMP_API_KEY:-}" ]; then
            TMP=$(mktemp)
            jq --arg key "$FMP_API_KEY" \
                '.mcpServers["financial-modeling-prep"] = {
                    "command": "npx",
                    "args": ["-y", "@houtini/fmp-mcp"],
                    "env": {"FMP_API_KEY": $key}
                }' "$CLAUDE_CODE_CONFIG" > "$TMP" && mv "$TMP" "$CLAUDE_CODE_CONFIG"
            echo "   ✅ FMP MCP adicionado ao ~/.claude.json"
        fi

        # Adicionar Alpha Vantage MCP se API key fornecida
        if [ -n "${ALPHA_VANTAGE_API_KEY:-}" ]; then
            TMP=$(mktemp)
            jq --arg key "$ALPHA_VANTAGE_API_KEY" \
                '.mcpServers["alpha-vantage"] = {
                    "command": "npx",
                    "args": ["-y", "@berlinbra/alpha-vantage-mcp"],
                    "env": {"ALPHA_VANTAGE_API_KEY": $key}
                }' "$CLAUDE_CODE_CONFIG" > "$TMP" && mv "$TMP" "$CLAUDE_CODE_CONFIG"
            echo "   ✅ Alpha Vantage MCP adicionado ao ~/.claude.json"
        fi
    else
        echo "   ℹ️  jq não instalado. Use o snippet manual em:"
        echo "      ~/Claude/docs/MCP_FINANCIAL_CONFIG_SNIPPET.json"
        echo ""
        echo "   Para instalar jq: brew install jq"
    fi
else
    echo "   ℹ️  ~/.claude.json não encontrado"
    echo "   → Abra Claude Code e adicione os MCPs via:"
    echo "      claude mcp add financial-modeling-prep"
    echo ""
fi

# ---------------------------------------------------------
# Adicionar API keys ao ~/.zshrc se não existirem
# ---------------------------------------------------------
echo ""
echo "🔑 Adicionando API keys ao ~/.zshrc..."

ZSHRC="$HOME/.zshrc"

if [ -n "${FMP_API_KEY:-}" ] && ! grep -q "FMP_API_KEY" "$ZSHRC" 2>/dev/null; then
    echo "" >> "$ZSHRC"
    echo "# Financial Modeling Prep — adicionado em 2026-03-22" >> "$ZSHRC"
    echo "export FMP_API_KEY=\"$FMP_API_KEY\"" >> "$ZSHRC"
    echo "   ✅ FMP_API_KEY adicionada ao ~/.zshrc"
fi

if [ -n "${ALPHA_VANTAGE_API_KEY:-}" ] && ! grep -q "ALPHA_VANTAGE_API_KEY" "$ZSHRC" 2>/dev/null; then
    echo "" >> "$ZSHRC"
    echo "# Alpha Vantage — adicionado em 2026-03-22" >> "$ZSHRC"
    echo "export ALPHA_VANTAGE_API_KEY=\"$ALPHA_VANTAGE_API_KEY\"" >> "$ZSHRC"
    echo "   ✅ ALPHA_VANTAGE_API_KEY adicionada ao ~/.zshrc"
fi

# ---------------------------------------------------------
# Resumo final
# ---------------------------------------------------------
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅ Instalação concluída!                               ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║   Próximos passos:                                       ║"
echo "║   1. Reinicie o Claude Code (cmd+Q e abrir de novo)      ║"
echo "║   2. Teste: 'get me the NVNI stock data'                 ║"
echo "║   3. Teste: 'fetch Apple income statement last 4 years'  ║"
echo "║   4. Teste: 'what is the macro outlook for Brazil?'      ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║   Snippet de config manual disponível em:                ║"
echo "║   ~/Claude/docs/MCP_FINANCIAL_CONFIG_SNIPPET.json        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
