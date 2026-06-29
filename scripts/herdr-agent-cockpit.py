#!/usr/bin/env python3
"""
herdr-agent-cockpit — painel ao vivo dos workspaces ATIVOS: tasks + agentes/subagentes + modelo.
Feito pra rodar num pane (ex: o split da direita do herdr).

Uso:
  python3 herdr-agent-cockpit.py [intervalo_seg]   # default 4s, ctrl+c sai
  python3 herdr-agent-cockpit.py --once            # imprime 1x e sai (teste)

Mostra todos os workspaces com sessão (working/blocked primeiro, idle depois). Por workspace:
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

# badge git por space: ●dirty ↑ahead ↓behind ⚠conflito. cache leve p/ não pesar o refresh.
_BADGE_CACHE = {}        # path -> (expiry_ts, badge_str)
BADGE_TTL = 8.0          # recalcula no máx a cada 8s por path (2× o refresh default)

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


def git_out(path, *args):
    try:
        # GIT_OPTIONAL_LOCKS=0: o monitor é read-only — não disputar o index.lock com lazygit/commits
        # (o space "scripts" é subdir de ~/Claude, então o git aqui mexeria no repo pai).
        env = {**os.environ, "GIT_OPTIONAL_LOCKS": "0"}
        r = subprocess.run(["git", "-C", path, *args], capture_output=True, text=True, timeout=4, env=env)
        return r.stdout if r.returncode == 0 else ""
    except Exception:
        return ""


def git_badge(path):
    """Badge compacto do estado git do space: ●dirty ↑ahead ↓behind ⚠conflito (cache TTL)."""
    if not path:
        return ""
    now = time.time()
    hit = _BADGE_CACHE.get(path)
    if hit and hit[0] > now:
        return hit[1]
    parts = []
    dirty = sum(1 for l in git_out(path, "status", "--porcelain").splitlines() if l.strip())
    if dirty:
        parts.append(f"{YEL}●{dirty}{R}")
    ab = git_out(path, "rev-list", "--left-right", "--count", "@{u}...HEAD").split()
    if len(ab) == 2:                              # sem upstream → lista vazia, não quebra
        behind, ahead = ab[0], ab[1]
        if ahead != "0":
            parts.append(f"{GRN}↑{ahead}{R}")
        if behind != "0":
            parts.append(f"{CYA}↓{behind}{R}")
    if git_out(path, "diff", "--name-only", "--diff-filter=U").strip():
        parts.append(f"{RED}⚠{R}")
    badge = " ".join(parts)
    _BADGE_CACHE[path] = (now + BADGE_TTL, badge)
    return badge


def git_changes(path, n=10):
    """Linhas de `git status -s` (até n) + total — dá 'vida' ao painel mesmo com o agente idle."""
    lines = [l for l in git_out(path, "status", "-s").splitlines() if l.strip()]
    return lines[:n], len(lines)


_PROTECTED = tuple(os.path.expanduser(p) for p in ("~/Desktop", "~/Documents", "~/Downloads", "~/Library"))


def is_protected(path):
    """True se path está sob pasta protegida pelo TCC do macOS. Evita rodar git em loop lá —
    senão o macOS fica pedindo 'iTerm deseja acessar dados de outros apps' a cada refresh."""
    if not path:
        return False
    rp = os.path.realpath(path)
    return any(rp == p or rp.startswith(p + os.sep) for p in _PROTECTED)


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
    all_ags = agents()
    ags = [a for a in all_ags if a.get("workspace_id") == WS] if WS else list(all_ags)
    # working/blocked primeiro, idle depois; dentro de cada grupo, por nome do projeto
    rank = {"working": 0, "blocked": 0, "unknown": 1, "idle": 2}
    ags.sort(key=lambda x: (rank.get(x.get("agent_status"), 1),
                            os.path.basename((x.get("cwd") or "").rstrip("/")).lower()))

    scope = f" · {os.path.basename((ags[0].get('cwd') or '').rstrip('/'))}" if (WS and ags) else ""
    out = [f"{B}herdr · cockpit{scope}{R}  {DIM}{time.strftime('%H:%M:%S')} · refresh {INTERVAL:.0f}s · ctrl+c{R}", ""]
    if not ags:
        out.append(f"  {DIM}(nenhum agente){R}")

    for a in ags:
        name = os.path.basename((a.get("cwd") or "").rstrip("/")) or "?"
        st = a.get("agent_status")
        harness_main = a.get("agent") or "claude"
        c = C.get(st, "")
        tid = a.get("terminal_id") or a.get("pane_id") or ""
        tasks, progress, agent_lines, branch, ctx, collapsed, model_main, amodels = parse(read_recent(tid))

        cwd = a.get("cwd") or ""
        prot = is_protected(cwd)
        badge = git_badge(cwd) if (cwd and not prot) else ""
        meta = []
        if branch and badge:
            meta.append(f"{CYA}{branch}{R} {badge}")
        elif branch:
            meta.append(f"{CYA}{branch}{R}")
        elif badge:
            meta.append(badge)
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

        # git de relance — pulado em pastas protegidas (TCC) p/ não disparar o prompt do macOS
        if prot:
            out.append(f"    {DIM}─ git ─ (pasta protegida — git desligado p/ evitar prompt do macOS){R}")
        elif cwd:
            changes, total = git_changes(cwd)
            out.append(f"    {DIM}─ git ─{R}")
            if changes:
                for cl in changes:
                    xy = cl[:2]
                    col = RED if "U" in xy else (GRN if xy[:1] in ("A",) else (GRY if "?" in xy else YEL))
                    out.append(f"    {col}{cl}{R}")
                if total > len(changes):
                    out.append(f"    {DIM}… +{total - len(changes)} arquivo(s){R}")
            else:
                out.append(f"    {GRY}working tree limpo{R}")
        out.append("")

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
