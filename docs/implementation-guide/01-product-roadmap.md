# Product Roadmap

## Current State

The current app is a good prototype. It already proves:

- planner workflows
- daily schedule tracking
- goals
- notes
- mood and energy logic
- basic assistant behavior

But it is not yet production-ready because:

- data is stored only in browser localStorage
- there is no real authentication
- there is no backend
- there is no database
- business logic lives mostly in one frontend file
- AI logic is rule-based and client-side

## Product Goal

Build a cross-device planner that works well on:

- mobile browser
- laptop browser
- future Android/iOS wrapper if needed

And supports:

- secure user accounts
- cloud sync
- schedules, goals, notes, reminders, progress tracking
- AI assistant for planning and suggestions
- clean admin/debug visibility

## High-Level Feature Modules

1. Authentication
- signup
- login
- password reset
- profile

2. Planner Core
- daily schedule
- recurring tasks
- task completion
- next-day prep
- notes
- goals

3. Wellness Layer
- mood
- energy
- period tracking
- low-energy schedule adaptation

4. AI Layer
- smart schedule suggestions
- natural language command parsing
- personalized coaching and reminders
- schedule optimization

5. Productivity Layer
- study progress
- saved links
- weekly review
- history and analytics

6. Platform Layer
- responsive UI
- API security
- database
- logging
- monitoring

## Build Strategy

Use a phased build.

Phase 1 should focus on stable product foundations, not advanced AI first.

Recommended order:

1. product structure
2. auth
3. database
4. planner CRUD
5. responsive UX polish
6. AI integration
7. analytics and advanced automations
