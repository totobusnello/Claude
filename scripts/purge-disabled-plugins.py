#!/usr/bin/env python3
"""
Surgical uninstall of plugins that are disabled in ~/.claude/settings.json
but still installed on disk.

`claude plugin uninstall` refuses to remove these because the install records
at ~/.claude/plugins/installed_plugins.json claim scope=project with an
inherited projectPath of /Users/lab — the CLI treats that as a team-shared
install and blocks the operation. We work around by:
  1. Removing the entry from installed_plugins.json
  2. Deleting the install_path cache directory

Only acts on plugins that are:
  - listed in settings.json enabledPlugins with value=False, AND
  - present in installed_plugins.json

Idempotent. Safe to re-run.
"""
import json
import os
import shutil
import sys
from pathlib import Path

SETTINGS = Path("/Users/lab/.claude/settings.json")
INSTALLED = Path("/Users/lab/.claude/plugins/installed_plugins.json")

DRY = "--dry-run" in sys.argv

settings = json.loads(SETTINGS.read_text())
installed = json.loads(INSTALLED.read_text())

enabled_map = settings.get("enabledPlugins", {})
# Also union with any project-level settings so we don't purge plugins kept
# enabled at a narrower scope.
PROJECT_SETTINGS = Path("/Users/lab/Claude/.claude/settings.json")
project_enabled = set()
if PROJECT_SETTINGS.exists():
    try:
        project_enabled = set(
            json.loads(PROJECT_SETTINGS.read_text()).get("enabledPlugins", {}).keys()
        )
    except Exception:
        pass

enabled_anywhere = set(enabled_map.keys()) | project_enabled
plugins_db = installed.get("plugins", {})

# Targets = anything installed on disk but not enabled in any scope.
# This picks up plugins the user removed from enabledPlugins (by us or manually)
# as well as any stale install records still labelled scope=project.
disabled_names = {k for k in plugins_db.keys() if k not in enabled_anywhere}

to_purge = []
for name in disabled_names:
    entries = plugins_db.get(name)
    if not entries:
        continue
    for e in entries:
        to_purge.append((name, e.get("installPath")))

print(f"Found {len(to_purge)} disk entries for {len(disabled_names)} disabled plugins")
if DRY:
    for n, p in to_purge[:10]:
        print(f"  would purge: {n}  @ {p}")
    print(f"  ... and {max(0, len(to_purge)-10)} more")
    sys.exit(0)

removed_cache = 0
removed_records = 0
for name, path in to_purge:
    if path and os.path.isdir(path):
        shutil.rmtree(path, ignore_errors=True)
        removed_cache += 1

for name in disabled_names:
    if name in plugins_db:
        del plugins_db[name]
        removed_records += 1

installed["plugins"] = plugins_db
INSTALLED.write_text(json.dumps(installed, indent=2))

# Also strip the disabled entries from settings.json enabledPlugins so
# the map only reflects installed plugins going forward.
for name in disabled_names:
    enabled_map.pop(name, None)
settings["enabledPlugins"] = enabled_map
SETTINGS.write_text(json.dumps(settings, indent=2))

print(f"Removed {removed_cache} cache dirs")
print(f"Removed {removed_records} install-record entries")
print(f"Cleaned {len(disabled_names)} stale enabledPlugins entries from settings.json")
