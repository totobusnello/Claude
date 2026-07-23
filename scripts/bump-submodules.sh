#!/usr/bin/env bash
# bump-submodules.sh — reconcilia os pointers de submódulo do umbrella (~/Claude).
#
# Divisão de trabalho (não confundir):
#   - TRABALHO dentro de um submódulo  → cd Projetos/<x> && ship "..."  (PR no repo do submódulo)
#   - POINTER do submódulo no umbrella → este script
#   - Rotina semanal automática        → sync-all-repos.sh (launchd, domingo 23h)
#
# Sem flags = AUDITORIA (read-only): mostra, por submódulo, o estado do tree, se o
# HEAD local já está pushado, e se o pointer registrado no umbrella está stale.
#   --bump  = pros submódulos LIMPOS cujo HEAD já está pushado e cujo pointer está
#             stale, faz `git add <path>` e um único commit no umbrella. NÃO toca
#             submódulo dirty (esse é trabalho pro ship, rodado dentro dele).
#   --push  = com --bump, também pusha o commit do umbrella (só se em main).
#
# Uso:
#   bump-submodules.sh                 # auditoria
#   bump-submodules.sh --bump          # reconcilia pointers pushados, commit local
#   bump-submodules.sh --bump --push
#
# NB: sem `-e`/`-u` (macOS bash 3.2 + git != 0 por submódulo não deve matar o loop).
set -o pipefail

BASE_DIR="${HOME}/Claude"
BUMP=false; PUSH=false
for a in "$@"; do
  case "$a" in
    --bump) BUMP=true ;;
    --push) PUSH=true ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "bump-submodules: arg desconhecido: $a" >&2; exit 2 ;;
  esac
done

[ -f "$BASE_DIR/.gitmodules" ] || { echo "bump-submodules: $BASE_DIR/.gitmodules não existe." >&2; exit 1; }

submodule_paths() {
  git config -f "$BASE_DIR/.gitmodules" --get-regexp 'path$' 2>/dev/null | awk '{print $2}'
}

staged_any=false
echo "Submódulos de $BASE_DIR:"
printf '%-34s %-7s %-8s %s\n' "PATH" "TREE" "PUSHED" "POINTER"
printf '%-34s %-7s %-8s %s\n' "----" "----" "------" "-------"

while IFS= read -r path; do
  [ -n "$path" ] || continue
  sub="$BASE_DIR/$path"
  if [ ! -e "$sub/.git" ]; then
    printf '%-34s %s\n' "$path" "(não inicializado)"; continue
  fi

  if [ -n "$(git -C "$sub" status --porcelain 2>/dev/null)" ]; then tree="dirty"; else tree="clean"; fi

  head="$(git -C "$sub" rev-parse HEAD 2>/dev/null)"
  up="$(git -C "$sub" rev-parse '@{u}' 2>/dev/null || echo '')"
  if [ -n "$up" ] && [ "$head" = "$up" ]; then pushed="yes"; else pushed="no"; fi

  reg="$(git -C "$BASE_DIR" ls-files --stage -- "$path" | awk '{print $2; exit}')"
  if [ "$reg" = "$head" ]; then ptr="up-to-date"; else ptr="STALE"; fi

  printf '%-34s %-7s %-8s %s\n' "$path" "$tree" "$pushed" "$ptr"

  if $BUMP && [ "$tree" = "clean" ] && [ "$pushed" = "yes" ] && [ "$ptr" = "STALE" ]; then
    git -C "$BASE_DIR" add -- "$path" && staged_any=true
    echo "    → staged bump: ${reg:0:8} → ${head:0:8}"
  elif $BUMP && [ "$ptr" = "STALE" ]; then
    echo "    → pulado (precisa tree=clean + pushed=yes; hoje tree=$tree pushed=$pushed)"
  fi
done < <(submodule_paths)

if ! $BUMP; then
  echo; echo "Auditoria só. Rode com --bump pra reconciliar os pointers já pushados."
  echo "Submódulo dirty? Entre nele e rode ship: cd Projetos/<x> && ship \"...\""
  exit 0
fi

if ! $staged_any; then
  echo; echo "Nada pra bumpar (nenhum pointer stale de submódulo já pushado)."; exit 0
fi

BR="$(git -C "$BASE_DIR" symbolic-ref --short HEAD 2>/dev/null || echo main)"
COMMIT_TO_NON_MAIN_OK=1 git -C "$BASE_DIR" commit -m "chore(submodules): bump pointers pushados" || exit 1
echo "Commit de bump criado em '$BR'."

if $PUSH; then
  if [ "$BR" = "main" ]; then
    git -C "$BASE_DIR" push origin "$BR" && echo "Pushed."
  else
    echo "Não pushei: branch '$BR' != main. Abra PR (ou rode ship no umbrella)."
  fi
fi
