#!/usr/bin/env python3
"""
Cleans ~/.claude/settings.json permissions.allow by removing literal
one-off commands while preserving wildcard patterns, MCP entries, and
explicitly-protected entries.

Rules:
- KEEP wildcard patterns: Bash(xxx:*), Bash(xxx *), Bash(xxx)
- KEEP MCP entries (mcp__*)
- KEEP Native tool allows (Edit, Write, Read, Glob, Grep, Agent, WebFetch, WebSearch)
- KEEP WebFetch(domain:*) entries
- KEEP Skill(...) and Read(...) path-scoped rules
- KEEP explicitly-protected literal entries (Buttondown key, specific script invocations)
- DROP Bash entries with literal commands containing:
    - hash comments (# ...)
    - shell keywords at start (for, do, done, while, if, then, fi)
    - multi-token literal invocations that should be wildcarded
- DROP duplicates

Usage:
  python3 scripts/clean-allowlist.py --dry-run   # preview
  python3 scripts/clean-allowlist.py              # apply
"""
import json
import re
import sys
from pathlib import Path

SETTINGS = Path("/Users/lab/.claude/settings.json")
DRY = "--dry-run" in sys.argv

# Entries we explicitly want to keep even if they look literal.
# Matched by prefix, so the actual secret lives only in settings.json.
PROTECTED_PREFIXES = (
    'Bash(BUTTONDOWN_API_KEY=',  # user-whitelisted feedback script invocation
)

# Shell constructs that shouldn't be in an allowlist as literals
SHELL_FRAGMENT = re.compile(r'^Bash\(\s*(for|do|done|while|if|then|fi|elif|else|case|esac)\b')
# Hash comments captured from transcripts
HASH_COMMENT = re.compile(r'^Bash\(\s*#')

def is_wildcard(entry):
    """Has a wildcard pattern — keep."""
    if not entry.startswith('Bash('): return False
    inside = entry[5:-1]
    # Bash(foo *), Bash(foo:*), Bash(foo)
    # Keep if it's: bare command, or ends with :* or has a space before wildcard, or no literal args
    if inside.endswith(':*'): return True
    if re.match(r'^[\w.-]+$', inside): return True                      # bare: "Bash(ls)"
    if re.match(r'^[\w.-]+\s+\*$', inside): return True                 # "Bash(git *)"
    if re.match(r'^[\w.-]+(\s+[\w.-]+)+\s+\*$', inside): return True    # "Bash(git log *)"
    return False

def is_cli_literal_ok(entry):
    """Specific CLI invocations that are safe to allowlist as exact forms.
    (e.g., "Bash(node -v)") — not pattern-matched but not footguns either."""
    if not entry.startswith('Bash('): return False
    inside = entry[5:-1]
    # Specific safe forms: node -v, pnpm link --global, export VAR=..., cd ~/..., ~/.zshrc, etc.
    safe_prefixes = (
        'export ', 'cd ', 'source ', '~/', './', 'AO=', 'pwd',
    )
    return any(inside.startswith(p) for p in safe_prefixes) and len(inside) < 80

def should_keep(entry):
    if any(entry.startswith(p) for p in PROTECTED_PREFIXES): return True, 'protected'
    if not entry.startswith('Bash('):
        # MCP, Edit, Write, Read, Glob, Grep, Agent, Skill, WebFetch, WebSearch, etc.
        return True, 'non-bash'
    if SHELL_FRAGMENT.search(entry): return False, 'shell fragment'
    if HASH_COMMENT.search(entry): return False, 'hash comment'
    if is_wildcard(entry): return True, 'wildcard'
    if is_cli_literal_ok(entry): return True, 'safe literal'
    return False, 'literal one-off'

def find_broad_patterns(allow):
    """Collect Bash(<cmd> *) patterns — these dominate sub-patterns."""
    broad = set()
    for e in allow:
        if not e.startswith('Bash('): continue
        inside = e[5:-1]
        m = re.match(r'^([\w.-]+)\s+\*$', inside)
        if m: broad.add(m.group(1))
    return broad

def is_redundant_under_broad(entry, broad):
    """True if entry is Bash(cmd ...) where cmd matches a broad wildcard."""
    if not entry.startswith('Bash('): return False
    inside = entry[5:-1]
    # Skip if it IS a broad pattern or a bare command
    if re.match(r'^[\w.-]+\s+\*$', inside): return False
    if re.match(r'^[\w.-]+$', inside): return False
    first = re.split(r'[\s:]', inside, maxsplit=1)[0]
    return first in broad

def main():
    data = json.loads(SETTINGS.read_text())
    allow = data.get('permissions', {}).get('allow', [])

    # Phase 1: drop obvious shell-construct / hash-comment / one-off literals
    # Phase 2: drop entries redundant under broader wildcards
    broad = find_broad_patterns(allow)
    kept, dropped = [], []
    seen = set()
    for e in allow:
        if e in seen: continue
        seen.add(e)
        keep, reason = should_keep(e)
        if keep and not any(e.startswith(p) for p in PROTECTED_PREFIXES) and is_redundant_under_broad(e, broad):
            keep, reason = False, f'redundant under broad wildcard'
        (kept if keep else dropped).append((e, reason))

    print(f'Total before:  {len(allow)}')
    print(f'After cleanup: {len(kept)}')
    print(f'Dropped:       {len(dropped)}')
    print()

    # Group drops by reason for summary
    by_reason = {}
    for e, r in dropped:
        by_reason.setdefault(r, []).append(e)
    for r, lst in by_reason.items():
        print(f'  - {r}: {len(lst)}')

    if DRY:
        print('\n=== DRY RUN — sample dropped (first 10) ===')
        for e, r in dropped[:10]:
            print(f'  [{r}]  {e[:100]}')
        print('\n=== first 15 kept ===')
        for e, r in kept[:15]:
            print(f'  [{r}]  {e[:80]}')
        return

    data['permissions']['allow'] = [e for e, _ in kept]
    SETTINGS.write_text(json.dumps(data, indent=2))
    print(f'\nWrote {SETTINGS}')

if __name__ == '__main__':
    main()
