-- Run this once for projects that already applied supabase/schema.sql.
alter table public.uploads
  add column if not exists progress integer not null default 0;

alter table public.uploads
  add column if not exists progress_message text;

alter table public.uploads
  drop constraint if exists uploads_progress_check;

alter table public.uploads
  add constraint uploads_progress_check check (progress between 0 and 100);
