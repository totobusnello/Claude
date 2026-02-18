#!/bin/bash
# Sync script for Toto-Code repository
# Run this manually or configure with launchd for automatic daily sync
#
# SETUP (run once on your Mac):
# 1. Copy this script: cp sync-toto-code.sh ~/Claude/scripts/
# 2. Create launchd job:
#    cat > ~/Library/LaunchAgents/com.toto.sync-repo.plist << 'EOF'
#    <?xml version="1.0" encoding="UTF-8"?>
#    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
#    <plist version="1.0">
#    <dict>
#        <key>Label</key>
#        <string>com.toto.sync-repo</string>
#        <key>ProgramArguments</key>
#        <array>
#            <string>/Users/lab/Claude/scripts/sync-toto-code.sh</string>
#        </array>
#        <key>StartCalendarInterval</key>
#        <dict>
#            <key>Hour</key>
#            <integer>23</integer>
#            <key>Minute</key>
#            <integer>0</integer>
#        </dict>
#    </dict>
#    </plist>
#    EOF
# 3. Activate: launchctl load ~/Library/LaunchAgents/com.toto.sync-repo.plist

REPO_DIR="${HOME}/Claude/Toto-Code"
LOG_FILE="${HOME}/Claude/sync.log"

echo "$(date): Starting sync..." >> "$LOG_FILE"

cd "$REPO_DIR" || exit 1

# Pull latest from remote
git pull origin main --quiet

# Copy updated .claude to home
rsync -av --quiet "$REPO_DIR/.claude/" "${HOME}/.claude/" 2>/dev/null

echo "$(date): Sync complete" >> "$LOG_FILE"
