#!/bin/bash
# =============================================================================
# Atualizações Urgentes — 2026-03-22
# Gerado pelo weekly-setup-optimizer
# Rodar no terminal do Mac (não dentro do Claude Code)
# =============================================================================

set -euo pipefail

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Setup Update — 2026-03-22                              ║"
echo "║   Baseado no relatório weekly-setup-optimizer            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ---------------------------------------------------------
# 1. Atualizar Claude Code
# ---------------------------------------------------------
echo "📦 [1/4] Atualizando Claude Code..."
echo "   → Versão atual: verificar com 'claude --version'"
echo "   → Target: v2.1.76+"
echo "   → Novas features: /voice, /loop, 1M tokens, remote control"
echo ""
claude update || echo "⚠️  Falha no update. Tente: npm install -g @anthropic-ai/claude-code"
echo ""

# ---------------------------------------------------------
# 2. Atualizar plugin context-mode (CRÍTICO)
# ---------------------------------------------------------
echo "🔌 [2/4] Atualizando context-mode (v1.0.18 → v1.0.42)..."
echo "   → Bug crítico corrigido: tool naming em 10/11 plataformas"
echo "   → 32 novos testes adicionados"
echo ""
echo "   Abra Claude Code e rode:"
echo "   /plugin update context-mode"
echo ""
echo "   Ou via marketplace:"
echo "   /plugin marketplace add mksglu/claude-context-mode"
echo "   /plugin install context-mode"
echo ""

# ---------------------------------------------------------
# 3. Rodar ao doctor
# ---------------------------------------------------------
echo "🔍 [3/4] Verificando Agent Orchestrator..."
if command -v ao &> /dev/null; then
    echo "   → AO encontrado, rodando diagnostico..."
    ao doctor || echo "⚠️  ao doctor falhou — verifique a instalação do AO"
else
    echo "   ⚠️  Comando 'ao' não encontrado no PATH"
    echo "   → Tente: cd ~/Claude && pnpm global add agent-orchestrator"
fi
echo ""

# ---------------------------------------------------------
# 4. Sync skills para ~/.claude/
# ---------------------------------------------------------
echo "🔄 [4/4] Sincronizando skills para ~/.claude/..."
if [ -f "$HOME/Claude/scripts/sync-all-to-home.sh" ]; then
    bash "$HOME/Claude/scripts/sync-all-to-home.sh"
    echo "   ✅ Sync concluído"
else
    echo "   ⚠️  Script sync não encontrado"
fi
echo ""

# ---------------------------------------------------------
# Resumo
# ---------------------------------------------------------
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅ PRONTO — Próximos passos manuais:                   ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║   1. Dentro do Claude Code: /plugin update context-mode  ║"
echo "║   2. Rodar: install-financial-mcps.sh                    ║"
echo "║   3. Testar /voice no Claude Code                        ║"
echo "║   4. Rodar /context-mode:doctor para validar             ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
