# Advanced Prompting Guide for AI

This guide provides comprehensive techniques for crafting effective prompts that maximize AI's performance.

## Key Principle: Data Before Instructions

**Put context/data FIRST, then instructions LAST**. This improves response quality by ~30%.

### Standard Structure:
```xml
<context>
[All background information, uploaded documents, examples, relevant data]
</context>

<instructions>
[Clear, specific task description with desired format]
</instructions>
```

## XML Tags for Structure

XML tags help AI parse complex prompts with multiple sections:

```xml
<context>
Project background and relevant details
</context>

<example>
Input: Sample customer inquiry
Output: Expected response format
</example>

<instructions>
1. Analyze the customer inquiry
2. Draft a response following the example format
3. Ensure tone is professional yet friendly
</instructions>

<constraints>
- Max 150 words
- Must include call to action
- Reference company policy section 3.2
</constraints>
```

Common useful tags:
- `<context>` - Background information
- `<instructions>` - Task to perform
- `<example>` - Input/output examples
- `<constraints>` - Rules and limitations
- `<data>` - Data to process
- `<format>` - Desired output structure

## Chain of Thought Prompting

Ask AI to show its reasoning process for better results on complex tasks:

```
<instructions>
Think through this step by step:

<thinking>
1. First, identify the key factors
2. Then, analyze each factor's impact
3. Finally, synthesize your recommendation
</thinking>

Provide your analysis and recommendation.
</instructions>
```

Alternative approaches:
- "Let's think through this step by step..."
- "Before answering, consider..."
- "Explain your reasoning, then provide your answer"
- "Show your work as you solve this"

## Role Assignment

Define AI's expertise and perspective for more accurate, tailored responses:

```
<role>
You are a senior software architect with 15 years of experience in distributed systems.
You specialize in microservices architecture and have worked extensively with cloud-native technologies.
You value simplicity, maintainability, and scalability.
</role>

<task>
Review this system design and suggest improvements.
</task>
```

Effective role elements:
- **Expertise level**: "senior", "expert", "specialist"
- **Domain**: "software architect", "financial analyst", "technical writer"
- **Specific knowledge**: "specializing in X", "with background in Y"
- **Perspective**: "You value Z", "You prioritize A over B"

## Few-Shot Examples

Provide 2-3 examples of input/output patterns for consistent results:

```
<instructions>
Transform customer feedback into structured insights.
</instructions>

<example 1>
Input: "The app is slow and crashes a lot. Also the UI is confusing."
Output:
- Performance: App speed and stability issues
- UX: Interface clarity problems
- Severity: High (crashes impacting usability)
</example>

<example 2>
Input: "Love the new feature! Would be nice to have dark mode though."
Output:
- Feature: Positive feedback on recent update
- Enhancement Request: Dark mode option
- Severity: Low (nice-to-have)
</example>

<example 3>
Input: "Can't figure out how to export my data."
Output:
- Documentation: Export feature not discoverable
- UX: Data export functionality unclear
- Severity: Medium (blocking workflow)
</example>

Now process this feedback: [USER FEEDBACK]
```

## Progressive Refinement

Start broad, then iteratively narrow focus:

**Step 1 - Initial broad request:**
"Analyze this dataset and tell me what stands out"

**Step 2 - Based on AI's response, drill down:**
"You mentioned revenue declining in Q3. Can you break that down by product line?"

**Step 3 - Further refinement:**
"For Product Line B specifically, what were the month-over-month changes?"

**Step 4 - Action-oriented:**
"Based on Product Line B's trajectory, what are 3 specific interventions we should consider?"

## Specifying Format and Style

Be explicit about desired output format:

### Length specification:
- "Provide a 200-word summary"
- "Write 3-5 bullet points"
- "Give me a one-sentence answer"
- "Explain in 2-3 paragraphs"

### Format specification:
```
<format>
Provide your response as:
1. Executive Summary (2-3 sentences)
2. Key Findings (bullet points)
3. Recommendations (numbered list)
4. Next Steps (action items with owners)
</format>
```

### Style specification:
```
<style>
- Tone: Professional but conversational
- Audience: Non-technical executives
- Avoid: Jargon, acronyms without explanation
- Include: Concrete examples and analogies
</style>
```

## Handling Ambiguity

When request could be interpreted multiple ways:

**Option 1 - Provide context to disambiguate:**
```
<context>
I'm the CEO preparing for a board meeting.
I need high-level strategic insights, not technical details.
Focus on business impact and competitive positioning.
</context>

Analyze this market report.
```

**Option 2 - Ask AI to consider multiple interpretations:**
```
This request could mean different things. Please:
1. Identify the 2-3 most likely interpretations
2. For each, provide a brief response
3. Ask me to clarify which direction to pursue
```

## Template Pattern

For recurring tasks, create reusable templates:

```
<template name="email-response">
<context>
Customer type: [B2B/B2C/Enterprise]
Issue category: [Technical/Billing/Feature Request]
Urgency: [Low/Medium/High]
</context>

<guidelines>
1. Acknowledge issue empathetically
2. Explain resolution steps clearly
3. Set expectations for timeline
4. Offer additional assistance
5. Professional yet warm tone
</guidelines>

<constraints>
- Max 150 words
- Include ticket number reference
- End with clear call to action
</constraints>
</template>

[Then fill in the specific details for each use]
```

## Comparative Analysis

When evaluating options:

