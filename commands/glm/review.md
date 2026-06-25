---
description: GLM-5.2 (Zhipu) — 2ª/3ª opinião adversarial read-only no diff atual
---
Use o subagent `glm-adversary` em modo **review**: revisão read-only do diff atual com o GLM-5.2 (família de treino distinta de Claude/Codex/Kimi).

Escopo/base extra (opcional): $ARGUMENTS

O subagent deve capturar o diff (working tree por padrão, ou a base citada em $ARGUMENTS), rodar o GLM uma vez e devolver o veredito cru. Não suavize as críticas; se você discordar, adicione uma nota separada depois.
