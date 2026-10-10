-- Run this once for databases that already applied schema.sql before the engagement reason field was added.
alter table public.leads add column if not exists engagement_reason text;
