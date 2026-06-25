#!/usr/bin/env python3
"""
herdr-monitor-ensure — garante o LAYOUT FIXO de 3 panes em cada space, da esquerda
pra direita:  [ claude/brief | lazygit | monitor ]  com proporções normalizadas e
IGUAIS em todo space (≈ claude 42% · lazygit 32.5% · monitor 25.5% da área de panes;
a col "spaces+agents" é a sidebar nativa do herdr, ~13%).

Idempotente:
  • layout já certo (estrutura + proporções)  → no máximo religa processos que saíram
  • layout errado                              → rebuild (preserva o claude, recria os auxiliares)
Persistência: os panes auxiliares carregam HERDR_PANE_ROLE (lazygit/monitor), então o
zshrc os re-roda na recriação (inclusive pós-reboot). lazygit usa o cwd do repo do space.

Uso:
  herdr-monitor-ensure.py [workspace_id]   # sem arg = workspace FOCADO agora
  herdr-monitor-ensure.py --all            # aplica em TODOS os workspaces (one-shot/boot)
"""
import json
import os
import subprocess
import sys

COCKPIT = os.path.expanduser("~/Claude/scripts/herdr-agent-cockpit.py")
MARK = "herdr-agent-cockpit.py"
AGENTS = {"claude", "codex", "kimi", "pi", "copilot", "devin", "droid",
          "opencode", "kilo", "hermes", "qodercli", "cursor", "omp"}
SHELLS = {"zsh", "bash", "sh", "fish", "-zsh", "-bash", "login"}

RATIO_CLAUDE = 0.42      # split 1: claude fica com 42% da área; bloco lazy+monitor = 58%
RATIO_LAZY = 0.56        # split 2: lazygit = 56% do bloco (→ 32.5% da área), monitor = 25.5%
TARGETS = (0.42, 0.325, 0.255)   # proporções-alvo (claude, lazygit, monitor) na área de panes
TOL = 0.08                       # tolerância de proporção antes de re-normalizar


def sh(*args):
    try:
        return subprocess.run(["herdr", *args], capture_output=True, text=True, timeout=8).stdout
    except Exception:
        return ""


def jget(out, *path):
    try:
        d = json.loads(out)
        for k in path:
            d = d[k]
        return d
    except Exception:
        return None


def focused_ws():
    ws = jget(sh("workspace", "list"), "result", "workspaces") or []
    return next((w["workspace_id"] for w in ws if w.get("focused")), None)


def all_ws():
    ws = jget(sh("workspace", "list"), "result", "workspaces") or []
    return [w.get("workspace_id") for w in ws if w.get("workspace_id")]


def panes_ordered(wsid):
    ps = jget(sh("pane", "list", "--workspace", wsid), "result", "panes") or []
    if not ps:
        return []
    lay = jget(sh("pane", "layout", "--pane", ps[0]["pane_id"]), "result", "layout", "panes") or []
    xw = {p["pane_id"]: (p["rect"]["x"], p["rect"]["width"]) for p in lay}
    for p in ps:
        p["_x"], p["_w"] = xw.get(p["pane_id"], (0, 0))
    ps.sort(key=lambda p: p["_x"])
    return ps


def _fg(pid):
    return (jget(sh("pane", "process-info", "--pane", pid), "result", "process_info") or {}
            ).get("foreground_processes", [])


def classify(p):
    # 1) agente coding tem prioridade absoluta — o pane do claude/codex NUNCA é auxiliar
    if (p.get("agent") or "") in AGENTS:
        return "claude"
    fps = _fg(p["pane_id"])
    names = [(x.get("name") or "").lower().lstrip("-") for x in fps]
    # 2) monitor/lazygit detectados POR PROCESSO (não juntar cmdlines — evita falso-positivo
    #    de um prompt/editor que apenas MENCIONE 'herdr-agent-cockpit.py')
    for x in fps:
        nm = (x.get("name") or "").lower()
        cl = (x.get("cmdline") or "") + " " + " ".join(x.get("argv") or [])
        if "python" in nm and MARK in cl:
            return "monitor"
        if "lazygit" in nm:
            return "lazygit"
    blob = " ".join((x.get("cmdline") or "") for x in fps)
    if "claude" in blob or "codex" in blob:
        return "claude"
    if not fps or all(n in SHELLS for n in names):
        return "shell"
    return "busy"


def run_role(pid, role, wsid):
    cmd = "lazygit" if role == "lazygit" else f"python3 {COCKPIT} --workspace {wsid}"
    sh("pane", "run", pid, cmd)


def relayout(wsid):
    ps = panes_ordered(wsid)
    if not ps:
        return f"{wsid}: sem panes"
    kinds = [classify(p) for p in ps]
    tot = sum(p["_w"] for p in ps) or 1

    # CASO RÁPIDO: estrutura já é [base(claude-ou-shell) | lazygit-ou-shell | monitor-ou-shell].
    # O pane base (col2) pode ser shell quando o claude ainda não roda — não recebe processo.
    if (len(ps) == 3 and kinds[0] in ("claude", "shell")
            and kinds[1] in ("lazygit", "shell") and kinds[2] in ("monitor", "shell")):
        props = [p["_w"] / tot for p in ps]
        if all(abs(props[i] - TARGETS[i]) <= TOL for i in range(3)):
            religados = []
            if kinds[1] == "shell":
                run_role(ps[1]["pane_id"], "lazygit", wsid); religados.append("lazygit")
            if kinds[2] == "shell":
                run_role(ps[2]["pane_id"], "monitor", wsid); religados.append("monitor")
            return f"{wsid}: ok" + (f" (religado: {','.join(religados)})" if religados else " (skip)")
        # estrutura ok mas proporção fora → rebuild pra normalizar

    # REBUILD: preserva o claude/brief, fecha os auxiliares, recria lazygit+monitor com ratios
    base = next((p for p in ps if classify(p) == "claude"), ps[0])
    cwd = base.get("cwd") or os.path.expanduser("~")
    for p in ps:
        if p["pane_id"] != base["pane_id"] and classify(p) in ("monitor", "lazygit", "shell"):
            sh("pane", "close", p["pane_id"])
    laz = jget(sh("pane", "split", base["pane_id"], "--direction", "right", "--ratio", str(RATIO_CLAUDE),
                  "--cwd", cwd, "--env", "HERDR_PANE_ROLE=lazygit", "--no-focus"),
               "result", "pane", "pane_id")
    if not laz:
        return f"{wsid}: falhou criar pane lazygit"
    mon = jget(sh("pane", "split", laz, "--direction", "right", "--ratio", str(RATIO_LAZY),
                  "--cwd", cwd, "--env", "HERDR_PANE_ROLE=monitor", "--env", f"HERDR_WS={wsid}", "--no-focus"),
               "result", "pane", "pane_id")
    return f"{wsid}: relayout [claude | lazygit | monitor]" + ("" if mon else " (monitor falhou)")


def main():
    args = sys.argv[1:]
    if "--all" in args:
        targets = all_ws()
    elif args:
        targets = [args[0]]
    else:
        w = focused_ws()
        targets = [w] if w else []
    if not targets:
        print("sem workspace alvo")
        return
    for w in targets:
        print(relayout(w))


if __name__ == "__main__":
    main()
