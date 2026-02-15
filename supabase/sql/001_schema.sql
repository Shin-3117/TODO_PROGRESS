create extension if not exists pgcrypto;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text null,
  unit text not null,
  target_value numeric not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.plan_labels (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (plan_id, label_id)
);

create table if not exists public.progress_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete cascade,
  date date not null,
  delta numeric not null,
  note text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_plans_user_id on public.plans(user_id);
create index if not exists idx_labels_user_id on public.labels(user_id);
create index if not exists idx_plan_labels_user_label on public.plan_labels(user_id, label_id);
create index if not exists idx_progress_logs_user_plan_date on public.progress_logs(user_id, plan_id, date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_plans_updated_at on public.plans;
create trigger set_plans_updated_at
before update on public.plans
for each row
execute function public.set_updated_at();
