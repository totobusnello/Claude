---
description: Grok 4.5 (xAI) — 2ª/3ª/4ª opinião adversarial read-only no diff atual
---
Use o subagent `grok-adversary` em modo **review**: revisão read-only do diff atual com o Grok 4.5 (família de treino distinta de Claude/Codex/Kimi/GLM).

Escopo/base extra (opcional): $ARGUMENTS

O subagent deve capturar o diff (working tree por padrão, ou a base citada em $ARGUMENTS), rodar o Grok uma vez e devolver o veredito cru. Não suavize as críticas; se você discordar, adicione uma nota separada depois.
