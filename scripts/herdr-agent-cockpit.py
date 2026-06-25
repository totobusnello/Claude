#!/usr/bin/env python3
"""
herdr-agent-cockpit — painel ao vivo dos workspaces ATIVOS: tasks + agentes/subagentes + modelo.
Feito pra rodar num pane (ex: o split da direita do herdr).

Uso:
  python3 herdr-agent-cockpit.py [intervalo_seg]   # default 4s, ctrl+c sai
  python3 herdr-agent-cockpit.py --once            # imprime 1x e sai (teste)

Mostra só workspaces working/blocked (idle vira rodapé). Por workspace:
  - branch + contexto% + harness/modelo do agente principal
  - tasks com status (✔ feito / ▶ fazendo+progresso / ☐ a fazer)
  - árvore de agentes (⏺ main → ◯ subagente) com harness, modelo (quando exposto), tempo e tokens

Fonte: `herdr agent list` (status/harness) + `herdr agent read --source recent` (render do pane).
"""
import json
import os
import re
import subprocess
import sys
import time

_argv = sys.argv[1:]
ONCE = "--once" in _argv
WS = None
if "--workspace" in _argv:
    _i = _argv.index("--workspace")
    WS = _argv[_i + 1] if _i + 1 < len(_argv) else None
    _argv = _argv[:_i] + _argv[_i + 2:]
_pos = [a for a in _argv if not a.startswith("-")]
INTERVAL = float(_pos[0]) if _pos else 4.0

R, B, DIM = "\033[0m", "\033[1m", "\033[2m"
GRN, YEL, GRY, CYA, MAG, RED = "\033[32m", "\033[33m", "\033[90m", "\033[36m", "\033[35m", "\033[31m"
C = {"working": GRN, "blocked": RED, "unknown": YEL, "idle": GRY}

DONE, PROG, TODO = set("✔✓☑"), set("◼■▸▶"), set("◻☐□")

TASK_RE = re.compile(r"^[\s⎿│]*([✔✓☑◼■◻☐□▸▶])\s*Task\s*(\d+)\s*[:.\-]?\s*(.*)$")
CUR_RE = re.compile(r"^\s*▸\s*Task\s*(\d+).*?\((\d+/\d+)\)")
AGENT_RE = re.compile(r"^\s*([⏺◯◐])\s*(.+?)\s*$")
GIT_RE = re.compile(r"git:\(([^)]+)\)")
CTX_RE = re.compile(r"Context\s+\S*\s*(\d+)%")
COLLAPSE_RE = re.compile(r"…\s*\+\d+\s+(?:completed|pending|concluíd\w+|tasks?)\b")
NM_RE = re.compile(r"\s*\(\d+/\d+\)\s*$")
MODEL_MAIN_RE = re.compile(r"\[([A-Z][a-zA-Z]+\s[\d.]+)[^\]]*\|")          # [Opus 4.8 (1M) | API]
AGENT_DONE_RE = re.compile(r"Agent\((.+?)\)\s+(Haiku|Sonnet|Opus|Fable|GPT|Kimi)[\s\w.]*", re.I)
SUBLINE_RE = re.compile(r"^(\S+)\s{2,}(.+?)\s{2,}(.+·.+)$")               # type  desc  tempo · tokens


def sh(cmd):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=5).stdout
    except Exception:
        return ""


def agents():
    try:
        return json.loads(sh(["herdr", "agent", "list"]))["result"]["agents"]
    except Exception:
        return []


def read_recent(tid, lines=50):
    out = sh(["herdr", "agent", "read", tid, "--source", "recent", "--lines", str(lines), "--format", "text"])
    try:
        return json.loads(out)["result"]["read"]["text"]
    except Exception:
        return ""


def harness_of(subtype):
    s = subtype.lower()
    if s.startswith("kimi") or ":kimi" in s:
        return "kimi"
    if "codex" in s:
        return "codex"
    return "claude"


