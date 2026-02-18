# GitHub Token - Setup Rápido

## 🎯 3 Formas de Configurar

### Opção 1: Script Automático ⭐ MAIS FÁCIL

```bash
cd ~/Toto-Code
./configure-github-token.sh
```

O script vai:
1. Mostrar instruções claras
2. Pedir para você colar o token
3. Validar o formato
4. Criar backup automático
5. Atualizar a configuração
6. Mostrar próximos passos

---

### Opção 2: Comando Único (se já tem o token)

```bash
# Substitua SEU_TOKEN pelo token real
TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

jq --arg token "$TOKEN" \
   '.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN = $token' \
   ~/Library/Application\ Support/Claude/claude_desktop_config.json > /tmp/config.json && \
mv /tmp/config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json

echo "✅ Token configurado! Reinicie o Claude Desktop"
```

---

### Opção 3: Manual (Editor de Texto)

```bash
# Abrir o arquivo
open ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Encontre esta linha:
"GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_GITHUB_TOKEN>"

# Substitua pelo seu token:
"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Salve e feche
```

---

## 🔑 Como Obter o Token do GitHub

### Passo a Passo Detalhado

1. **Acesse a página de tokens**
   ```
   https://github.com/settings/tokens
   ```

2. **Clique em "Generate new token"**
   - Escolha "Generate new token (classic)"

3. **Configure o token:**
   - **Note:** `Claude Desktop MCP`
   - **Expiration:** 90 days (recomendado) ou No expiration

4. **Selecione os scopes (permissões):**

   ```
   ✅ repo
      ├─ repo:status
      ├─ repo_deployment
      ├─ public_repo
      └─ repo:invite

   ✅ read:org

   ✅ read:user

   ✅ user:email
   ```

5. **Gere o token**
   - Clique em "Generate token" no final da página
   - **COPIE IMEDIATAMENTE** (você só verá uma vez!)

6. **O token começa com `ghp_`**
   ```
   Exemplo: ghp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r
   ```

---

## ✅ Verificar se Funcionou

### Antes de Reiniciar
```bash
# Ver configuração atual
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | \
jq -r '.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN' | head -c 10

# Deve mostrar: ghp_xxxxxx (primeiros caracteres do seu token)
```

### Depois de Reiniciar Claude Desktop
1. Abra o Claude Desktop
2. O GitHub MCP deve estar **conectado** ✅
3. Teste: "Liste meus repositórios no GitHub"

---

## 🆘 Troubleshooting

### "Token não funciona"
- Verifique se copiou o token completo
- Confirme que selecionou os scopes corretos
- Token deve começar com `ghp_`

### "Bad credentials"
- Token expirou ou foi revogado
- Gere um novo token
- Atualize a configuração

### "Not found" ao acessar repo privado
- Token precisa do scope `repo` completo
- Edite o token em: https://github.com/settings/tokens
- Adicione permissões necessárias

### "MCP não aparece conectado"
- Verifique se o JSON está válido:
  ```bash
  cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
  ```
- Se houver erro de sintaxe, restaure o backup:
  ```bash
  ls -lt ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup*
  # Escolha o backup mais recente e copie de volta
  ```

---

## 🔒 Segurança

### ⚠️ NUNCA
- ❌ Commite o token em repositórios
- ❌ Compartilhe o token em mensagens
- ❌ Exponha o token em logs ou screenshots

### ✅ SEMPRE
- ✅ Use tokens com expiração
- ✅ Revogue tokens antigos
- ✅ Use scopes mínimos necessários
- ✅ Mantenha backups da configuração

### Revogar Token
Se comprometido:
1. Vá em: https://github.com/settings/tokens
2. Clique em "Delete" no token comprometido
3. Gere um novo token
4. Atualize a configuração

---

## 📊 Scopes Explicados

| Scope | O que permite | Necessário? |
|-------|---------------|-------------|
| `repo` | Acesso completo a repos públicos e privados | ✅ Sim |
| `public_repo` | Apenas repos públicos | Alternativa |
| `read:org` | Ler info de organizações | ✅ Recomendado |
| `read:user` | Ler perfil do usuário | ✅ Recomendado |
| `user:email` | Acessar emails | ✅ Recomendado |
| `write:discussion` | Escrever em discussions | ❌ Opcional |
| `admin:org` | Administrar organizações | ❌ Não necessário |

**Mínimo necessário:** `repo` + `read:org` + `read:user`

---

## 🎯 Casos de Uso

### O que você pode fazer com GitHub MCP:

#### 📖 Leitura
- Listar repositórios
- Ver conteúdo de arquivos
- Buscar código
- Ver issues e PRs
- Analisar commits

#### ✍️ Escrita
- Criar issues
- Comentar em PRs
- Criar branches
- Fazer commits (via API)
- Gerenciar labels

#### 🔍 Análise
- Comparar branches
- Ver estatísticas do repo
- Analisar contributors
- Revisar código

---

## 📚 Exemplos de Uso

Após configurar o token, teste:

```
"Liste meus repositórios no GitHub"

"Mostre os arquivos do repo totobusnello/Toto-Code"

"Busque por 'MCP' no código do meu repo"

"Liste as issues abertas do repo totobusnello/Toto-Code"

"Crie uma issue no repo totobusnello/Toto-Code:
Título: Testar GitHub MCP
Descrição: Verificar se o MCP está funcionando corretamente"

"Mostre os últimos 5 commits do repo totobusnello/Toto-Code"

"Compare as branches main e claude/toto-code-bcdec185"
```

---

## 🚀 Próximos Passos

1. **Configure o token agora:**
   ```bash
   cd ~/Toto-Code
   ./configure-github-token.sh
   ```

2. **Reinicie Claude Desktop**

3. **Teste o GitHub MCP**

4. **Explore outros MCPs:**
   - Ver `RECOMMENDED_MCPS.md` para mais opções
   - YouTube Transcript
   - Brave Search
   - Playwright

---

*Setup rápido - 2 minutos*
