#!/usr/bin/env bash
# work — cockpit de trabalho no herdr.
# Monta workspace(s) com pane1 = briefing de sessão + shell pronto pra `claude`,
# pane2 (split direita) = git status + tail de logs.
#
# Contextual ao diretório onde você roda:
#   work            estando DENTRO de um projeto  → abre só esse projeto
#                   estando numa raiz de projetos → abre todos os projetos dali (alfabético)
#                   em outro lugar                → abre todos os projetos conhecidos (alfabético)
#   work all        força todos os projetos conhecidos
#   work <projeto>  abre/foca UM projeto (fuzzy match no nome)
#   work swarm <proj> N   N git-worktrees isolados (hard-rule multi-agent+git=worktree)
#   work list       lista workspaces abertos
set -uo pipefail

YAML="$HOME/Claude/agent-orchestrator.yaml"

is_project() {  # path -> 0 se parece um projeto
  [ -d "$1/.git" ] || [ -f "$1/package.json" ] || [ -f "$1/pyproject.toml" ] || [ -f "$1/CLAUDE.md" ] || [ -f "$1/Cargo.toml" ] || [ -f "$1/go.mod" ]
}

# projetos conhecidos (AO yaml + extras), ordenados alfabeticamente por nome
known_projects() {
  { grep -E '^[[:space:]]+path:' "$YAML" 2>/dev/null | sed -E 's/.*path:[[:space:]]*//' | sed "s#^~#$HOME#"
    echo "$HOME/Claude/Projetos/Gordon-Gekko_Trader"
    echo "$HOME/Desktop/CIO-Booster"
  } | awk 'NF && !seen[$0]++' \
    | while IFS= read -r p; do [ -d "$p" ] && printf '%s\t%s\n' "$(basename "$p")" "$p"; done \
    | sort -f | cut -f2-
}

# subdiretórios de um dir que são projetos, ordenados por nome
child_projects() {  # dir
  for d in "$1"/*/; do d="${d%/}"; is_project "$d" && printf '%s\t%s\n' "$(basename "$d")" "$d"; done \
    | sort -f | cut -f2-
}

ensure_server() { herdr status 2>/dev/null | grep -q "status: running" || herdr server start --detach >/dev/null 2>&1; }

ws_id() {  # label -> workspace_id (vazio se não existe)
  herdr workspace list 2>/dev/null | python3 -c "
import json,sys
d=json.load(sys.stdin)['result']['workspaces']
print(next((w['workspace_id'] for w in d if w['label']==sys.argv[1]), ''))" "$1" 2>/dev/null
}

open_one() {  # path
  local p="$1"; [ -d "$p" ] || return 0
  local n; n="$(basename "$p")"
  if [ -n "$(ws_id "$n")" ]; then echo "  = $n (já aberto)"; return 0; fi
  local out pid
  out="$(herdr workspace create --cwd "$p" --label "$n" --no-focus --env HERDR_PANE_ROLE=brief 2>/dev/null)"
  pid="$(printf '%s' "$out" | python3 -c "import json,sys;print(json.load(sys.stdin)['result']['root_pane']['pane_id'])" 2>/dev/null)"
  [ -n "$pid" ] && herdr pane split "$pid" --direction right --ratio 0.26 --cwd "$p" --env HERDR_PANE_ROLE=gitlog --no-focus >/dev/null 2>&1
  echo "  + $n"
}

open_many() { while IFS= read -r p; do [ -n "$p" ] && open_one "$p"; done; }
focus_ws() { local id; id="$(ws_id "$(basename "$1")")"; [ -n "$id" ] && herdr workspace focus "$id" >/dev/null 2>&1; }

open_vps() {  # workspace VPS — 1 pane de saúde (status 3 services + erros), não firehose
  [ -n "$(ws_id VPS)" ] && { echo "  = VPS (já aberto)"; return 0; }
  herdr workspace create --cwd "$HOME" --label "VPS" --no-focus --env HERDR_PANE_ROLE=vps >/dev/null 2>&1 \
    && echo "  + VPS (saúde: 3 services + erros · dashboard via openclaw-dash)" \
    || echo "  ! VPS falhou"
}

ensure_server
cmd="${1:-home}"
case "$cmd" in
  home)
    if is_project "$PWD"; then
      echo "🐑 $(basename "$PWD") — abrindo só este projeto"
      open_one "$PWD"; open_vps; focus_ws "$PWD"
    elif [ -n "$(child_projects "$PWD")" ]; then
      echo "🐑 montando projetos em $(basename "$PWD")/…"
      child_projects "$PWD" | open_many; open_vps
      echo "pronto — ctrl+b w pra navegar."
    else
      echo "🐑 montando cockpit (todos os projetos)…"
      known_projects | open_many; open_vps
      echo "pronto — ctrl+b w pra navegar."
    fi
    ;;
  all)
    echo "🐑 todos os projetos conhecidos…"; known_projects | open_many; open_vps
    ;;
  list)
    herdr workspace list 2>/dev/null | python3 -c "import json,sys;[print(' •',w['label'],'('+w['agent_status']+')') for w in json.load(sys.stdin)['result']['workspaces']]" 2>/dev/null
    ;;
  swarm)
    proj="${2:?uso: work swarm <proj> <N>}"; n="${3:-3}"
    p="$(known_projects | grep -i "$proj" | head -1)"
    [ -d "$p" ] || { echo "projeto não encontrado: $proj"; exit 1; }
    base="$(basename "$p")"
    echo "🐑 swarm $base × $n — worktrees isolados (sua hard-rule, automática):"
    for i in $(seq 1 "$n"); do
      herdr worktree create --cwd "$p" --branch "swarm/$base-$i" --label "$base~$i" --no-focus >/dev/null 2>&1 \
        && echo "  + worktree $i  (branch swarm/$base-$i)" || echo "  ! falhou worktree $i"
    done
    ;;
  vps)
    echo "🛰️  abrindo VPS (OpenClaw)…"; open_vps
    id="$(ws_id VPS)"; [ -n "$id" ] && herdr workspace focus "$id" >/dev/null 2>&1
    ;;
  close|kill|x)
    proj="${2:?uso: work close <nome|VPS>}"
    id="$(ws_id "$proj")"                                 # tenta label exato
    [ -z "$id" ] && id="$(herdr workspace list 2>/dev/null | python3 -c "
import json,sys; n=sys.argv[1].lower()
print(next((w['workspace_id'] for w in json.load(sys.stdin)['result']['workspaces'] if n in w['label'].lower()), ''))" "$proj")"  # fuzzy
    [ -z "$id" ] && { echo "workspace não encontrado: $proj  (veja: work list)"; exit 1; }
    herdr workspace close "$id" >/dev/null 2>&1 && echo "✖ fechado: $proj" || echo "falhou fechar: $proj"
    ;;
  *)
    p="$(known_projects | grep -i "$cmd" | head -1)"
    [ -d "$p" ] || { echo "projeto não encontrado: $cmd"; exit 1; }
    open_one "$p"; focus_ws "$p"
    ;;
esac
