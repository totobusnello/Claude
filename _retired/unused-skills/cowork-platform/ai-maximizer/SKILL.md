---
name: ai-maximizer
description: Comprehensive guide for maximizing AI's capabilities across all features and use cases. Use when users want to improve their AI workflow, learn advanced techniques, set up Projects effectively, write better prompts, leverage artifacts, optimize context management, use custom instructions, or generally get more value from AI. Applies to AI web/mobile chat, AI Code terminal tool, and API usage.
license: Complete terms in LICENSE.txt
---

# AI Maximizer

This skill provides comprehensive guidance for getting maximum value from AI across all platforms and features.

## Core Maximization Principles

### 1. Start with Context - Projects & Custom Instructions

**Projects (AI Pro/Team)** are the foundation for personalized, high-quality results:

- **Upload relevant knowledge** (up to 500 pages): past work examples, style guides, documentation, transcripts, schemas, company policies
- **Set custom instructions** that persist across all conversations in that project:
  - Define AI's role and expertise level
  - Specify desired tone, style, and format preferences
  - Include workflow preferences and output structures
  - Add any standing requirements or constraints
- **Organize by domain**: Create separate projects for different areas (work, personal, coding, writing, etc.)

**Custom Instructions Format:**
```
Role: [Define who AI should be - e.g., "You are an expert M&A analyst..."]

Context: [Your background, goals, preferences]

Response Format: [How you want outputs structured]

Constraints: [Any rules or limitations]

Style: [Tone preferences - formal, casual, concise, detailed]
```

### 2. Master Advanced Prompting Techniques

**See [references/prompting-guide.md](references/prompting-guide.md) for the complete advanced prompting reference**

Key techniques:
- **XML tags** for clear structure: `<instructions>`, `<context>`, `<example>`, `<constraints>`
- **Chain of thought**: Ask AI to think step-by-step and show reasoning
- **Role assignment**: Define specific expertise ("You are a senior software architect...")
- **Few-shot examples**: Provide 2-3 examples of desired input/output patterns
- **Progressive refinement**: Start broad, then iterate with feedback

**Prompt Structure (Data First):**
```
<context>
[All background information, examples, data]
</context>

<instructions>
[Clear, specific task description]
</instructions>
```

Putting data/context FIRST (before instructions) improves response quality by ~30%.

### 3. Leverage All Features Strategically

**Artifacts** - For substantial, reusable content:
- Documents (markdown, code files)
- React components and web apps
- Data visualizations
- Creative projects
- Anything you'll want to edit, download, or iterate on

**Web Search** - AI automatically searches when needed for:
- Current events and recent news
- Facts that may have changed since training cutoff (January 2025)
- Verification of specific claims or data
- Recent developments in fast-moving fields

**Memory** - AI remembers key details across conversations:
- Automatically captures important preferences and context
- Use "remember that..." or "don't forget..." to explicitly add to memory
- Say "forget about..." to remove information
- Check what's remembered with "what do you know about me?"

**File Upload & Creation**:
- Upload PDFs, images, documents, spreadsheets for analysis
- AI can create professional files (docx, pptx, xlsx, pdf)
- Use computer tools for advanced file manipulation

### 4. Optimize Context Management

**Progressive Disclosure:**
- Start with clear, specific requests
- Add context incrementally as needed
- Reference previous messages: "Building on the earlier analysis..."
- Use Projects to avoid repeating background information

**Conversation Continuity:**
- Use "continue" or "keep going" for long tasks
- Reference earlier work: "Using the framework from message 3..."
- AI can search past conversations when context is relevant

**Token Efficiency:**
- Be specific to avoid back-and-forth clarification
- Use examples instead of lengthy explanations
- Store reusable context in Projects, not repeated in every message

### 5. Platform-Specific Optimization

**AI Web/Mobile Chat:**
- Use Projects for recurring workflows
- Enable/disable features as needed in Settings
- Set user preferences for consistent style
- Use voice input for convenience
- Save important artifacts

**AI Code (Terminal):**
See [references/claude-code-tips.md](references/claude-code-tips.md) for comprehensive guidance including:
- Planning mode (Shift+Tab twice)
- Thinking modes (think, think hard, ultrathink)
- CLAUDE.md for project context
- Bypassing permissions mode
- IDE integration
- Custom commands
- Image analysis (Ctrl+V on Mac)

