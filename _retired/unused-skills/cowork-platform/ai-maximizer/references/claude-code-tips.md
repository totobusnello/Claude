# AI Code Tips & Tricks

Comprehensive guide for maximizing productivity with AI Code, the terminal-based agentic coding assistant.

## Getting Started

AI Code is a command-line tool that provides direct access to AI's coding capabilities from your terminal.

**Installation:**
```bash
npm install -g @anthropic-ai/claude-code
```

**Basic usage:**
```bash
claude "your coding request"
```

## Essential Shortcuts & Commands

### Planning Mode (Shift+Tab Twice)

**Before generating any code**, activate planning mode to get structured analysis without immediate code generation:

```
[Press Shift+Tab twice in AI Code]
User: "Build a Shopify app for AI-enhanced product descriptions"
```

AI will:
- Perform web searches for relevant information
- Outline project structure
- Suggest technology stack
- Map out implementation steps
- Provide comprehensive plan

**Exit planning mode**: Press Shift+Tab again to return to normal mode

**Use planning mode when:**
- Starting new projects
- Exploring unfamiliar technologies
- Need architecture decisions
- Want to understand scope before coding

### Thinking Modes (Layered Reasoning)

AI Code supports different depth levels of reasoning:

| Mode | Command | Use Case |
|------|---------|----------|
| **think** | "think: [question]" | Basic reasoning |
| **think hard** | "think hard: [question]" | Moderate complexity |
| **think harder** | "think harder: [question]" | Complex problems |
| **ultrathink** | "ultrathink: [question]" | Maximum processing power |

**Example:**
```
ultrathink: What's the best architecture for this microservices system considering scalability, cost, and maintainability?
```

Higher thinking modes:
- Take longer to respond
- Show reasoning process in gray text
- Provide more thorough analysis
- Cost more tokens

**When to use ultrathink:**
- Critical architecture decisions
- Complex algorithm design
- Security-sensitive implementations
- High-stakes refactoring

### Control Commands

**Stop generation:**
- Press `Esc` once to stop current generation

**View history & revert:**
- Press `Esc` twice to view previous messages
- Navigate and revert to earlier conversation points
- Useful for course-correcting without losing context

**Continue last conversation:**
```bash
claude --continue
# or
claude -c
```

**Resume specific conversation:**
```bash
claude --resume
# or
claude -r
# Then use arrow keys to select from history
```

Or from within AI Code:
```
/resume
```

### Bypassing Permissions Mode

**Problem**: AI Code stops frequently to ask for authorization

**Solution**: Start with bypass flag
```bash
claude --dangerously-skip-permissions
```

**Important**: Only use in trusted environments. This gives AI full access to your system.

**Create permanent alias:**
```bash
# Add to ~/.bashrc or ~/.zshrc
alias claude='claude --dangerously-skip-permissions'

# Then reload:
source ~/.bashrc  # or ~/.zshrc
```

## CLAUDE.md Files

AI Code automatically reads `CLAUDE.md` files to understand project context.

### File Locations (Priority Order)

1. **Project root**: `/project/CLAUDE.md` (most common)
2. **Child directories**: `/project/subdir/CLAUDE.md` (for monorepos)
3. **Parent directories**: Searched upward from current location
4. **Home directory**: `~/.claude/CLAUDE.md` (global settings)
5. **Local (gitignored)**: `CLAUDE.local.md` (personal preferences)

### What to Include in CLAUDE.md

```markdown
# Project Overview
Brief description of what this project does

# Technology Stack
- Language: Python 3.11
- Framework: FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy

# Development Environment
- Use pyenv for Python version management
- Run `poetry install` for dependencies
- Database runs in Docker: `docker-compose up db`

# Repository Conventions
- Branch naming: `feature/description` or `fix/description`
- Merge strategy: Squash and merge (not rebase)
- Commit messages: Follow conventional commits

# Architecture Notes
- API endpoints follow REST conventions
- Authentication uses JWT tokens
- All database operations use transactions
- Migrations handled by Alembic

# Known Issues
- PostgreSQL must be running before starting server
- Tests require OPENAI_API_KEY environment variable
- Watch out for circular imports in models/

# Code Style
- Use Black for formatting (line length 88)
- Type hints required for all public functions
- Docstrings follow Google style
- Maximum function length: 50 lines
```

