#!/bin/bash
# =============================================================================
# Sync canonical root-level extensions to ~/.claude/
# Source of truth: ~/Claude/{skills,agents,commands,prompts}
# Destination:     ~/.claude/{skills,agents,commands,prompts}
# =============================================================================
set -euo pipefail

BASE_DIR="${HOME}/Claude"
LOG_FILE="${BASE_DIR}/sync.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" | tee -a "$LOG_FILE"
}

log "========== Home sync started =========="

# Sync skills (root -> home)
if [ -d "${BASE_DIR}/skills" ]; then
    rsync -av --delete \
        --exclude='.git/' \
        --exclude='.DS_Store' \
        "${BASE_DIR}/skills/" "${HOME}/.claude/skills/"
    log "  OK   skills/ synced to ~/.claude/skills/ ($(ls "${BASE_DIR}/skills/" | wc -l | tr -d ' ') categories)"
fi

# Sync agents (root -> home)
if [ -d "${BASE_DIR}/agents" ]; then
    rsync -av --delete \
        --exclude='.DS_Store' \
        "${BASE_DIR}/agents/" "${HOME}/.claude/agents/"
    log "  OK   agents/ synced to ~/.claude/agents/"
fi

# Sync commands (root -> home)
if [ -d "${BASE_DIR}/commands" ]; then
    rsync -av --delete \
        --exclude='.DS_Store' \
        "${BASE_DIR}/commands/" "${HOME}/.claude/commands/"
    log "  OK   commands/ synced to ~/.claude/commands/"
fi

# Sync prompts (root -> home)
if [ -d "${BASE_DIR}/prompts" ]; then
    rsync -av --delete \
        --exclude='.DS_Store' \
        "${BASE_DIR}/prompts/" "${HOME}/.claude/prompts/"
    log "  OK   prompts/ synced to ~/.claude/prompts/"
fi

# Sync INDEX.md
if [ -f "${BASE_DIR}/INDEX.md" ]; then
    cp "${BASE_DIR}/INDEX.md" "${HOME}/.claude/INDEX.md"
    log "  OK   INDEX.md synced"
fi

log "========== Home sync complete =========="
