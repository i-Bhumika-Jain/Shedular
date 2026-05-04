# App Modernization Guide

This folder is the working plan to take the current planner from a local browser app to a production-ready product for phone and laptop.

## Recommended Direction

- Frontend: `Next.js` + `TypeScript` + `Tailwind CSS` + `shadcn/ui`
- Backend: `Next.js API routes` for MVP, or separate `NestJS`/`Express` service later
- Database: `PostgreSQL`
- ORM: `Prisma`
- Auth: `Clerk`, `Auth.js`, or `Supabase Auth`
- AI: OpenAI API with server-side prompt orchestration
- Hosting: `Vercel` for frontend, `Neon` or `Supabase` for Postgres

## Why This Stack

- `shadcn/ui` is a strong choice for your app because it gives fast, clean, mobile-friendly components without locking us into a heavy UI framework.
- `PostgreSQL` is the right choice because your planner data is relational and will grow into users, schedules, tasks, goals, notes, reminders, AI chat history, and analytics.
- `Next.js` gives us one clean codebase for laptop and phone web support, plus API endpoints, auth integration, and strong deployment options.

## Suggested Docs

- `01-product-roadmap.md`
- `02-frontend-architecture.md`
- `03-backend-and-api.md`
- `04-database-design.md`
- `05-ai-integration.md`
- `06-delivery-plan.md`

## Senior Recommendation

Do not keep growing the current localStorage-only app if your goal is a serious product.

Use the current app as:

- proof of concept
- feature reference
- UX flow reference
- logic reference

Build the production version as a new structured app with proper database, auth, APIs, validation, and AI service boundaries.
