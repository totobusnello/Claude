#!/bin/bash
# =============================================================================
# Sync all Git repositories under ~/Claude and update ~/.claude/
# Pulls latest changes, updates submodules, syncs extensions to home
#
# SETUP (run once on Mac):
#   launchctl unload ~/Library/LaunchAgents/com.toto.sync-repo.plist 2>/dev/null
#   cat > ~/Library/LaunchAgents/com.toto.sync-repo.plist << 'PLIST'
#   <?xml version="1.0" encoding="UTF-8"?>
#   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
#     "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
#   <plist version="1.0">
#   <dict>
#       <key>Label</key>
#       <string>com.toto.sync-repo</string>
#       <key>ProgramArguments</key>
#       <array>
#           <string>/Users/lab/Claude/scripts/sync-all-repos.sh</string>
#       </array>
#       <key>StartCalendarInterval</key>
#       <dict>
#           <key>Hour</key>
#           <integer>23</integer>
#           <key>Minute</key>
#           <integer>0</integer>
#       </dict>
#       <key>StandardOutPath</key>
#       <string>/Users/lab/Claude/sync-stdout.log</string>
#       <key>StandardErrorPath</key>
#       <string>/Users/lab/Claude/sync-stderr.log</string>
#   </dict>
#   </plist>
#   PLIST
#   launchctl load ~/Library/LaunchAgents/com.toto.sync-repo.plist
#
# Manual run: ~/Claude/scripts/sync-all-repos.sh
# =============================================================================

BASE_DIR="${HOME}/Claude"
LOG_FILE="${BASE_DIR}/sync.log"
ERRORS=0

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $1" >> "$LOG_FILE"
}

sync_repo() {
    local repo_path="$1"
    local repo_name
    repo_name=$(basename "$repo_path")

    if [ ! -d "$repo_path/.git" ]; then
        log "  SKIP $repo_name (not a git repo)"
        return
    fi

    cd "$repo_path" || return

    local branch
    branch=$(git symbolic-ref --short HEAD 2>/dev/null)

    local stashed=false
    if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
        git stash --quiet 2>/dev/null && stashed=true
    fi

    local default_branch
    default_branch=$(git remote show origin 2>/dev/null | grep 'HEAD branch' | awk '{print $NF}')
    default_branch=${default_branch:-main}

    if [ "$branch" != "$default_branch" ]; then
        git checkout "$default_branch" --quiet 2>/dev/null
    fi

    if git pull origin "$default_branch" --quiet 2>/dev/null; then
        log "  OK   $repo_name ($default_branch)"
    else
        log "  FAIL $repo_name - pull failed"
        ERRORS=$((ERRORS + 1))
    fi

    git fetch --prune --quiet 2>/dev/null

    if [ "$branch" != "$default_branch" ] && [ -n "$branch" ]; then
        git checkout "$branch" --quiet 2>/dev/null
    fi
    if [ "$stashed" = true ]; then
        git stash pop --quiet 2>/dev/null
    fi
}

# ── Start ──
log "========== Sync started =========="

# 1. Root repo
log "-- Root repo --"
sync_repo "${BASE_DIR}"

# 2. Update all submodules
log "-- Submodules --"
cd "${BASE_DIR}" && git submodule update --remote --merge 2>/dev/null
log "  OK   submodules updated"

# 3. Sync extensions to ~/.claude/
log "-- Home sync --"
"${BASE_DIR}/scripts/sync-all-to-home.sh" >> "$LOG_FILE" 2>&1

# ── Summary ──
if [ $ERRORS -eq 0 ]; then
    log "========== Sync complete (all OK) =========="
else
    log "========== Sync complete ($ERRORS errors) =========="
fi