**API Usage:**
- Choose appropriate model (Sonnet 4.5 for intelligence, Haiku 4.5 for speed)
- Use system prompts for persistent instructions
- Implement proper error handling
- Cache frequently-used context
- Stream responses for better UX

## Workflow Patterns

### Pattern 1: Iterative Refinement
1. Start with a clear initial request
2. Review AI's output
3. Provide specific feedback on what to improve
4. Iterate until satisfied
5. Save final version to Project knowledge for future reference

### Pattern 2: Template-Based Creation
1. Create one high-quality example
2. Ask AI to extract the pattern/template
3. Save template to Project or custom instructions
4. Use template for future similar tasks
5. Example: "Based on this email, create a template for customer outreach"

### Pattern 3: Analysis Pipeline
1. Upload or paste data/documents
2. Ask for initial summary or analysis
3. Drill into specific areas of interest
4. Request visualizations or structured output
5. Generate final report or recommendations

### Pattern 4: Research & Synthesis
1. Ask AI to search for recent information
2. Request synthesis of multiple sources
3. Fact-check critical claims
4. Ask for citations and source links
5. Compile into comprehensive document

## Best Practices Checklist

**Before You Start:**
- [ ] Is there a Project for this domain? Create one if beneficial
- [ ] Does AI have necessary context? Upload files or add to custom instructions
- [ ] Are there similar past conversations? Reference them or search for them

**When Prompting:**
- [ ] Be specific about desired format, length, and style
- [ ] Include relevant examples if the task is nuanced
- [ ] Use XML tags for complex multi-part requests
- [ ] Put context/data first, instructions last

**During Work:**
- [ ] Give specific feedback rather than "try again"
- [ ] Ask AI to explain its reasoning if output is unexpected
- [ ] Break complex tasks into smaller steps
- [ ] Use artifacts for anything you'll want to edit or download

**After Completion:**
- [ ] Save valuable outputs to Project knowledge for future reference
- [ ] Update custom instructions if new preferences emerged
- [ ] Add to memory: "Remember that I prefer..." if pattern will recur

## Common Scenarios

**"I need this regularly"** → Create a Project with custom instructions and examples
**"This isn't quite right"** → Provide specific feedback: "Change X to Y because..."
**"How did you arrive at that?"** → Ask: "Explain your reasoning step by step"
**"I'm not sure what's possible"** → Ask: "What are 5 ways you could help with [goal]?"
**"This is taking too long"** → Break into smaller steps or be more specific upfront
**"I want AI to sound like me"** → Provide examples and add style preferences to Project

## Advanced Techniques

### Multi-Turn Workflows
For complex projects, structure as a series of clear steps:
1. "Let's work on [project]. First, analyze [aspect]"
2. Review analysis
3. "Good. Now create [deliverable] based on that analysis"
4. Iterate on deliverable
5. "Finally, summarize our key decisions"

### Quality Control
- Ask AI to critique its own work: "What are potential issues with this approach?"
- Request alternatives: "What are 3 other ways to solve this?"
- Use chain of thought: "Think through the pros and cons before recommending"

### Learning & Skill Development
- Ask AI to teach: "Explain [concept] as if I'm [level]"
- Request practice exercises: "Give me 3 problems to practice [skill]"
- Get feedback: "Review my [work] and suggest improvements"

## Troubleshooting

**If outputs are generic or off-target:**
- Add more specific context and examples
- Define a clearer role for AI
- Provide feedback on what specifically needs to change

**If AI seems to "forget" things:**
- Check if you're in a Project with relevant knowledge
- Explicitly add to memory: "Remember that..."
- Reference past conversations: AI can search them

**If you're not getting desired features:**
- Check Settings to ensure features are enabled
- Some features require AI Pro (Projects, extended context, priority access)

**If tasks are complex:**
- Break into smaller, sequential steps
- Use chain of thought prompting
- Create a Project with workflow templates

## Resources

- **Prompting Guide**: See [references/prompting-guide.md](references/prompting-guide.md)
- **AI Code Tips**: See [references/claude-code-tips.md](references/claude-code-tips.md)
- **Official Documentation**: https://docs.claude.com
- **Prompt Engineering Guide**: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview
