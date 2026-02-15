alter table public.plans enable row level security;
alter table public.labels enable row level security;
alter table public.plan_labels enable row level security;
alter table public.progress_logs enable row level security;

drop policy if exists plans_select_own on public.plans;
drop policy if exists plans_insert_own on public.plans;
drop policy if exists plans_update_own on public.plans;
drop policy if exists plans_delete_own on public.plans;

create policy plans_select_own
on public.plans
for select
using (auth.uid() = user_id);

create policy plans_insert_own
on public.plans
for insert
with check (auth.uid() = user_id);

create policy plans_update_own
on public.plans
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy plans_delete_own
on public.plans
for delete
using (auth.uid() = user_id);

drop policy if exists labels_select_own on public.labels;
drop policy if exists labels_insert_own on public.labels;
drop policy if exists labels_update_own on public.labels;
drop policy if exists labels_delete_own on public.labels;

create policy labels_select_own
on public.labels
for select
using (auth.uid() = user_id);

create policy labels_insert_own
on public.labels
for insert
with check (auth.uid() = user_id);

create policy labels_update_own
on public.labels
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy labels_delete_own
on public.labels
for delete
using (auth.uid() = user_id);

drop policy if exists plan_labels_select_own on public.plan_labels;
drop policy if exists plan_labels_insert_own_with_refs on public.plan_labels;
drop policy if exists plan_labels_update_own on public.plan_labels;
drop policy if exists plan_labels_delete_own on public.plan_labels;

create policy plan_labels_select_own
on public.plan_labels
for select
using (auth.uid() = user_id);

create policy plan_labels_insert_own_with_refs
on public.plan_labels
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.plans p
    where p.id = plan_id
      and p.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.labels l
    where l.id = label_id
      and l.user_id = auth.uid()
  )
);

create policy plan_labels_update_own
on public.plan_labels
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.plans p
    where p.id = plan_id
      and p.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.labels l
    where l.id = label_id
      and l.user_id = auth.uid()
  )
);

create policy plan_labels_delete_own
on public.plan_labels
for delete
using (auth.uid() = user_id);

drop policy if exists progress_logs_select_own on public.progress_logs;
drop policy if exists progress_logs_insert_own_with_plan on public.progress_logs;
drop policy if exists progress_logs_update_own_with_plan on public.progress_logs;
drop policy if exists progress_logs_delete_own on public.progress_logs;

create policy progress_logs_select_own
on public.progress_logs
for select
using (auth.uid() = user_id);

create policy progress_logs_insert_own_with_plan
on public.progress_logs
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.plans p
    where p.id = plan_id
      and p.user_id = auth.uid()
  )
);

create policy progress_logs_update_own_with_plan
on public.progress_logs
for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.plans p
    where p.id = plan_id
      and p.user_id = auth.uid()
  )
);

create policy progress_logs_delete_own
on public.progress_logs
for delete
using (auth.uid() = user_id);