def parse(text):
    tasks, progress, agent_lines = {}, {}, []
    branch = ctx = collapsed = model_main = None
    amodels = {}        # desc -> "Sonnet 4.6" (subagentes que já completaram)
    in_agents = False

    for ln in text.splitlines():
        if model_main is None:
            mm = MODEL_MAIN_RE.search(ln)
            if mm:
                model_main = mm.group(1)
        if branch is None:
            g = GIT_RE.search(ln)
            if g:
                branch = g.group(1)
        if ctx is None:
            cx = CTX_RE.search(ln)
            if cx:
                ctx = cx.group(1)
        for ad in AGENT_DONE_RE.finditer(ln):
            amodels[ad.group(1).strip()] = ad.group(0).split(")", 1)[1].strip()
        if COLLAPSE_RE.search(ln):
            collapsed = COLLAPSE_RE.search(ln).group(0).strip()

        m = TASK_RE.match(ln)
        if m:
            sym, num, content = m.group(1), int(m.group(2)), NM_RE.sub("", m.group(3).strip()).strip()
            st = "done" if sym in DONE else "prog" if sym in PROG else "todo"
            prev = tasks.get(num)
            if not prev or (prev[0] != "done" and content):
                tasks[num] = (st, content or (prev[1] if prev else ""))

        c = CUR_RE.match(ln)
        if c:
            progress[int(c.group(1))] = c.group(2)

        a = AGENT_RE.match(ln)
        if a and a.group(1) == "⏺" and a.group(2).strip() == "main":
            in_agents, agent_lines = True, []
        if in_agents:
            am = AGENT_RE.match(ln)
            if am:
                agent_lines.append((am.group(1), re.sub(r"\s{2,}", "  ", am.group(2).strip())))

    return tasks, progress, agent_lines, branch, ctx, collapsed, model_main, amodels


def fmt_agent(sym, txt, harness_main, model_main, amodels):
    if txt == "main":
        tag = f"{MAG}{harness_main}{R}" + (f" {DIM}{model_main}{R}" if model_main else "")
        return f"    {B}{sym}{R} {B}main{R}  {tag}"
    m = SUBLINE_RE.match(txt)
    if m:
        stype, desc, metrics = m.group(1), m.group(2), m.group(3)
    else:
        stype, desc, metrics = txt.split("  ", 1)[0], txt, ""
    h = harness_of(stype)
    # modelo Claude do subagente: só conhecido se já tiver completado uma vez
    model = ""
    for d, mod in amodels.items():
        if desc.startswith(d[:24]) or d.startswith(desc[:24]):
            model = mod
            break
    tag = f"{MAG}{h}{R}" + (f" {DIM}{model}{R}" if model else "")
    line = f"    {GRN}{sym}{R} {CYA}{stype}{R} {tag}  {desc}"
    if metrics:
        line += f"  {DIM}{metrics}{R}"
    return line


def render():
    ags = agents()
    if WS:
        ags = [a for a in ags if a.get("workspace_id") == WS]
    ags.sort(key=lambda x: os.path.basename((x.get("cwd") or "").rstrip("/")).lower())
    if WS:
        active, idle = ags, []            # escopo do workspace: mostra só este projeto (working ou idle)
    else:
        active = [a for a in ags if a.get("agent_status") in ("working", "blocked")]
        idle = [os.path.basename((a.get("cwd") or "").rstrip("/")) for a in ags if a.get("agent_status") == "idle"]

    scope = f" · {os.path.basename((ags[0].get('cwd') or '').rstrip('/'))}" if (WS and ags) else ""
    out = [f"{B}herdr · cockpit{scope}{R}  {DIM}{time.strftime('%H:%M:%S')} · refresh {INTERVAL:.0f}s · ctrl+c{R}", ""]
    if not active:
        out.append(f"  {DIM}(nenhum agente ativo){R}")

    for a in active:
        name = os.path.basename((a.get("cwd") or "").rstrip("/")) or "?"
        st = a.get("agent_status")
        harness_main = a.get("agent") or "claude"
        c = C.get(st, "")
        tid = a.get("terminal_id") or a.get("pane_id") or ""
        tasks, progress, agent_lines, branch, ctx, collapsed, model_main, amodels = parse(read_recent(tid))

        meta = []
        if branch:
            meta.append(f"{CYA}{branch}{R}")
        if ctx:
            meta.append(f"{DIM}ctx {ctx}%{R}")
        meta.append(f"{MAG}{harness_main}{R}" + (f" {DIM}{model_main}{R}" if model_main else ""))
        out.append(f"{c}●{R} {B}{name}{R}  {c}{st}{R}  " + " · ".join(meta))

        for num in sorted(tasks):
            stt, content = tasks[num]
            mark, col = ("✔", GRY) if stt == "done" else ("▶", GRN) if stt == "prog" else ("☐", DIM)
            prog = f"  {YEL}({progress[num]}){R}" if num in progress else ""
            out.append(f"    {col}{mark} Task {num}{R}  {content}{prog}")
        if collapsed:
            out.append(f"    {DIM}{collapsed}{R}")

        if agent_lines:
            out.append(f"    {DIM}─ agentes ─{R}")
            for sym, txt in agent_lines:
                out.append(fmt_agent(sym, txt, harness_main, model_main, amodels))
        out.append("")

    if idle:
        out.append(f"{DIM}💤 idle ({len(idle)}): {', '.join(idle)}{R}")
    return "\n".join(out)


def main():
    if ONCE:
        print(render())
        return
    try:
        while True:
            o = render()
            sys.stdout.write("\033[2J\033[H")
            sys.stdout.write(o + "\n")
            sys.stdout.flush()
            time.sleep(INTERVAL)
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
