# MCPs Recomendados para Instalar

**Data:** 2026-01-26
**Status:** Lista curada dos melhores MCPs por categoria

---

## 📊 MCPs Já Instalados (9)

✅ filesystem, git, fetch, memory, sqlite, time, sequential-thinking, everything, puppeteer

---

## 🎯 MCPs Recomendados por Categoria

### 🔧 1. Desenvolvimento e Git

#### **GitHub MCP** ⭐ ESSENCIAL
- **Função:** Gerenciar repos, PRs, issues, code reviews
- **Instalação:**
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "github-mcp"]
  }
}
```
- **Fonte:** [github-mcp no npm](https://www.npmjs.com/package/github-mcp)

---

### 🗄️ 2. Bancos de Dados

#### **Postgres MCP** ⭐ ESSENCIAL
- **Função:** Interagir com PostgreSQL (produção)
- **Instalação:**
```bash
# Instalar PostgreSQL primeiro
brew install postgresql@16
brew services start postgresql@16

# Configuração MCP
{
  "postgres": {
    "command": "uvx",
    "args": [
      "mcp-server-postgres",
      "postgresql://localhost/mydb"
    ]
  }
}
```

#### **Database Server** (SQLite + PostgreSQL + SQL Server)
- **Função:** Conectar com múltiplos bancos
- **Instalação:**
```json
{
  "database-server": {
    "command": "npx",
    "args": ["-y", "@executeautomation/database-server"]
  }
}
```
- **Fonte:** [mcp-database-server](https://github.com/executeautomation/mcp-database-server)

---

### 🎬 3. YouTube e Mídia

#### **YouTube Transcript** ⭐ MUITO ÚTIL
- **Função:** Baixar transcrições de vídeos
- **Instalação:**
```json
{
  "youtube-transcript": {
    "command": "npx",
    "args": ["-y", "@kimtaeyoon83/mcp-server-youtube-transcript"]
  }
}
```
- **Features:**
  - Suporta múltiplos formatos de URL
  - Seleção de idioma com fallback automático
  - Filtro de anúncios/sponsors
  - Timestamps opcionais

- **Fonte:** [mcp-server-youtube-transcript](https://github.com/kimtaeyoon83/mcp-server-youtube-transcript)

---

### 🌐 4. Web Scraping e Busca

#### **Brave Search** ⭐ ESSENCIAL
- **Função:** Busca web com privacidade
- **Instalação:**
```bash
# 1. Obter API key: https://brave.com/search/api/

# 2. Configuração
{
  "brave-search": {
    "command": "uvx",
    "args": ["mcp-server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "sua-api-key-aqui"
    }
  }
}
```

#### **Playwright MCP** ⭐ SUPERIOR AO PUPPETEER
- **Função:** Automação de browser avançada
- **Instalação:**
```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@executeautomation/playwright-mcp-server"]
  }
}
```
- **Vantagens sobre Puppeteer:**
  - Suporta Chrome, Firefox, Safari
  - Melhor handling de SPAs
  - Network interception
  - Screenshots e PDFs

- **Fonte:** [Playwright MCP](https://github.com/executeautomation/mcp-playwright)

---

### 📁 5. Produtividade e Cloud

#### **Google Drive**
- **Função:** Acessar Docs, Sheets, Slides
- **Instalação:**
```json
{
  "google-drive": {
    "command": "uvx",
    "args": ["mcp-server-gdrive"]
  }
}
```

#### **Notion**
- **Função:** Busca semântica no workspace
- **Instalação:**
```json
{
  "notion": {
    "command": "npx",
    "args": ["-y", "@notionhq/mcp-server-notion"]
  }
}
```

#### **Slack**
- **Função:** Ler canais, postar mensagens
- **Instalação:**
```json
{
  "slack": {
    "command": "uvx",
    "args": ["mcp-server-slack"],
    "env": {
      "SLACK_BOT_TOKEN": "xoxb-...",
      "SLACK_TEAM_ID": "T..."
    }
  }
}
```

---

### 🐳 6. DevOps e Infrastructure

#### **Docker**
- **Função:** Gerenciar containers
- **Instalação:**
```json
{
  "docker": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-docker"]
  }
}
```

#### **Kubernetes**
- **Função:** Gerenciar clusters K8s
- **Instalação:**
```json
{
  "kubernetes": {
    "command": "npx",
    "args": ["-y", "@strowk/mcp-k8s-go"]
  }
}
```

---

### 🔍 7. AI e Análise

#### **Perplexity Search**
- **Função:** Busca com AI
- **Instalação:**
```json
{
  "perplexity": {
    "command": "uvx",
    "args": ["mcp-server-perplexity"],
    "env": {
      "PERPLEXITY_API_KEY": "sua-key"
    }
  }
}
```

#### **ElevenLabs** (Text-to-Speech)
- **Função:** Gerar áudio de texto
- **Instalação:**
```json
{
  "elevenlabs": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-elevenlabs"],
    "env": {
      "ELEVENLABS_API_KEY": "sua-key"
    }
  }
}
```

---

## 🎯 MCPs Essenciais - Top 5 Recomendados

### 1. **GitHub MCP** ⭐⭐⭐⭐⭐
   - Gerenciar repos sem sair do Claude
   - Criar PRs, revisar código, gerenciar issues

### 2. **YouTube Transcript** ⭐⭐⭐⭐⭐
   - Baixar transcrições de vídeos
   - Resumir conteúdo, extrair insights

### 3. **Brave Search** ⭐⭐⭐⭐⭐
   - Busca web integrada
   - Pesquisar documentação, tutoriais

### 4. **Playwright** ⭐⭐⭐⭐
   - Automação de browser profissional
   - Substituir Puppeteer atual

### 5. **Postgres MCP** ⭐⭐⭐⭐
   - Banco de dados produção
   - Query, análise, migrations

---

## 📋 Script de Instalação Rápida

### Instalar Top 5
```bash
# GitHub
npm install -g github-mcp

