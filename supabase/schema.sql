create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user' check (role in ('admin', 'user')),
  plan text not null default 'free', -- Future billing/subscription placeholder.
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  phone text,
  status text not null default 'warm' check (status in ('hot', 'warm', 'cold', 'won', 'lost')),
  priority text check (priority in ('high', 'low', 'unclear')),
  engagement_pattern text check (engagement_pattern in ('price_only', 'engaged_evaluating', 'unclear')),
  engagement_reason text,
  summary text,
  objections text,
  promises_made text,
  suggested_followup text,
  suggested_followup_date date,
  last_contact_date date,
  followed_up boolean not null default false,
  raw_transcript text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  file_name text not null,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

insert into storage.buckets (id, name, public) values ('whatsapp-exports', 'whatsapp-exports', false) on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.uploads enable row level security;

create policy "Users can view their profile" on public.profiles for select using (id = auth.uid());
create policy "Users can update their profile" on public.profiles for update using (id = auth.uid());
create policy "Users can manage their leads" on public.leads for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage their uploads" on public.uploads for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can manage their export files" on storage.objects for all using (bucket_id = 'whatsapp-exports' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'whatsapp-exports' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
