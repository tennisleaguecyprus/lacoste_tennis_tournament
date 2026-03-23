-- Run in Supabase → SQL Editor (once per project)

create table if not exists public.tournament_state (
  id text primary key default 'singleton',
  players jsonb not null default '{}'::jsonb,
  group_matches jsonb not null default '{}'::jsonb,
  third_tiebreak jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

alter table public.tournament_state enable row level security;

-- Anyone with the anon key can read (for public site + live polling)
create policy "tournament_state_select_anon"
  on public.tournament_state
  for select
  to anon, authenticated
  using (true);

-- No insert/update policies for anon — only service role (Netlify function) bypasses RLS

insert into public.tournament_state (id, players, group_matches, third_tiebreak)
values ('singleton', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb)
on conflict (id) do nothing;

-- Optional: enable Realtime on this table in Dashboard → Database → Replication
-- for instant updates without polling (advanced).
