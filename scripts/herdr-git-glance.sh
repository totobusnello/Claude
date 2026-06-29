#!/usr/bin/env bash
# herdr-git-glance — painel ENXUTO de sincronização git por space (col3 do cockpit).
#
# Mostra SÓ o que importa pra decidir a próxima ação — NÃO o histórico inteiro:
#   • STATUS grande:  ↑ PRA SUBIR (push)  ·  ↓ PRA DESCER (pull)  ·  ⇅ DIVERGIU  ·  ✓ EM DIA
#   • TODOS os commits ahead/behind (cap 40 só pra não estourar) — você VÊ os commits pendentes
#   • working tree (modificados)  • a AÇÃO clara em cada caso
#
# NÃO faz fetch automático → não dispara o prompt TCC/Keychain do macOS ("acessar dados de
# outros apps"). O ahead/behind é lido do remote-tracking ref LOCAL (sem rede). Fetch só na tecla [f].
#
# Teclas:  P push · p pull(--ff-only) · f fetch · r refresh · g lazygit cheio · q shell livre
# Redesenho IN-PLACE (cursor pro topo + sobrescreve) → não pisca. Auto-refresh a cada 15s.
set -uo pipefail
export GIT_OPTIONAL_LOCKS=0

c_reset=$'\033[0m'; c_dim=$'\033[2m'; c_b=$'\033[1m'
c_up=$'\033[32m'; c_down=$'\033[33m'; c_red=$'\033[31m'; c_cyan=$'\033[36m'; c_gray=$'\033[90m'

# render() APENAS ecoa o frame (sem clear). O loop pinta in-place pra não piscar.
render() {
  local root branch up ahead behind dirty
  root="$(git rev-parse --show-toplevel 2>/dev/null)"
  if [ -z "$root" ]; then
    printf "\n  %s(sem repo git aqui)%s\n\n  %spasta: %s%s\n" "$c_dim" "$c_reset" "$c_gray" "$PWD" "$c_reset"
    printf "\n%s  [r]↻  [q]shell%s\n" "$c_gray" "$c_reset"
    return
  fi
  branch="$(git symbolic-ref --short HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)"
  up="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"
  dirty="$(git status --porcelain 2>/dev/null | grep -c . || true)"

  printf "%s╭─ %s%s%s · %s%s%s ─────%s\n\n" \
    "$c_cyan" "$c_b" "$(basename "$root")" "$c_reset" "$c_cyan" "$branch" "$c_reset" "$c_reset"

  if [ -z "$up" ]; then
    printf "  %s%s⚠ SEM UPSTREAM%s — a branch local não rastreia um remote\n" "$c_b" "$c_red" "$c_reset"
    printf "  %s→ git push -u origin %s%s\n" "$c_b" "$branch" "$c_reset"
  else
    ahead="$(git rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)"; ahead="${ahead:-0}"
    behind="$(git rev-list --count 'HEAD..@{u}' 2>/dev/null || echo 0)"; behind="${behind:-0}"

    # ── STATUS grande (responde "pra frente ou pra trás?" de imediato) ──
    if [ "$ahead" -gt 0 ] && [ "$behind" -gt 0 ]; then
      printf "  %s%s⇅ DIVERGIU%s  (↑%s ↓%s)        %s→ git pull --rebase, depois push%s\n" \
        "$c_b" "$c_red" "$c_reset" "$ahead" "$behind" "$c_b" "$c_reset"
    elif [ "$ahead" -gt 0 ]; then
      printf "  %s%s↑ PRA SUBIR%s  (%s commit(s))      %s→ git push  [tecla P]%s\n" \
        "$c_b" "$c_up" "$c_reset" "$ahead" "$c_b" "$c_reset"
    elif [ "$behind" -gt 0 ]; then
      printf "  %s%s↓ PRA DESCER%s (%s commit(s))      %s→ git pull  [tecla p]%s\n" \
        "$c_b" "$c_down" "$c_reset" "$behind" "$c_b" "$c_reset"
    else
      printf "  %s✓ EM DIA%s com %s\n" "$c_up" "$c_reset" "$up"
    fi
    echo

    # ── TODOS os commits pendentes (ahead/behind) — não o histórico já sincronizado.
    #    cap de 40 só pra não estourar a tela num clone fresco (raro); mostra "+N mais".
    if [ "$ahead" -gt 0 ]; then
      printf "  %s↑ a subir (todos os %s):%s\n" "$c_up" "$ahead" "$c_reset"
      git --no-pager log --oneline '@{u}..HEAD' 2>/dev/null | head -40 | sed "s/^/    ${c_up}•${c_reset} /"
      [ "$ahead" -gt 40 ] && printf "    %s… +%s mais%s\n" "$c_dim" "$((ahead - 40))" "$c_reset"
    fi
    if [ "$behind" -gt 0 ]; then
      printf "  %s↓ a descer (todos os %s):%s\n" "$c_down" "$behind" "$c_reset"
      git --no-pager log --oneline 'HEAD..@{u}' 2>/dev/null | head -40 | sed "s/^/    ${c_down}•${c_reset} /"
      [ "$behind" -gt 40 ] && printf "    %s… +%s mais%s\n" "$c_dim" "$((behind - 40))" "$c_reset"
    fi
  fi
  echo

  # ── working tree ──
  if [ "${dirty:-0}" -gt 0 ]; then
    printf "  %s● %s modificado(s)%s no working tree   %s→ commit: g → espaço(stage)/a → c(msg)%s\n" \
      "$c_red" "$dirty" "$c_reset" "$c_dim" "$c_reset"
    git --no-pager status --porcelain 2>/dev/null | head -6 | sed "s/^/    /"
  else
    printf "  %s✓ working tree limpo%s\n" "$c_dim" "$c_reset"
  fi

  printf "\n%s  [P]push  [p]pull  [f]fetch  [r]↻ agora  [g]lazygit (q lá volta aqui)  [q]shell%s\n" "$c_gray" "$c_reset"
}

pause() { printf "\n%s[enter para voltar]%s" "$c_gray" "$c_reset"; read -r _; }

printf '\033[2J\033[H'   # clear uma única vez na entrada
while true; do
  frame="$(render)"
  frame="${frame//$'\n'/$'\033[K'$'\n'}"        # clear-to-EOL em cada linha → sem resíduo lateral
  printf '\033[H%s\033[K\033[J' "$frame"         # cursor topo + sobrescreve + limpa o que sobrou abaixo
  # re-render a cada 15s OU assim que uma tecla for apertada
  if read -rsn1 -t 15 key 2>/dev/null; then
    case "$key" in
      P) printf '\033[2J\033[H'; echo "→ git push…";          git push;            pause ;;
      p) printf '\033[2J\033[H'; echo "→ git pull --ff-only…"; git pull --ff-only;  pause ;;
      f) printf '\033[2J\033[H'; echo "→ git fetch…";          git fetch;           pause ;;
      g) command -v lazygit >/dev/null && lazygit || { echo "lazygit não instalado"; pause; }
         printf '\033[2J\033[H' ;;   # ao sair do lazygit (q), limpa e o loop repinta o painel
      r) : ;;   # refresh imediato (cai fora do read → re-render no topo do loop)
      q) printf '\033[2J\033[H'; break ;;   # shell livre (o zshrc desfaz o role ao sair)
      *) : ;;
    esac
  fi
done
