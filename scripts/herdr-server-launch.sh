#!/usr/bin/env bash
# Wrapper do LaunchAgent dev.herdr.server: reordena os spaces alfabético (home no topo)
# ANTES de subir o server herdr. O sort aborta sozinho se o server já estiver vivo.
/opt/homebrew/bin/python3 "$HOME/Claude/scripts/herdr-sort-spaces.py" >/tmp/herdr-sort-spaces.log 2>&1 || true
exec /opt/homebrew/bin/herdr server
