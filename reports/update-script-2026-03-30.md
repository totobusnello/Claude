# Updates Criticos — Script de Execucao (2026-03-30)

> Copie e cole estes comandos no **terminal Claude Code** (nao no Cowork).
> Tempo estimado: ~10 minutos.

---

## Passo 1: Atualizar Claude Code (v2.1.87)

```bash
claude update
```

Apos o update, confirme a versao:

```bash
claude --version
```

**Esperado**: `2.1.87` ou superior.

**O que muda**:
- `getContextUsage()` — monitoramento de uso do context window
- Fix de crash out-of-memory ao usar `/feedback` em sessoes longas
- Fix de `--resume` em sessoes antigas (pre-v2.1.85)
- Fix de Write/Edit/Read em arquivos fora do project root
- Session headers para proxies (`X-Claude-Code-Session-Id`)

---

## Passo 2: Atualizar context-mode (pendente ha 4 semanas)

Dentro de uma sessao Claude Code, rode:

```
/plugin update context-mode
```

Se der erro, reinstale do zero:

```
/plugin uninstall context-mode
/plugin marketplace add mksglu/claude-context-mode
/plugin install context-mode@claude-context-mode
```

**Alternativa (MCP-only, sem hooks)**:

```bash
claude mcp add context-mode -- npx -y context-mode
```

**O que muda**:
- Fix de bug de compressao que afetava sessoes longas
- Compressao de ate 98% do tool output (315KB → 5.4KB)
- Sessoes duram ~3h antes de slowdown (vs ~30min sem)

---

## Passo 3: Atualizar superpowers (v4.3.0+)

Dentro de uma sessao Claude Code:

```
/plugin update superpowers
```

Se nao funcionar:

```
/plugin uninstall superpowers
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

**O que muda**:
- 93k+ stars, framework mais popular
- EnterPlanMode intercept — brainstorming obrigatorio antes de planejar
- Melhorias no workflow de TDD e debugging

---

## Passo 4: Atualizar plannotator (v0.15.0)

Dentro de uma sessao Claude Code:

```
/plugin update plannotator
```

Se nao funcionar:

```
/plugin uninstall plannotator
/plugin marketplace add backnotprop/plannotator
/plugin install plannotator@plannotator
```

**O que muda**:
- Live AI chat em code review
- Navegador de planos anteriores
- File viewer para referencia de docs durante anotacao

---

## Passo 5: Verificacao final

Depois de tudo, confirme que esta tudo OK:

```
/plugins
```

Deve mostrar todos os 7 plugins com versoes atualizadas:
- claude-mem
- claude-hud
- ui-ux-pro-max
- **context-mode** (atualizado)
- **superpowers** (atualizado)
- **plannotator** (atualizado)
- code-review

---

## Resumo rapido (copy-paste sequencial)

```bash
# 1. Update Claude Code
claude update
claude --version

# 2-4. Dentro de uma sessao Claude Code, rodar:
# /plugin update context-mode
# /plugin update superpowers
# /plugin update plannotator
# /plugins
```

---

## Proximo passo apos updates

Quando terminar, volte ao Cowork e me avise. Ai atacamos:
1. Conectar FactSet + MSCI (1 clique cada no Cowork)
2. Ativar Channels + Telegram (controle pelo celular)
3. Agendar demo Datarails FinanceOS
