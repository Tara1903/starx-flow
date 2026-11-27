create table public.mobile_push_devices (
  platform text not null check (platform in ('android', 'ios')),
  token text not null check (octet_length(token) between 1 and 2048),
  user_id uuid not null references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (platform, token)
);

create index mobile_push_devices_user_id_idx on public.mobile_push_devices (user_id);

alter table public.mobile_push_devices enable row level security;
revoke all on public.mobile_push_devices from public, anon, authenticated;
grant select, insert, update, delete on public.mobile_push_devices to service_role;
