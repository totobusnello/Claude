# Guia de Configuração dos MCPs

## MCPs Instalados

### 1. **filesystem** ✅ Pronto para usar
- **Função:** Acesso a arquivos do sistema
- **Escopo:** `/Users/labf`
- **Sem configuração adicional necessária**

### 2. **git** ✅ Pronto para usar
- **Função:** Operações Git no repositório
- **Repositório:** `/Users/labf/Toto-Code`
- **Sem configuração adicional necessária**

### 3. **github** ⚠️ Requer API Key
- **Função:** Interação com GitHub API
- **Configuração necessária:**
  1. Vá em: https://github.com/settings/tokens
  2. Crie um Personal Access Token (classic)
  3. Permissões: `repo`, `read:org`, `read:user`
  4. Substitua `<YOUR_GITHUB_TOKEN>` no config

### 4. **brave-search** ⚠️ Requer API Key
- **Função:** Busca web usando Brave Search API
- **Configuração necessária:**
  1. Vá em: https://brave.com/search/api/
  2. Crie uma conta e obtenha API key
  3. Substitua `<YOUR_BRAVE_API_KEY>` no config

### 5. **fetch** ✅ Pronto para usar
- **Função:** Fazer requisições HTTP/HTTPS
- **Sem configuração adicional necessária**

### 6. **puppeteer** ✅ Pronto para usar
- **Função:** Automação de browser (web scraping, testes)
- **Sem configuração adicional necessária**
- **Nota:** Primeira execução baixará Chrome automaticamente

### 7. **sqlite** ⚠️ Requer configuração
- **Função:** Interação com bancos SQLite
- **Configuração necessária:**
  ```bash
  mkdir -p ~/databases
  ```

### 8. **postgres** ⚠️ Requer banco PostgreSQL
- **Função:** Interação com PostgreSQL
- **Configuração necessária:**
  1. Instale PostgreSQL: `brew install postgresql@15`
  2. Inicie o serviço: `brew services start postgresql@15`
  3. Crie um banco: `createdb mydb`
  4. Atualize a connection string no config

### 9. **memory** ✅ Pronto para usar
- **Função:** Memória persistente entre conversas
- **Sem configuração adicional necessária**
- **Útil para:** Lembrar preferências e contexto

### 10. **google-maps** ⚠️ Requer API Key
- **Função:** Busca de lugares e rotas usando Google Maps
- **Configuração necessária:**
  1. Vá em: https://console.cloud.google.com/
  2. Ative Google Maps Platform
  3. Crie uma API key
  4. Substitua `<YOUR_GOOGLE_MAPS_KEY>` no config

### 11. **slack** ⚠️ Requer configuração
- **Função:** Interação com Slack (enviar mensagens, ler canais)
- **Configuração necessária:**
  1. Crie um Slack App: https://api.slack.com/apps
  2. Instale no workspace
  3. Obtenha Bot Token (começa com `xoxb-`)
  4. Obtenha Team ID do workspace
  5. Substitua os valores no config

### 12. **time** ✅ Pronto para usar
- **Função:** Operações com data/hora, timezones
- **Sem configuração adicional necessária**

### 13. **sequential-thinking** ✅ Pronto para usar
- **Função:** Pensamento estruturado e resolução de problemas
- **Sem configuração adicional necessária**

### 14. **everything** ✅ Pronto para usar
- **Função:** Busca universal de arquivos e conteúdo
- **Sem configuração adicional necessária**

---

## Como Configurar API Keys

### Método Manual
Edite o arquivo diretamente:
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### Usando o Script
Execute o script auxiliar:
```bash
./configure-mcps.sh
```

---

## MCPs Recomendados por Uso

### Para Desenvolvimento Web
- ✅ filesystem
- ✅ git
- ✅ github
- ✅ fetch
- ✅ puppeteer

### Para Data Science
- ✅ sqlite
- ✅ postgres
- ✅ fetch
- ✅ memory

### Para Pesquisa e Busca
- ✅ brave-search
- ✅ fetch
- ✅ everything
- ✅ google-maps

### Para Colaboração
- ✅ slack
- ✅ github
- ✅ memory

---

## Verificando se MCPs Funcionam

Após configurar, reinicie o Claude Desktop e verifique:

1. Abra o Claude Desktop
2. Os MCPs devem aparecer no menu de ferramentas
3. Teste cada um conforme necessário

---

## Troubleshooting

### MCP não aparece
- Verifique se o JSON está válido
- Reinicie o Claude Desktop
- Verifique logs em `~/Library/Logs/Claude/`

### Erro de permissão
- Verifique se tem permissões no diretório
- Para filesystem: `chmod 755 /Users/labf`

### API Key inválida
- Regenere a API key no serviço
- Verifique se não há espaços extras no JSON
- Confirme que as permissões da API key estão corretas

---

## Arquivo de Configuração

Localização:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

Backup antes de editar:
```bash
cp ~/Library/Application\ Support/Claude/claude_desktop_config.json \
   ~/Library/Application\ Support/Claude/claude_desktop_config.json.backup
```

---

## Adicionar Novos MCPs

Para adicionar mais MCPs:

1. Encontre o MCP no npm: https://www.npmjs.com/search?q=modelcontextprotocol
2. Adicione uma nova entrada em `mcpServers`:
```json
"nome-do-mcp": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-nome"
  ]
}
```
3. Reinicie o Claude Desktop

---

## MCPs Populares Adicionais

Outros MCPs úteis para instalar depois:

- **@modelcontextprotocol/server-aws** - AWS operations
- **@modelcontextprotocol/server-docker** - Docker management
- **@modelcontextprotocol/server-kubernetes** - K8s operations
- **@modelcontextprotocol/server-sentry** - Error tracking
- **@modelcontextprotocol/server-stripe** - Payment processing
- **@modelcontextprotocol/server-twilio** - SMS/Voice

---

*Última atualização: 2026-01-26*
