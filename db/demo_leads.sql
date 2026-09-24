-- demo_leads — captures name + phone from the public demo page (/demo).
-- Already applied to the production Supabase project (uxdrldreaockdloqvojs).
-- Anon may INSERT (lead capture from the client); anon has NO select policy, so
-- leads are not publicly readable — read them via the service role / SQL / an
-- authenticated admin.

create table if not exists public.demo_leads (
  id          bigint generated always as identity primary key,
  name        text not null,
  phone       text not null,
  created_at  timestamptz not null default now()
);
create index if not exists demo_leads_phone_idx on public.demo_leads (phone);

alter table public.demo_leads enable row level security;

create policy anon_insert_leads on public.demo_leads for insert to anon with check (true);
