#!/bin/zsh
# Supervisor do Remote Control no Mac (paridade com o VPS srv1465941).
#
# Mantém uma sessão tmux rodando o SUBCOMANDO `claude remote-control --spawn`
# (servidor persistente, não a flag `--remote-control` que só cria 1 sessão).
# É isso que registra o Mac como DEVICE em "Controle remoto" no app, capaz de
# spawnar novas sessões sob demanda (capacity 32). O launchd (LaunchAgent
# com.toto.claude-remote-control) chama este script no login e o reinicia via
# KeepAlive se o servidor cair.
#
# Editar DEVICE_NAME abaixo se quiser outro rótulo no app.

set -u

DEVICE_NAME="macbook-toto"
SESSION="rc-claude"
WORKDIR="/Users/lab/Claude"   # pasta já confiada — evita o prompt "trust this folder"

# --- health-check do WebSocket ---
# Vigia o estado do painel, não só a existência da sessão tmux: se o WS cair
# (device some do app) sem o processo morrer, recicla a sessão automaticamente.
GRACE_SECS=20        # espera pós-spawn pro WS conectar antes de começar a vigiar
CHECK_INTERVAL=30    # intervalo entre checagens de saúde
FAIL_THRESHOLD=3     # checagens SEGUIDAS sem "Connected" antes de reciclar (~90s de tolerância a reconnect)

# PATH explícito — launchd não herda o ambiente do shell interativo.
export PATH="/Users/lab/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="/Users/lab"

CLAUDE_BIN="$(command -v claude)"
TMUX_BIN="$(command -v tmux)"

if [[ -z "$CLAUDE_BIN" || -z "$TMUX_BIN" ]]; then
  echo "[$(date '+%F %T')] ERRO: claude ou tmux não encontrado no PATH" >&2
  exit 1
fi

log() { echo "[$(date '+%F %T')] $*" >&2; }

# (re)cria a sessão tmux se ainda não existir
if ! "$TMUX_BIN" has-session -t "$SESSION" 2>/dev/null; then
  log "iniciando tmux '$SESSION' -> claude remote-control --spawn same-dir --name '$DEVICE_NAME'"
  "$TMUX_BIN" new-session -d -s "$SESSION" -c "$WORKDIR" \
    "$CLAUDE_BIN remote-control --spawn same-dir --name \"$DEVICE_NAME\""
fi

# grace period: dá tempo do WS conectar antes de começar a vigiar o estado.
sleep "$GRACE_SECS"

# supervisão: mantém o job do launchd vivo enquanto a sessão existir E o painel
# mostrar "Connected". Se o WS cair sem o processo morrer (o painel deixa de
# mostrar "Connected" por FAIL_THRESHOLD checagens seguidas), recicla a sessão e
# sai — o KeepAlive do launchd recria tudo e reconecta. "Connected" (C maiúsculo)
# casa só o estado saudável, nunca "disconnected"/"Reconnecting"/"Connecting".
fails=0
while "$TMUX_BIN" has-session -t "$SESSION" 2>/dev/null; do
  pane="$("$TMUX_BIN" capture-pane -t "$SESSION" -p 2>/dev/null)"
  if print -r -- "$pane" | grep -q 'Connected'; then
    fails=0
  else
    fails=$((fails + 1))
    log "WS não-Connected ($fails/$FAIL_THRESHOLD) — última linha do painel: $(print -r -- "$pane" | grep -v '^[[:space:]]*$' | tail -1)"
    if (( fails >= FAIL_THRESHOLD )); then
      log "reciclando '$SESSION' — WS caiu sem o processo morrer (launchd vai recriar e reconectar)"
      "$TMUX_BIN" kill-session -t "$SESSION" 2>/dev/null
      break
    fi
  fi
  sleep "$CHECK_INTERVAL"
done

log "sessão '$SESSION' encerrada — saindo (launchd vai reiniciar)"
