#!/usr/bin/env bash
# nox-mem-diag.sh — read-only diagnostics for nox-mem on VPS
# Single-purpose wrapper around SSH; passes a known set of diagnostic queries.
# Usage: nox-mem-diag.sh <section>
#   sections: health | services | telemetry | canary | monkeypatch | nightly
#             | db-summary | db-sections | db-entities | db-retention | db-recent
#             | logs-watcher | logs-api | logs-gateway | all

set -euo pipefail
VPS="root@100.87.8.44"
DB="/root/.openclaw/workspace/tools/nox-mem/nox-mem.db"

run() { ssh -o ConnectTimeout=5 "$VPS" "$@"; }

case "${1:-all}" in
  health)
    run 'curl -s http://127.0.0.1:18802/api/health | jq "{total:.chunks.total, embedded:.vectorCoverage.embedded, orphans:.vectorCoverage.orphans, salience:.salience, section:.sectionDistribution, retention:.retentionDistribution, db:.dbSizeMB, kg:.knowledgeGraph}"'
    ;;
  services)
    run 'systemctl is-active openclaw-gateway nox-mem-api nox-mem-watcher tailscaled'
    ;;
  telemetry)
    run 'tail -5 /var/log/nox-section-shadow-daily.log 2>/dev/null'
    ;;
  canary)
    run 'tail -10 /var/log/nox-canary.log 2>/dev/null'
    ;;
  monkeypatch)
    run 'ls -la /root/.openclaw/scripts/check-monkey-patch.sh /root/reapply-monkey-patch.sh 2>&1; echo ---; bash /root/.openclaw/scripts/check-monkey-patch.sh 2>&1 || echo "(script empty/failed)"'
    ;;
  nightly)
    run 'echo "=== ls nightly logs ==="; ls -lt /var/log/nox-nightly*.log /var/log/nightly*.log 2>/dev/null | head -5; echo "=== last cron run ==="; grep -E "(nightly-maintenance|memory-consolidation)" /var/log/syslog 2>/dev/null | tail -10 || journalctl -u cron --since "yesterday" --no-pager 2>/dev/null | tail -20 || echo "(no syslog access)"'
    ;;
  db-summary)
    run "sqlite3 $DB 'SELECT COUNT(*) AS total, MAX(rowid) AS max_rowid, MIN(created_at) AS oldest, MAX(created_at) AS newest FROM chunks;'"
    ;;
  db-sections)
    run "sqlite3 $DB 'SELECT section, COUNT(*) FROM chunks GROUP BY section;'"
    ;;
  db-entities)
    run "sqlite3 $DB 'SELECT COUNT(*) AS entity_chunks FROM chunks WHERE source_file LIKE \"%memory/entities/%\"; SELECT COUNT(*) AS mac_docs FROM chunks WHERE source_file LIKE \"%mac-docs%\"; SELECT substr(source_file,1,instr(source_file,\"/\")) AS root, COUNT(*) FROM chunks GROUP BY root ORDER BY 2 DESC LIMIT 15;'"
    ;;
  db-retention)
    run "sqlite3 $DB 'SELECT retention_days, COUNT(*) FROM chunks GROUP BY retention_days ORDER BY 2 DESC LIMIT 15;'"
    ;;
  db-recent)
    run "sqlite3 $DB 'SELECT created_at, source_file, section FROM chunks ORDER BY rowid DESC LIMIT 20;'"
    ;;
  db-deleted-recently)
    run "sqlite3 $DB 'SELECT name FROM sqlite_master WHERE type=\"table\" ORDER BY name;' ; echo ---; sqlite3 $DB 'PRAGMA wal_checkpoint(PASSIVE);'"
    ;;
  logs-watcher)
    run 'journalctl -u nox-mem-watcher --since "12 hours ago" --no-pager 2>/dev/null | tail -40'
    ;;
  logs-api)
    run 'journalctl -u nox-mem-api --since "12 hours ago" --no-pager 2>/dev/null | tail -40'
    ;;
  logs-gateway)
    run 'journalctl -u openclaw-gateway --since "12 hours ago" --no-pager 2>/dev/null | tail -40'
    ;;
  files-entities)
    run 'find /root/.openclaw/workspace/memory/entities -type f -name "*.md" 2>/dev/null | wc -l; ls /root/.openclaw/workspace/memory/entities/ 2>/dev/null'
    ;;
  files-archived)
    run 'ls -la /root/.openclaw/workspace/memory/*.archived* 2>/dev/null; ls -la /root/.openclaw/workspace/memory/ 2>/dev/null | head -30'
    ;;
  maintenance-log)
    run 'ls -la /var/log/nox-maintenance.log 2>/dev/null; echo ---; tail -120 /var/log/nox-maintenance.log 2>/dev/null'
    ;;
  reindex-source)
    run 'ls -la /root/.openclaw/workspace/tools/nox-mem/src/reindex.ts /root/.openclaw/workspace/tools/nox-mem/src/reindex.ts.bak* 2>/dev/null; echo ---; head -80 /root/.openclaw/workspace/tools/nox-mem/src/reindex.ts'
    ;;
  consolidate-source)
    run 'ls -la /root/.openclaw/workspace/tools/nox-mem/src/consolidate.ts 2>/dev/null; echo ---; grep -n "section\|retention\|core_tier" /root/.openclaw/workspace/tools/nox-mem/src/consolidate.ts 2>/dev/null | head -40'
    ;;
  ingest-source)
    run 'ls -la /root/.openclaw/workspace/tools/nox-mem/src/ingest*.ts 2>/dev/null; echo ---; grep -n "section\|retention" /root/.openclaw/workspace/tools/nox-mem/src/ingest.ts 2>/dev/null | head -30'
    ;;
  duplicates)
    run "sqlite3 $DB 'SELECT source_file, COUNT(*) AS dup FROM chunks GROUP BY source_file, content HAVING dup>1 ORDER BY dup DESC LIMIT 15;'"
    ;;
  per-source-counts)
    run "sqlite3 $DB 'SELECT source_file, COUNT(*) FROM chunks GROUP BY source_file ORDER BY 2 DESC LIMIT 20;'"
    ;;
  logrotate)
    run 'echo "=== /etc/logrotate.d/nox ==="; cat /etc/logrotate.d/nox 2>/dev/null; echo; echo "=== logrotate.d entries with nox/openclaw ==="; grep -l "nox\|openclaw" /etc/logrotate.d/* 2>/dev/null; echo; echo "=== last logrotate run ==="; cat /var/lib/logrotate/status 2>/dev/null | grep -i "nox\|openclaw" | head -10; echo; echo "=== ls /var/log/nox-* ==="; ls -la /var/log/nox-* 2>/dev/null | head -20'
    ;;
  log-history)
    run 'echo "=== rotated logs ==="; ls -la /var/log/nox-maintenance.log* 2>/dev/null; echo; echo "=== nightly script tail ==="; tail -50 /root/.openclaw/scripts/nightly-maintenance.sh 2>/dev/null; echo; echo "=== nightly script head ==="; head -30 /root/.openclaw/scripts/nightly-maintenance.sh 2>/dev/null'
    ;;
  cron-jobs)
    run 'echo "=== crontab root ==="; crontab -l 2>/dev/null | grep -E "nox|openclaw|maintenance"; echo; echo "=== /etc/cron.d ==="; ls /etc/cron.d/ 2>/dev/null; grep -l "nox\|openclaw\|maintenance" /etc/cron.d/* 2>/dev/null; echo; echo "=== sudo grep recent maintenance run ==="; grep -E "nightly-maintenance|maintenance.sh" /var/log/syslog 2>/dev/null | tail -10'
    ;;
  gateway-units)
    run 'echo "=== current gateway version ==="; openclaw --version 2>/dev/null || /usr/lib/node_modules/openclaw/dist/cli.js --version 2>/dev/null; echo; cat /usr/lib/node_modules/openclaw/package.json 2>/dev/null | grep version; echo; echo "=== systemctl gateway services (system + user) ==="; systemctl list-units --type=service --all 2>/dev/null | grep -iE "openclaw|gateway"; echo; echo "=== /etc/systemd/system gateway unit files ==="; ls -la /etc/systemd/system/openclaw* /etc/systemd/system/openclaw-gateway.service.d/ 2>/dev/null; echo; echo "=== unit content ==="; cat /etc/systemd/system/openclaw-gateway.service 2>/dev/null; echo; cat /etc/systemd/system/openclaw-gateway.service.d/*.conf 2>/dev/null; echo; echo "=== user-level systemd (UID 472430) ==="; ls -la /var/lib/systemd/linger/ 2>/dev/null; getent passwd 472430 2>/dev/null; echo; loginctl list-users 2>/dev/null'
    ;;
  gateway-now)
    run 'echo "=== current gateway pid + version ==="; ps -ef | grep -E "openclaw|gateway" | grep -v grep | head -10; echo; echo "=== gateway version reported in last 10min ==="; journalctl --since "10 minutes ago" --no-pager 2>/dev/null | grep -E "OpenClaw Gateway \(v" | tail -5; echo; echo "=== current restart counter ==="; systemctl show openclaw-gateway -p NRestarts -p ExecMainPID -p ActiveEnterTimestamp 2>/dev/null'
    ;;
  reindex-history)
    run 'echo "=== recent nox-mem CLI invocations in syslog ==="; grep -E "nox-mem|reindex" /var/log/syslog 2>/dev/null | grep -v -E "nox-canary|nox-health|check-monkey-patch|semantic-canary|drift-check|heartbeat-sync" | tail -30; echo; echo "=== root bash history (last 50 with nox-mem/reindex) ==="; tail -200 /root/.bash_history 2>/dev/null | grep -E "nox-mem|reindex|consolidate" | tail -30; echo; echo "=== upgrade scripts referencing reindex ==="; grep -l "reindex\|nox-mem" /root/upgrade-*.sh /root/.openclaw/scripts/upgrade*.sh 2>/dev/null | xargs -r -I{} sh -c "echo \"=== {} ===\"; grep -nE \"reindex|nox-mem\" {}"'
    ;;
  user-units)
    run 'echo "=== loginctl user-status root ==="; loginctl user-status root 2>/dev/null | head -30; echo; echo "=== find user unit files ==="; find /etc/systemd/user /usr/lib/systemd/user /root/.config/systemd /home/*/.config/systemd 2>/dev/null -name "openclaw*"; echo; echo "=== systemctl --user (root scope) list openclaw ==="; XDG_RUNTIME_DIR=/run/user/0 systemctl --user list-units --all "openclaw*" 2>/dev/null; echo; echo "=== ps for systemd[472430] ==="; ps -o pid,user,cmd -p 472430 2>/dev/null; echo; echo "=== nproc + load ==="; nproc; uptime'
    ;;
  reindex-trigger)
    run 'echo "=== syslog 21:30-22:30 BRT 24/04 (reindex window) — non-cron activity ==="; awk -v start="2026-04-24T21:30" -v end="2026-04-24T22:30" "/^2026-04-24T2[12]:[0-3]/ { if (\$1 >= start && \$1 <= end) print }" /var/log/syslog 2>/dev/null | grep -v -E "CRON\[|cron-cron|drift-check|heartbeat-sync|check-monkey|check-discord|check-gm|semantic-canary|health-probe|bvv-extract|graph-memory recall" | head -80'
    ;;
  all)
    for s in health services telemetry canary monkeypatch db-summary db-sections db-entities db-retention; do
      echo "=========================================="
      echo "=== $s"
      echo "=========================================="
      "$0" "$s" 2>&1 || true
      echo
    done
    ;;
  *)
    echo "unknown section: $1" >&2
    echo "valid: health services telemetry canary monkeypatch nightly db-summary db-sections db-entities db-retention db-recent logs-watcher logs-api logs-gateway files-entities files-archived all" >&2
    exit 2
    ;;
esac
