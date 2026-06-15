# Project Routing — onde abrir cada conversa

| Você pergunta sobre... | Abrir em |
|---|---|
| Schema, chunks, FTS5, sqlite-vec, KG, salience, embeddings, paper técnico nox-mem | `memoria-nox/` |
| Produto comercial Supermem (Hotmart, tiers, instalador, marketing, PT-BR) | `nox-supermem/` |
| Upgrade OpenClaw, gateway crash, monkey-patch #62028, fallback chain, RelayPlane, Max OAuth, channels/plugins/hooks da plataforma | `openclaw-vps/infra/` |
| Captura WhatsApp/Slack, daily briefing, afternoon report, action items, reuniões iPhone, secretário pessoal Nox | `openclaw-vps/nox-secretary/` |
| Brainstorm de features VPS futuras (Plaud, Limitless, Granola, etc) | `openclaw-vps/_future/` |

## Regra
Se conversa começa em um repo e drift pra outro tema, **parar e mover** (ou perguntar ao Toto se quer continuar no mesmo). Cross-cutting raro — quase tudo cabe em UM repo.

## Repo map
- `memoria-nox/` — evolução do nox-mem core (memória de Nox/Atlas/etc)
- `nox-supermem/` — produtização (Brasil, Hotmart, tiers A/B/C)
- `openclaw-vps/` — umbrella da VPS Hostinger (`infra/` + `nox-secretary/` + `_future/`)
- demais: `Granix-App/`, `Frooty/`, `GalapagosApp/`, `Future-Farm/`, `daily-tech-digest/`, `Area-Campolim-Sorocaba/`, `Area-Manuel_Nobrega/`
