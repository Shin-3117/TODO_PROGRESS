# AGENTS.md

You are a coding agent operating ONLY inside this repository.
Do not modify files outside the repo. Do not run destructive commands.
When unsure, choose the simplest approach that satisfies the MVP.

## Tech Stack (Required)

- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui components (Radix-based)
- Supabase (Auth: Google OAuth, Postgres as source of truth)

## State & Data Fetching (Guidelines)

- Default to server actions / simple fetch patterns first.
- If client state becomes non-trivial (filters, modals, cached selections), use **Zustand**.
- If you need robust caching, background refetch, optimistic updates, or request deduplication, use **TanStack React Query**.
- Do NOT add Zustand/React Query unless the complexity clearly justifies it. If you add them, explain why in the PR-style summary.

## Product Requirements (MVP)

### Core entities

- Plan: title, description(optional), unit, target_value
- Label: name, color(optional)
- PlanLabel: link table (plan_id, label_id)
- ProgressLog: plan_id, date(YYYY-MM-DD), delta(number), note(optional)

### Rules

- No parent/child plans. No hierarchy.
- A plan can have 0..N labels.
- Filter plans by label(s) and search text.

### Progress calculation

- current = SUM(progress_logs.delta) by plan
- progressRate = target_value > 0 ? clamp(current / target_value, 0..1) : 0
- Display current/target + unit, plus a progress bar and percentage.

## Screens

### 1) Plans Home: `/plans`

Header:

- Buttons: "계획 추가", "라벨 추가"
- Search input (title/description)
- Label filter UI (multi-select preferred; OR-match semantics)

List:

- Each plan row shows: title, progress bar, percentage, current/target + unit
- Right side button: "진행 등록" (opens modal)
  Modal:
- Inputs: delta, note
- date defaults to today (hidden or optional date picker)
- On save: create ProgressLog, refresh list

### 2) Plan Detail: `/plans/[id]`

Show:

- Title
- Progress (bar + % + current/target)
- Description
- Calendar view (daily deltas or marks)
- Log list (date, delta, note) newest first

## UI/UX Requirements

- Use Tailwind for styling.
- Use shadcn/ui components for:
  - Button, Input, Dialog(Modal), Dropdown/Popover, Badge(Labels), Calendar, Tabs(optional)
- Keep UI clean and consistent; avoid adding heavy UI libraries beyond shadcn/ui.
- The app should feel good on mobile and desktop.

## Supabase Requirements

- Google OAuth login
- Unauthenticated users are redirected to `/login`
- After login, redirect to `/plans`

### Database

- Keep SQL schema and RLS policies under `/supabase/sql/`
- Enable RLS on all tables (plans, labels, plan_labels, progress_logs)
- Policies must ensure user can only access rows where `user_id = auth.uid()`

### Env Vars

Use:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Code Organization

- `/src/domain`: types, progress computation helpers, label filtering helpers
- `/src/data`: supabase client + query functions (CRUD)
- `/src/app`: routes/screens (App Router)
- Prefer small, testable functions; avoid mixing DB code with UI components.

## Output expectations

- Update README with:
  - Local run instructions
  - Supabase setup (Google OAuth + redirect URLs)
  - Vercel deploy env vars
  - DB schema + RLS summary
- Provide a final change summary listing the touched/created files with one-line descriptions.
