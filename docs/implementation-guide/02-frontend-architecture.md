# Frontend Architecture

## Recommended Frontend Stack

- `Next.js`
- `TypeScript`
- `Tailwind CSS`
- `shadcn/ui`
- `React Hook Form`
- `Zod`
- `TanStack Query`
- `date-fns`

## Why `shadcn/ui`

Yes, `shadcn/ui` is the right choice here.

It is especially useful because:

- it is clean and modern
- it works very well with Tailwind
- it supports responsive UI nicely
- it gives reusable components like dialogs, sheets, tabs, cards, forms, calendars, drawers
- you own the component code instead of depending on a black-box package

## Components I Would Use

For your frontend, I would use:

- `Button`
- `Input`
- `Textarea`
- `Label`
- `Form`
- `Card`
- `Dialog`
- `Sheet`
- `Tabs`
- `Popover`
- `DropdownMenu`
- `Select`
- `Checkbox`
- `Switch`
- `Badge`
- `Calendar`
- `Tooltip`
- `Separator`
- `Skeleton`
- `Toast`
- `Avatar`

## Mobile and Laptop Design Strategy

Build mobile-first, then enhance for laptop.

### Mobile

- bottom navigation for primary sections
- compact cards
- slide-over sheets for edit flows
- one-column layout
- large touch targets

### Laptop

- left sidebar navigation
- wider dashboard cards
- split views where useful
- richer history and analytics panels

## Suggested Frontend Folder Structure

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
    ui/
    layout/
    planner/
    goals/
    notes/
    wellness/
    ai/
  features/
    auth/
    planner/
    goals/
    notes/
    wellness/
    ai/
  lib/
    api/
    auth/
    db/
    validations/
    utils/
    constants/
  hooks/
  types/
```

## Frontend Logic Principles

- keep UI components dumb where possible
- move business rules into feature services or hooks
- validate forms with `Zod`
- avoid putting all logic into one page file
- create one feature at a time with clear ownership

## Example Feature Split

- `features/planner/components`
- `features/planner/hooks`
- `features/planner/services`
- `features/planner/types`
- `features/planner/schema`

That keeps the code understandable as the app grows.
