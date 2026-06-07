---
name: recheck
description: Use when about to state a measured number, count, total, diagnosis, or conclusion that came from a sample, smoke test, preview, log alert, or a single query/measurement — before answering the user and before any destructive or irreversible operation sized by a prior measurement. Triggers: citing counts ("X items found", "N duplicates"), classifying leaks/vulnerabilities/root causes from a scanner alert, DELETE/cleanup/migration scoped by an earlier number, "tem certeza?", "confira", verifying a hypothesis.
---

# Recheck — nenhuma conclusão sem segunda verificação

**Princípio:** uma medição é hipótese, não conclusão. Resposta só sai depois de checar E rechecar por um caminho independente.

## Protocolo

1. **Amostra ≠ censo.** O número veio de smoke/preview/amostra com cap ou threshold? Rode o censo completo (query direta, sem caps) antes de citar o número ou dimensionar qualquer operação.
2. **Evidência primária.** Diagnóstico (vazamento, vulnerability, root cause)? Inspecione o artefato real — blob, log completo, exit code, linha exata — não o alerta da ferramenta. Declare falso positivo explicitamente quando for o caso.
3. **Recompute + range-guard.** Operação destrutiva: recompute o conjunto NO momento da execução e aborte se o tamanho divergir do aprovado. Snapshot antes.
4. **Declare o método.** Na resposta, distinga "censo completo" de "amostra (cap=N)". Nunca apresente amostra como total.

## Red flags — PARE e recheque

- "O smoke/preview já mostrou" → smoke tem cap
- "A ferramenta alertou" → alerta ≠ evidência primária
- "É urgente" → recheck custa minutos; restore custa horas
- "O número parece razoável" → plausível ≠ verificado
- Prestes a responder com um número que você mediu UMA única vez

| Racionalização | Realidade |
|---|---|
| "Já verifiquei uma vez" | 1 caminho = 1 hipótese. Recheque por caminho independente. |
| "O usuário pediu rápido" | Caso real: "202 dups" eram 24.519 (120×). O recheck salvou a operação. |
| "É só um número de status" | Números viram decisões. Errado na fonte = errado na decisão. |
