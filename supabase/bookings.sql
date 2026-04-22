create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'new',
  source text not null default 'website',
  mode text not null check (mode in ('servicio', 'artista')),
  name text not null,
  email text not null,
  artist text,
  service text,
  date_label text,
  venue text,
  capacity int,
  event_type text,
  event_name text,
  budget text,
  notes text not null,
  timezone text not null
);

alter table public.bookings enable row level security;

drop policy if exists "allow_insert_bookings_anon" on public.bookings;
create policy "allow_insert_bookings_anon"
on public.bookings
for insert
to anon, authenticated
with check (true);
