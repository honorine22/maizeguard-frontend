create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  raw_label text,
  risk text not null,
  confidence numeric not null default 0,
  action text not null,
  file_name text not null,
  image_width integer,
  image_height integer,
  created_at timestamptz not null default now()
);

create index if not exists assessments_user_created_at_idx
  on public.assessments (user_id, created_at desc);

alter table public.assessments enable row level security;

drop policy if exists "Users can read their own assessments" on public.assessments;
create policy "Users can read their own assessments"
  on public.assessments
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own assessments" on public.assessments;
create policy "Users can insert their own assessments"
  on public.assessments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select, insert on public.assessments to authenticated;
