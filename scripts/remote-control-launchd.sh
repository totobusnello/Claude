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

# PATH explícito — launchd não herda o ambiente do shell interativo.
export PATH="/Users/lab/.local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="/Users/lab"

CLAUDE_BIN="$(command -v claude)"
TMUX_BIN="$(command -v tmux)"

if [[ -z "$CLAUDE_BIN" || -z "$TMUX_BIN" ]]; then
  echo "[$(date '+%F %T')] ERRO: claude ou tmux não encontrado no PATH" >&2
  exit 1
fi

# (re)cria a sessão tmux se ainda não existir
if ! "$TMUX_BIN" has-session -t "$SESSION" 2>/dev/null; then
  echo "[$(date '+%F %T')] iniciando tmux '$SESSION' -> claude remote-control --spawn same-dir --name '$DEVICE_NAME'" >&2
  "$TMUX_BIN" new-session -d -s "$SESSION" -c "$WORKDIR" \
    "$CLAUDE_BIN remote-control --spawn same-dir --name \"$DEVICE_NAME\""
fi

# segura o job do launchd vivo enquanto a sessão existir.
# quando a sessão morrer, o script sai e o KeepAlive do launchd recria tudo.
while "$TMUX_BIN" has-session -t "$SESSION" 2>/dev/null; do
  sleep 30
done

echo "[$(date '+%F %T')] sessão '$SESSION' encerrada — saindo (launchd vai reiniciar)" >&2
