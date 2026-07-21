#!/usr/bin/env python3
"""
redact-secrets-from-transcripts — remove valores de secrets dos transcripts do Claude Code.

Problema que resolve: toda vez que um arquivo com credenciais (ex: ~/.zshrc) é lido ou
grepado numa sessão, os valores entram no transcript .jsonl — que fica em disco
indefinidamente, com permissão normal de usuário. Mover o secret pra chmod 600 depois
NÃO limpa essas cópias.

O que faz: para cada valor em ~/.config/secrets/*, procura ocorrências literais nos
transcripts e substitui por <REDACTED-NOME_DA_VAR>.

Garantias:
  - só reescreve se TODAS as linhas continuarem JSON válido após a substituição
  - escrita atômica (tmp + os.replace) — nunca deixa arquivo meio-escrito
  - preserva mtime/permissões originais
  - --dry-run por padrão; exige --apply pra escrever de verdade
  - nunca imprime valores de secret, só nomes e contagens

Uso:
    python3 redact-secrets-from-transcripts.py            # dry-run: mostra o que faria
    python3 redact-secrets-from-transcripts.py --apply    # executa

Criado 2026-07-20 após 8 chaves serem encontradas em 9 transcripts.
"""
import os, glob, json, shutil, sys

SECRETS_DIR = os.path.expanduser("~/.config/secrets")
MIN_LEN = 12  # abaixo disso o valor é curto demais e arrisca falso-positivo


def load_secrets():
    out = {}
    for f in glob.glob(os.path.join(SECRETS_DIR, "*")):
        if not os.path.isfile(f):
            continue
        v = open(f, encoding="utf-8").read().strip()
        if len(v) >= MIN_LEN:
            out[os.path.basename(f)] = v
    # maior primeiro: impede que um valor prefixo de outro corrompa a substituição
    return sorted(out.items(), key=lambda kv: -len(kv[1]))


def targets():
    pats = [
        "~/.claude/projects/*/*.jsonl",
        "~/.claude/projects/*/tool-results/*",
    ]
    seen = []
    for p in pats:
        seen += [t for t in glob.glob(os.path.expanduser(p)) if os.path.isfile(t)]
    return sorted(set(seen))


def jsonl_valid(text):
    for ln in text.split("\n"):
        if not ln.strip():
            continue
        try:
            json.loads(ln)
        except Exception:
            return False
    return True


def main():
    apply = "--apply" in sys.argv
    secrets = load_secrets()
    if not secrets:
        print(f"nenhum secret legível em {SECRETS_DIR}", file=sys.stderr)
        return 1

    print(f"{len(secrets)} secrets carregados de {SECRETS_DIR}")
    print("MODO: " + ("APLICAR (escreve)" if apply else "DRY-RUN (não escreve)"))
    print()

    files = subs_total = skipped = 0
    for t in targets():
        try:
            raw = open(t, encoding="utf-8", errors="surrogateescape").read()
        except Exception:
            continue
        if not any(v in raw for _, v in secrets):
            continue

        new, subs, names = raw, 0, []
        for name, v in secrets:
            c = new.count(v)
            if c:
                new = new.replace(v, f"<REDACTED-{name}>")
                subs += c
                names.append(name)

        if t.endswith(".jsonl") and not jsonl_valid(new):
            print(f"  PULADO (JSON inválido após redação): {os.path.basename(t)}")
            skipped += 1
            continue

        print(f"  {subs:3d} subs  {os.path.basename(t)[:48]}")
        print(f"           └─ {', '.join(sorted(names))}")

        if apply:
            tmp = t + ".redact-tmp"
            with open(tmp, "w", encoding="utf-8", errors="surrogateescape") as f:
                f.write(new)
            shutil.copystat(t, tmp)
            os.replace(tmp, t)  # atômico

        files += 1
        subs_total += subs

    print()
    verb = "redigidos" if apply else "seriam redigidos"
    print(f"{files} arquivos {verb}, {subs_total} ocorrências"
          + (f", {skipped} pulados" if skipped else ""))
    if not apply and files:
        print("\nrode de novo com --apply pra executar")
    return 0


if __name__ == "__main__":
    sys.exit(main())