### Auto-generate CLAUDE.md

Run from project root:
```bash
/init
```

This scans your project and generates:
- Project summary
- Technology stack detection
- Core components mapping
- Coding standards analysis
- Data flow documentation

**Review and edit** the generated file - it's a starting point, not perfect.

## Image Analysis

AI Code can analyze screenshots and images.

**Paste images (Mac):**
```
Ctrl + V    (NOT Command + V)
```

**Common use cases:**
```
Analyze this UI screenshot and suggest improvements
↓
[Paste image with Ctrl+V]

Find bugs in this error dialog
↓
[Paste screenshot with Ctrl+V]

Recreate this design in React
↓
[Paste design mockup with Ctrl+V]
```

AI references images as "Image 1", "Image 2", etc.

## IDE Integration

Connect AI Code with VS Code or Cursor for seamless two-way communication.

**Setup:**
```bash
/ide
```

AI Code will confirm IDE extension installation.

**Benefits:**
- Highlight code in editor → AI focuses on that section
- Visual diff for code changes before applying
- Apply changes with confirmation
- Edit in IDE, AI sees changes immediately

**Workflow:**
1. Highlight problematic code in editor
2. Ask AI Code to fix it
3. Review changes in visual diff
4. Accept or reject modifications

## Custom Commands

Automate repetitive tasks with custom commands.

**Setup:**
1. Create `commands/` directory in project root
2. Add JavaScript files for each command

**Example: commands/test.js**
```javascript
module.exports = {
  name: 'test',
  description: 'Run test suite with coverage',
  async execute() {
    return {
      command: 'npm run test:coverage',
      displayResults: true
    };
  }
};
```

**Usage:**
```bash
/test
```

**Common custom commands:**
- `/lint` - Run linter and fix issues
- `/deploy` - Deploy to staging
- `/db-migrate` - Run database migrations
- `/test-watch` - Run tests in watch mode

## Best Practices

### 1. Provide Context Before Coding

**Bad:**
```
"Add authentication to the API"
```

**Good:**
```
Before we start, let me give you context:

1. View CLAUDE.md for project structure
2. We use JWT tokens (see auth/jwt.py for existing implementation)
3. Need to protect all /api/v1/* routes except /api/v1/auth/*
4. Should integrate with existing User model in models/user.py

Now, add authentication middleware.
```

### 2. Use Descriptive Task Breakdown

**Instead of:**
"Build a todo app"

**Try:**
"Let's build a todo app step by step:
1. First, show me the project structure you'd recommend
2. Then create the basic React component structure
3. Next, add state management
4. Then implement CRUD operations
5. Finally, add localStorage persistence"

### 3. Review Before Running

For complex changes:
```
Before running this:
1. Show me what files will be modified
2. Explain the approach
3. Highlight any potential risks
```

### 4. Iterative Refinement

```
User: "Create a user registration endpoint"
↓
AI: [creates endpoint]
↓
User: "Add email validation and password strength requirements"
↓
AI: [updates endpoint]
↓
User: "Now add rate limiting"
↓
AI: [adds rate limiting]
```

### 5. Test As You Go

```
After each significant change:
"Run the tests and tell me if anything broke"
"Can you write a test for this new function?"
"Show me how to test this manually"
```

## Advanced Patterns

### Pattern 1: Exploration → Planning → Implementation

```bash
# Phase 1: Exploration
claude
> "Research best practices for implementing OAuth2 in FastAPI"
[Press Shift+Tab twice for planning mode]

# Phase 2: Planning
> "Create implementation plan for our specific requirements"

# Phase 3: Implementation
[Press Shift+Tab to exit planning]
> "Implement the OAuth2 flow based on the plan"
```