# YouTube Transcript
npm install -g @kimtaeyoon83/mcp-server-youtube-transcript

# Playwright
npm install -g @executeautomation/playwright-mcp-server

# Postgres (requer PostgreSQL instalado)
brew install postgresql@16
brew services start postgresql@16
createdb mydb

# Brave Search (requer API key)
# Obtenha em: https://brave.com/search/api/
```

---

## 🔧 Configuração Completa Recomendada

<details>
<summary>Clique para ver configuração JSON completa</summary>

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/labf"]
    },
    "git": {
      "command": "uvx",
      "args": ["mcp-server-git", "--repository", "/Users/labf/Toto-Code"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "github-mcp"]
    },
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "sqlite": {
      "command": "uvx",
      "args": ["mcp-server-sqlite", "--db-path", "/Users/labf/databases/main.db"]
    },
    "postgres": {
      "command": "uvx",
      "args": ["mcp-server-postgres", "postgresql://localhost/mydb"]
    },
    "time": {
      "command": "uvx",
      "args": ["mcp-server-time"]
    },
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "everything": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everything"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    },
    "youtube-transcript": {
      "command": "npx",
      "args": ["-y", "@kimtaeyoon83/mcp-server-youtube-transcript"]
    },
    "brave-search": {
      "command": "uvx",
      "args": ["mcp-server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "<sua-api-key>"
      }
    }
  }
}
```

</details>

---

## 📚 Recursos para Descobrir Mais MCPs

### Diretórios Oficiais
- **[MCP Servers (Awesome List)](https://mcpservers.org/)** - 1200+ servidores
- **[MCP Market](https://mcpmarket.com/)** - Top 100 ranking
- **[Smithery](https://smithery.ai/)** - 2200+ servidores com guias
- **[MCP.so](https://mcp.so/)** - 3000+ servidores com ratings

### Listas GitHub
- [wong2/awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)
- [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
- [tolkonepiu/best-of-mcp-servers](https://github.com/tolkonepiu/best-of-mcp-servers)

### Artigos
- [Best MCP Servers for 2026 - Builder.io](https://www.builder.io/blog/best-mcp-servers-2026)
- [Top 12 MCP Servers - Skyvia](https://blog.skyvia.com/best-mcp-servers/)
- [Top 10 MCP Servers - Apidog](https://apidog.com/blog/top-10-mcp-servers/)

---

## 🎬 Próximos Passos

1. **Escolha MCPs** da lista acima baseado nas suas necessidades
2. **Instale pacotes** usando npm/uvx
3. **Adicione ao config** em `~/Library/Application Support/Claude/claude_desktop_config.json`
4. **Obtenha API keys** para serviços que precisam (GitHub, Brave, etc)
5. **Reinicie Claude Desktop**
6. **Teste** cada MCP instalado

---

## 💡 Dicas de Instalação

### Para MCPs que precisam de API Keys
1. Instale sem API key primeiro
2. Teste se funciona com dados públicos
3. Adicione API key depois para funcionalidades completas

### Performance
- Não instale mais de 15-20 MCPs simultaneamente
- MCPs pesados (Playwright, Docker) podem aumentar tempo de inicialização
- Desabilite MCPs que não usa frequentemente

### Troubleshooting
```bash
# Verificar logs
tail -f ~/Library/Logs/Claude/mcp*.log

# Testar MCP isoladamente
npx -y github-mcp --help
uvx mcp-server-brave-search --help

# Validar JSON
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | jq .
```

---

*Última atualização: 2026-01-26*

## 📖 Fontes

- [Model Context Protocol Servers - GitHub](https://github.com/modelcontextprotocol/servers)
- [Best MCP Servers for Developers in 2026](https://www.builder.io/blog/best-mcp-servers-2026)
- [Top 12 MCP Servers Guide](https://blog.skyvia.com/best-mcp-servers/)
- [Awesome MCP Servers Directory](https://mcpservers.org/)
