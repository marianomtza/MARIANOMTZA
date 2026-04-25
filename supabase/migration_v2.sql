-- ─────────────────────────────────────────────────────────────────────────────
-- migration_v2.sql
-- Safe to run on both a fresh database and one that already ran schema.sql.
-- All statements use IF NOT EXISTS / IF EXISTS guards.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- Core drawings table (idempotent — creates only if missing)
create table if not exists public.drawings (
  id          uuid        primary key default gen_random_uuid(),
  image       text        not null,           -- thumb WebP as base64 data URL
  image_url   text,                           -- full-res URL from Supabase Storage (nullable)
  thumb_url   text,                           -- thumb URL from Supabase Storage (nullable)
  name        text        not null default 'Anónimo',
  message     text        not null default '',
  tool        text        not null default 'pencil'
              check (tool in ('pencil','marker','ink','eraser')),
  status      text        not null default 'public'
              check (status in ('public','pending','hidden')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Add columns that may be missing on installs that ran the old schema.sql
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'drawings'
      and column_name  = 'image_url'
  ) then
    alter table public.drawings add column image_url text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'drawings'
      and column_name  = 'thumb_url'
  ) then
    alter table public.drawings add column thumb_url text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'drawings'
      and column_name  = 'status'
  ) then
    alter table public.drawings
      add column status text not null default 'public'
        check (status in ('public','pending','hidden'));
  end if;
end $$;

-- Bookings table (unchanged — idempotent)
create table if not exists public.bookings (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  artist      text        not null default '',
  date        text        not null,
  city        text        not null,
  venue       text        not null default '',
  capacity    text        not null default '',
  event_type  text        not null default '',
  event_name  text        not null default '',
  budget      text        not null default '',
  notes       text        not null default '',
  created_at  timestamptz not null default now()
);

-- RLS
alter table public.drawings enable row level security;
alter table public.bookings  enable row level security;

drop policy if exists "read public drawings" on public.drawings;
create policy "read public drawings"
  on public.drawings for select
  to anon, authenticated
  using (status = 'public');

-- Performant index for paginated public gallery
create index if not exists drawings_status_created
  on public.drawings (status, created_at desc);

-- ─── Supabase Storage (run manually or via CLI) ───────────────────────────────
-- If you want full-res WebP uploads, create a public bucket called 'drawings':
--
--   insert into storage.buckets (id, name, public)
--   values ('drawings', 'drawings', true)
--   on conflict (id) do nothing;
--
--   create policy "public read drawings storage"
--     on storage.objects for select
--     to anon using (bucket_id = 'drawings');
--
--   create policy "service write drawings storage"
--     on storage.objects for insert
--     to service_role using (bucket_id = 'drawings');
--
-- Without this bucket, image_url/thumb_url stay null and the site uses
-- the base64 thumb in the `image` column as fallback. Fully functional either way.
