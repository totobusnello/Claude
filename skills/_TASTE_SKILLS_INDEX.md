# Taste Skills — pacote externo

Pacote anti-slop frontend de [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill). Instalado em 2026-05-31.

## Skills incluídas (13)

| Folder | Install name (frontmatter) | Tamanho | Quando usar |
|---|---|---|---|
| `taste-skill/` | `design-taste-frontend` | **88K** ⚠️ | Default v2 experimental — landing/portfolio greenfield |
| `taste-skill-v1/` | `design-taste-frontend-v1` | 24K | Versão estável v1 — fallback se v2 quebrar |
| `gpt-tasteskill/` | `gpt-taste` | 8K | Stricter GPT/Codex variant — anti-slop agressivo |
| `image-to-code-skill/` | `image-to-code` | 36K | Pipeline: gera image refs → analisa → implementa |
| `imagegen-frontend-web/` | `imagegen-frontend-web` | 36K | Image-gen only — comps de website |
| `imagegen-frontend-mobile/` | `imagegen-frontend-mobile` | 40K | Image-gen only — mockups mobile iOS/Android |
| `brandkit/` | `brandkit` | 16K | Image-gen only — boards de brand identity |
| `redesign-skill/` | `redesign-existing-projects` | 16K | Audit-first pra projetos existentes |
| `soft-skill/` | `high-end-visual-design` | 12K | Premium polido — soft contrast, spring motion |
| `minimalist-skill/` | `minimalist-ui` | 8K | Editorial Notion/Linear style |
| `brutalist-skill/` | `industrial-brutalist-ui` | 12K | Hard Swiss type, sharp contrast |
| `output-skill/` | `full-output-enforcement` | 4K | Anti-truncation enforcer |
| `stitch-skill/` | `stitch-design-taste` | 12K | Google Stitch compatibility + `DESIGN.md` export |

**Total:** ~330K SKILL.md across 13 skills.

## Como invocar

Skills ativam automaticamente por keyword OR explicitly:
```
"Use a skill design-taste-frontend pra fazer landing do X"
```

## Update no futuro

```bash
cd /tmp && rm -rf taste-skill
git clone --depth 1 https://github.com/Leonxlnx/taste-skill.git
for d in /tmp/taste-skill/skills/*/; do
    NAME=$(basename "$d")
    [ -d ~/Claude/skills/"$NAME" ] && cp -R "$d" ~/Claude/skills/
done
bash ~/Claude/scripts/sync-all-to-home.sh
```

## Decisão sobre overlap com designer-high (Opus)

`designer-high` (Opus) e `taste-skill` cobrem domínios parcialmente sobrepostos. Estratégia:

- **`designer-high`** continua sendo o designer-developer geral (apps, dashboards, UIs internas)
- **`design-taste-frontend`** é especialista em landing/portfolio/marketing — **convocar explicitamente** quando o deliverable for marketing site
- Em side-by-side: testar nos próximos 2-3 landing jobs (sugestão: nox-supermem Hotmart, Granix landing institucional)
- Se taste-skill ganhar 2x → vira default pra essa categoria
- Se empatar/perder → desinstalar (cherry-pick regras úteis)

## Cuidados

- ⚠️ **`taste-skill/SKILL.md` é 88KB** — só carregar quando realmente for trabalhar em landing. Não invocar à toa.
- ⚠️ **v2 marcada "experimental"** — pode mudar entre commits. Pinar versão via git SHA se quebrar workflow.
- ⚠️ **`image-to-code-skill` / `imagegen-*` / `brandkit`** dependem de ChatGPT Images / Codex Images / outro gerador externo. Não rodam standalone no Claude.
- ⚠️ Em-dash ban da `taste-skill` é absoluto — pode briga com agentes que produzem markdown técnico que usa `—` legitimamente. Aplicar SÓ em output de UI/landing, não em docs.

## Referências

- Repo: https://github.com/Leonxlnx/taste-skill
- Site: https://tasteskill.dev
- Changelog: https://www.tasteskill.dev/changelog
- Author: @lexnlin (Twitter)
- License: MIT
