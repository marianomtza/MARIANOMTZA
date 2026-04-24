-- Supabase setup for DEJA TU DIBUJO
create extension if not exists pgcrypto;

create table if not exists public.drawings (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image text,
  thumb_url text,
  name text,
  message text,
  tool text,
  palette text[],
  width int,
  height int,
  status text default 'public',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  ip_hash text,
  user_agent_hash text,
  source text default 'web'
);

alter table public.drawings
  add constraint drawings_status_check
  check (status in ('public', 'hidden', 'pending', 'flagged'));

create index if not exists drawings_status_created_idx on public.drawings (status, created_at desc);

-- Storage bucket recommendation
insert into storage.buckets (id, name, public)
values ('drawings-wall', 'drawings-wall', true)
on conflict (id) do nothing;

-- Public read access for gallery files
create policy "Public can read drawings wall"
on storage.objects for select
using (bucket_id = 'drawings-wall');

-- Service role can insert/update/delete by default.
