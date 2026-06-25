#!/usr/bin/env python3
"""
herdr-sort-spaces — reordena os workspaces do herdr (session.json) em ordem alfabética
pelo nome exibido (custom_name), recalculando active/selected por id.

DEVE rodar ANTES do server herdr iniciar (via wrapper no LaunchAgent dev.herdr.server).
Fail-safe: aborta se o server estiver vivo (nunca edita estado em uso). Atômico + backup.

Uso:
  herdr-sort-spaces.py            # reordena (só se server parado)
  herdr-sort-spaces.py --dry-run  # mostra a ordem resultante, não escreve
"""
import json
import locale
import os
import shutil
import socket
import sys

DRY = "--dry-run" in sys.argv
HOME = os.path.expanduser("~")
SESSION = os.path.join(HOME, ".config/herdr/session.json")
SOCK = os.path.join(HOME, ".config/herdr/herdr.sock")


def server_alive():
    if not os.path.exists(SOCK):
        return False
    try:
        s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        s.settimeout(0.3)
        s.connect(SOCK)
        s.close()
        return True
    except Exception:
        return False


def name(w):
    return (w.get("custom_name")
            or os.path.basename((w.get("identity_cwd") or "").rstrip("/"))
            or w.get("id") or "")


def main():
    if not DRY and server_alive():
        print("herdr server vivo — abortando (rode só antes do server iniciar)", file=sys.stderr)
        return
    try:
        raw = open(SESSION, encoding="utf-8").read()
        d = json.loads(raw)
    except Exception as e:
        print(f"session.json ilegível: {e}", file=sys.stderr)
        return

    ws = d.get("workspaces")
    if not isinstance(ws, list) or not ws:
        return

    def id_at(idx):
        return ws[idx].get("id") if isinstance(idx, int) and 0 <= idx < len(ws) else None
    active_id, selected_id = id_at(d.get("active")), id_at(d.get("selected"))

    try:
        locale.setlocale(locale.LC_COLLATE, "")
        key = lambda w: locale.strxfrm(name(w))
    except Exception:
        key = lambda w: name(w).casefold()

    # home (~ cru, sem custom_name) fica fixo no topo; o resto alfabético
    home_cwd = os.path.realpath(HOME)
    def is_home(w):
        cwd = w.get("identity_cwd") or ""
        try:
            same = os.path.realpath(os.path.expanduser(cwd)) == home_cwd
        except Exception:
            same = False
        return same and not w.get("custom_name")
    pinned = sorted([w for w in ws if is_home(w)], key=key)
    ordered = pinned + sorted([w for w in ws if not is_home(w)], key=key)

    if [w.get("id") for w in ws] == [w.get("id") for w in ordered]:
        print("já em ordem alfabética")
        return

    d["workspaces"] = ordered
    ids = [w.get("id") for w in ordered]
    if active_id in ids:
        d["active"] = ids.index(active_id)
    if selected_id in ids:
        d["selected"] = ids.index(selected_id)

    if DRY:
        print("--- nova ordem (dry-run, nada escrito) ---")
        for i, w in enumerate(ordered):
            star = "  <ACTIVE>" if i == d.get("active") else ""
            print(f"  {i:2} {name(w)}{star}")
        return

    indent = 2 if raw.lstrip()[:2] == "{\n" else None
    shutil.copyfile(SESSION, SESSION + ".bak")
    tmp = SESSION + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(d, fh, ensure_ascii=False, indent=indent)
    os.replace(tmp, SESSION)
    print("workspaces reordenados alfabeticamente")


if __name__ == "__main__":
    main()
