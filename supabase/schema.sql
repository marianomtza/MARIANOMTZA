create extension if not exists "pgcrypto";

create table if not exists public.drawings (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  name text not null default 'Anónimo',
  message text not null default '',
  tool text not null default 'pencil',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  artist text not null default '',
  date text not null,
  city text not null,
  venue text not null default '',
  capacity text not null default '',
  event_type text not null default '',
  event_name text not null default '',
  budget text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.drawings enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "read drawings" on public.drawings;
create policy "read drawings"
on public.drawings
for select
to anon, authenticated
using (true);
