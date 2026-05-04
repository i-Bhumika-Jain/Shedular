# AI Integration Plan

## What AI Should Actually Do

AI should help with:

- converting natural language into planner actions
- schedule suggestions
- wellness-aware recommendations
- productivity coaching
- summarization of daily or weekly progress

AI should not directly own all business rules.

Keep deterministic rules in code, such as:

- recurring task creation
- task completion logic
- data validation
- date calculations
- permissions

## Best Architecture for AI

Browser -> API -> AI Service -> Model Provider

Never:

- expose API keys in frontend
- let the model write directly to the database without validation

## Safe AI Flow

1. user sends message
2. backend gathers relevant context
3. backend builds a prompt
4. AI returns structured output
5. backend validates the output
6. backend applies allowed actions
7. backend stores conversation and result

## Structured AI Output

Prefer structured JSON like:

```json
{
  "intent": "create_task",
  "tasks": [
    {
      "title": "Gym",
      "date": "2026-03-28",
      "startTime": "18:30",
      "category": "health"
    }
  ],
  "userMessage": "I added gym to tomorrow evening."
}
```

## AI Features for MVP

- natural language task creation
- mood-aware schedule suggestions
- daily planning assistant
- weekly summary

## AI Features for Phase 2

- long-term personalization
- proactive reminders
- pattern detection
- habit recommendations

## Senior Recommendation

Start with hybrid intelligence:

- rules for critical planner logic
- AI for interpretation and suggestions

That is more reliable than an AI-first architecture.
