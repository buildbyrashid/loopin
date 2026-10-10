-- Run this once for projects that already applied supabase/schema.sql.
alter table public.leads add column if not exists business_need text;
alter table public.leads add column if not exists client_concerns text;
alter table public.leads add column if not exists buying_signals text;
alter table public.leads add column if not exists client_sentiment text;

alter table public.leads drop constraint if exists leads_client_sentiment_check;
alter table public.leads add constraint leads_client_sentiment_check
  check (client_sentiment is null or client_sentiment in ('positive', 'neutral', 'concerned', 'negative', 'mixed', 'unclear'));