### Pattern 2: Incremental Refactoring

```
1. "Identify code smells in src/services/user_service.py"
2. "Propose refactoring strategy without changing behavior"
3. "Implement first refactoring: extract validation logic"
4. "Run tests"
5. "Continue with next refactoring: simplify error handling"
```

### Pattern 3: Feature Development Workflow

```
1. "Review requirements in docs/feature-x.md"
2. ultrathink: "Design database schema for feature X"
3. "Generate migration file"
4. "Create API endpoint with OpenAPI documentation"
5. "Implement business logic with error handling"
6. "Write unit tests achieving >80% coverage"
7. "Create integration test"
8. "Update CLAUDE.md with new feature documentation"
```

## Troubleshooting

### Issue: AI modifies wrong files

**Solution:**
```
Before making changes:
1. Show me which files you'll modify
2. Wait for my confirmation
3. Then proceed with changes
```

### Issue: Changes don't match expectations

**Solution:**
```
Explain your reasoning for this implementation.
Why did you choose this approach over [alternative]?
```

### Issue: Complex task gets stuck

**Solution:**
```
Let's break this down:
1. First, just [simple subtask]
2. Once that works, we'll add [next piece]
```

### Issue: Context loss in long sessions

**Solution:**
1. Periodically update CLAUDE.md with new learnings
2. Use `/resume` to reference earlier successful approaches
3. Start fresh sessions for unrelated tasks

## Pro Tips

### Tip 1: Batch Related Changes
```
"In a single change, update all API endpoints to:
1. Use async/await
2. Add request validation
3. Include error handling
4. Add logging"
```

### Tip 2: Ask for Trade-offs
```
"Show me 3 approaches to implement caching:
1. In-memory (pros/cons)
2. Redis (pros/cons)
3. Database (pros/cons)

Recommend best for our scale (~1000 daily users)"
```

### Tip 3: Security Reviews
```
"Review this authentication code for security issues:
- SQL injection vulnerabilities
- XSS potential
- CSRF protection
- Secrets management
- Rate limiting"
```

### Tip 4: Documentation Generation
```
"Generate comprehensive documentation:
1. README.md with setup instructions
2. API.md with endpoint documentation
3. CONTRIBUTING.md with development guide
4. DEPLOY.md with deployment steps"
```

### Tip 5: Migration Assistance
```
"Help me migrate from Flask to FastAPI:
1. First, analyze current Flask app structure
2. Create equivalent FastAPI structure
3. Migrate routes one module at a time
4. Ensure tests pass after each migration"
```

## Memory Management

**Session Memory:**
- CLAUDE.md is always in context
- Recent messages are remembered
- Images reference persist as "Image N"

**Cross-Session Memory:**
- Use CLAUDE.md for persistent knowledge
- Document decisions and patterns
- Include gotchas and lessons learned

**Token Efficiency:**
- Be concise in requests
- Reference files instead of pasting content
- Use planning mode for research (doesn't generate code)
- Clean up CLAUDE.md periodically

## Quick Reference Card

```
Command              | Purpose
---------------------|--------------------------------
claude "task"        | Start new session
claude -c            | Continue last conversation
claude -r            | Resume from history
Shift+Tab (×2)       | Planning mode ON
Shift+Tab (×1)       | Planning mode OFF
Esc (×1)             | Stop generation
Esc (×2)             | View history
/init                | Generate CLAUDE.md
/ide                 | Setup IDE integration
/resume              | Select from history
Ctrl+V (Mac)         | Paste image
think                | Basic reasoning
ultrathink           | Maximum reasoning
```

## Resources

- **Official Documentation**: https://www.anthropic.com/engineering/claude-code-best-practices
- **GitHub**: https://github.com/anthropics/claude-code
- **Community Tips**: https://www.anthropic.com/docs/claude-code
