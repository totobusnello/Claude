#!/usr/bin/env bash
# setup-repo-pr-defaults.sh — aplica os defaults de PR da policy a UM repo:
#   • squash-merge ONLY (desliga merge-commit e rebase)  → main enxuta, 1 PR = 1 commit
#   • auto-merge habilitado                              → mergeia sozinho quando CI passa
#   • delete branch on merge                             → sem lixo de branch
#   • PR template (.github/pull_request_template.md)     → o quê / por quê / como testei
#
# Os settings de merge/auto-merge são do repo no GitHub (via gh api) e precisam de
# permissão admin no repo. O template é um arquivo, escrito no working tree local.
#
# Uso:
#   setup-repo-pr-defaults.sh                 # aplica no repo do cwd
#   setup-repo-pr-defaults.sh owner/repo      # aplica num repo remoto por nome
#   setup-repo-pr-defaults.sh --no-template   # só os settings, sem escrever template
set -euo pipefail

REPO_ARG=""; WRITE_TEMPLATE=true
for a in "$@"; do
  case "$a" in
    --no-template) WRITE_TEMPLATE=false ;;
    -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
    -*) echo "setup-repo-pr-defaults: flag desconhecida: $a" >&2; exit 2 ;;
    *)  REPO_ARG="$a" ;;
  esac
done

command -v gh >/dev/null 2>&1 || { echo "precisa do gh CLI (brew install gh)." >&2; exit 1; }

if [ -n "$REPO_ARG" ]; then
  NWO="$REPO_ARG"
else
  NWO="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)" \
    || { echo "não é um repo GitHub (ou gh sem contexto). Passe owner/repo." >&2; exit 1; }
fi

echo "Aplicando defaults de PR em: $NWO"

gh api -X PATCH "repos/$NWO" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F allow_auto_merge=true \
  -F delete_branch_on_merge=true \
  -F squash_merge_commit_title=PR_TITLE \
  -F squash_merge_commit_message=PR_BODY \
  >/dev/null && echo "  ✓ squash-only + auto-merge + delete-on-merge"

if $WRITE_TEMPLATE; then
  if git rev-parse --show-toplevel >/dev/null 2>&1; then
    TOP="$(git rev-parse --show-toplevel)"
    mkdir -p "$TOP/.github"
    TPL="$TOP/.github/pull_request_template.md"
    if [ -f "$TPL" ]; then
      echo "  · template já existe: $TPL (mantido)"
    else
      cat > "$TPL" <<'MD'
## O quê
<!-- 1 linha: o que muda -->

## Por quê
<!-- 1 linha: motivo / contexto -->

## Como testei
<!-- 1 linha: build/test/manual — ou "N/A" -->
MD
      echo "  ✓ template criado: $TPL (commite junto)"
    fi
  else
    echo "  · sem working tree local — pulei o template (rode dentro do repo pra criá-lo)"
  fi
fi

echo "Pronto."
