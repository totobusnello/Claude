#!/usr/bin/env bash
# ship.sh — branch → commit → push → PR, numa linha. Opcional: auto-merge squash.
#
# A rotina de PR-por-default só sobrevive se o custo for perto de zero. Este é o
# atalho: de working tree sujo a PR aberto num comando, seguindo a "PR & Versioning
# Policy" do CLAUDE.md.
#
# Uso:
#   ship "feat(x): faz y"                  # add -A (se sem submódulo mexido), branch, commit, push, PR
#   ship "fix(api): trata 500" src/ lib/   # add SELETIVO só desses paths
#   ship --merge "chore: bump deps"        # + arma auto-merge (squash) on green
#   ship --draft "wip: explora z"          # PR como draft
#   ship --no-push "..."                   # só branch+commit local, para aí
#
# Regras herdadas da policy:
#   - Conventional Commits na mensagem (feat/fix/chore/docs/refactor).
#   - Add SELETIVO: se você passa paths, entra só eles. Sem paths faz add -A —
#     MAS aborta se houver submódulo mexido (evita arrastar Projetos/* por engano).
#   - Commit em branch != main usa COMMIT_TO_NON_MAIN_OK=1 (pre-commit hook global).
#   - Em main/master cria branch derivada da msg; numa feature branch, commita nela.
set -euo pipefail

MERGE=false; DRAFT=false; PUSH=true
MSG=""
PATHS=()

# ── Parse: flags + 1ª posicional = msg, resto = paths ──
while [ $# -gt 0 ]; do
  case "$1" in
    --merge)   MERGE=true; shift ;;
    --draft)   DRAFT=true; shift ;;
    --no-push) PUSH=false; shift ;;
    -h|--help) sed -n '2,17p' "$0"; exit 0 ;;
    -*) echo "ship: flag desconhecida: $1" >&2; exit 2 ;;
    *)  if [ -z "$MSG" ]; then MSG="$1"; else PATHS+=("$1"); fi; shift ;;
  esac
done

[ -n "$MSG" ] || { echo "ship: falta a mensagem de commit (Conventional Commits)." >&2; exit 2; }

# ── Guards ──
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "ship: não é um git repo." >&2; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "ship: gh CLI não encontrado (brew install gh)." >&2; exit 1; }
[ -n "$(git status --porcelain)" ] || { echo "ship: working tree limpo — nada pra shipar." >&2; exit 1; }

# ── Add: seletivo se paths dados; senão add -A, mas nunca arrastar submódulo mexido ──
if [ "${#PATHS[@]}" -gt 0 ]; then
  git add -- "${PATHS[@]}"
else
  TOP="$(git rev-parse --show-toplevel)"
  if [ -f "$TOP/.gitmodules" ]; then
    dirty_subs="$(git config -f "$TOP/.gitmodules" --get-regexp 'path$' 2>/dev/null \
      | awk '{print $2}' | while IFS= read -r sm; do
          [ -n "$sm" ] && [ -n "$(git status --porcelain -- "$sm")" ] && echo "$sm"
        done)"
    if [ -n "$dirty_subs" ]; then
      echo "ship: repo com submódulo(s) mexido(s) — 'add -A' arrastaria pointers de Projetos/*." >&2
      echo "      Passe paths explícitos. Submódulos mexidos:" >&2
      printf '        %s\n' $dirty_subs >&2
      echo "      (pra reconciliar pointers: scripts/bump-submodules.sh)" >&2
      exit 1
    fi
  fi
  git add -A
fi

git diff --cached --quiet && { echo "ship: nada staged (paths não casaram?)." >&2; exit 1; }

# ── Branch: cria a partir de main/master; reusa se já numa feature branch ──
CUR="$(git symbolic-ref --short HEAD 2>/dev/null || echo detached)"
if [ "$CUR" = "main" ] || [ "$CUR" = "master" ]; then
  TYPE="$(printf '%s' "$MSG" | sed -nE 's/^([a-z]+)(\([^)]*\))?!?:.*/\1/p')"; TYPE="${TYPE:-chore}"
  SLUG="$(printf '%s' "$MSG" | sed -E 's/^[a-z]+(\([^)]*\))?!?:[[:space:]]*//' \
        | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed -E 's/^-+//; s/-+$//' | cut -c1-40)"
  BRANCH="${TYPE}/${SLUG:-change-$(date +%s)}"
  git checkout -b "$BRANCH"
else
  BRANCH="$CUR"
  echo "ship: já em '$BRANCH' — commitando nela."
fi

# ── Commit (override do pre-commit hook global que barra branch != main) ──
COMMIT_TO_NON_MAIN_OK=1 git commit -m "$MSG"

$PUSH || { echo "ship: --no-push — commit local em '$BRANCH'. Parei aqui."; exit 0; }

git push -u origin "$BRANCH"

# ── PR ──
PR_ARGS=(--fill --head "$BRANCH")
$DRAFT && PR_ARGS+=(--draft)
gh pr create "${PR_ARGS[@]}"
PR_URL="$(gh pr view "$BRANCH" --json url -q .url 2>/dev/null || echo '')"

# ── Auto-merge (opt-in) ──
if $MERGE; then
  if $DRAFT; then
    echo "ship: --draft + --merge não combinam; PR aberto como draft, sem auto-merge."
  elif gh pr merge "$BRANCH" --auto --squash 2>/dev/null; then
    echo "ship: auto-merge (squash) armado — mergeia quando o CI passar."
  else
    echo "ship: não consegui armar auto-merge (repo sem auto-merge habilitado?)." >&2
    echo "      Rode: scripts/setup-repo-pr-defaults.sh <owner/repo>" >&2
  fi
fi

echo "ship: PR → ${PR_URL:-(veja acima)}"