```
<task>
Compare these three approaches and recommend the best one.
</task>

<criteria>
Evaluate based on:
1. Implementation complexity (weight: 30%)
2. Long-term maintainability (weight: 40%)
3. Initial cost (weight: 20%)
4. Time to market (weight: 10%)
</criteria>

<format>
For each approach:
- Pros and cons
- Score for each criterion
- Overall weighted score

Then provide clear recommendation with rationale.
</format>
```

## Iterative Refinement Pattern

Guide AI through multi-stage analysis:

```
<stage 1>
First, identify the top 5 themes in this customer feedback data.
Just list the themes - don't analyze yet.
</stage 1>

[AI responds]

<stage 2>
Good. Now for each theme, analyze:
- Frequency
- Sentiment
- Business impact
</stage 2>

[AI responds]

<stage 3>
Finally, based on that analysis, recommend our top 3 priorities with supporting rationale.
</stage 3>
```

## Avoiding Common Pitfalls

### DON'T: Vague or ambiguous
"Make this better"
"Fix this code"
"Improve my writing"

### DO: Specific and actionable
"Reduce sentence length and replace jargon with plain language for general audience"
"Refactor this function to use async/await and add error handling"
"Restructure this section to lead with main point, then supporting evidence"

### DON'T: Assume context
"Update the report" (which report? what changes?)

### DO: Provide clear context
"Update the Q3 Financial Report (uploaded above) to include September actuals and revise the forecast based on the new data"

### DON'T: Multiple unrelated requests in one prompt
"Also help me with X, and can you do Y, and explain Z"

### DO: One clear task per message, or clearly structured multi-part requests
```
<instructions>
I need help with three related aspects of this project:

1. First, review the architecture diagram
2. Then, suggest optimizations
3. Finally, create implementation tasks
</instructions>
```

## Quality Control Prompts

### Self-Critique Pattern:
"After providing your response, critique it and suggest how it could be improved"

### Alternative Perspectives:
"What are 3 different ways to approach this problem? Compare their trade-offs."

### Assumption Checking:
"What assumptions are you making in this analysis? Which are most critical to validate?"

### Red Team Pattern:
"Argue against this proposal as strongly as possible. What are its weakest points?"

## Advanced: Meta-Prompting

Ask AI to help improve your prompts:

```
I want to accomplish: [describe goal]

My current prompt is: [your prompt]

How could I restructure this prompt to get better results?
Consider:
- Context that's missing
- Structure and clarity
- Specificity of instructions
- Examples that would help
```

## Quick Reference

| Goal | Technique |
|------|-----------|
| Complex multi-part task | XML tags to structure sections |
| Need consistent format | Provide 2-3 examples |
| Requires deep thinking | Chain of thought prompting |
| Domain-specific output | Assign specific role/expertise |
| Recurring workflow | Create template with variables |
| Ambiguous request | Provide context or ask for clarification options |
| Long/detailed task | Break into stages, iterate |
| Need specific format | Use `<format>` tag with structure |
| Quality concerns | Request self-critique or alternatives |

## Examples in Action

### Example: Data Analysis Request

**Before (weak):**
"Analyze this spreadsheet"

**After (strong):**
```xml
<context>
I'm preparing for Q4 planning. This spreadsheet contains monthly sales data for our 5 product lines across 3 regions.
</context>

<instructions>
1. Identify the top 3 trends in the data
2. Flag any anomalies or unexpected patterns
3. Provide specific insights for each product line
4. Recommend 2-3 focus areas for Q4
</instructions>

<format>
- Executive summary (3 sentences)
- Key trends (bullet points with data support)
- Product line insights (one paragraph each)
- Q4 recommendations (prioritized list with rationale)
</format>

<constraints>
- Keep total response under 500 words
- Focus on actionable insights, not just description
- Assume audience is senior leadership (non-technical)
</constraints>
```

### Example: Creative Writing Request

**Before (weak):**
"Write a story about a robot"

**After (strong):**
```xml
<context>
I'm creating a children's book series about STEM concepts. Target age: 7-9 years old.
Each story should introduce a scientific concept through adventure.
</context>

<instructions>
Write a 500-word story about a robot learning about ecosystems.

The story should:
- Feature a curious robot protagonist
- Introduce the concept of interdependence in nature
- Include concrete examples (plants, animals, their relationships)
- Have a clear beginning, middle, and end
- End with a simple "what we learned" moment
</instructions>

<style>
- Language: Simple, engaging, age-appropriate
- Tone: Warm, encouraging, sense of wonder
- Avoid: Complex vocabulary, scary elements
- Include: Dialogue, sensory details, active scenes
</style>

<example>
Similar structure to our previous story about the robot learning about magnets - starts with curiosity, explores through experimentation, learns through experience.
</example>
```

### Example: Code Review Request

**Before (weak):**
"Review this code"

**After (strong):**
```xml
<role>
You are a senior backend engineer specializing in Python and API design.
You prioritize code maintainability, security, and performance.
You're reviewing code for a production system handling financial transactions.
</role>

<context>
This is a new API endpoint for processing refunds. It will handle ~1000 requests/day.
The team is early-career engineers, so educational feedback is valuable.
</context>

<instructions>
Review this code and provide:

1. Critical issues (security, correctness, data integrity)
2. Performance concerns
3. Maintainability suggestions
4. Python best practices violations

For each issue:
- Explain why it's a problem
- Show how to fix it
- Rate severity (High/Medium/Low)
</instructions>

<code>
[paste code here]
</code>
```

## Remember

- **Context first, instructions last** - improves response quality by ~30%
- **Be specific** - vague requests get vague responses
- **Provide examples** - show don't tell when possible
- **Iterate** - refine based on AI's responses
- **Use structure** - XML tags for complex requests
- **Define roles** - tailor expertise to your needs
