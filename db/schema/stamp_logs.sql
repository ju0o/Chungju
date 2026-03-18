create table if not exists stamp_logs (
  id text primary key,
  guest_id text not null,
  stamp_point_id text not null,
  stamp_slug text,
  acquired_at timestamptz default now(),
  user_agent_hash text,
  device_fingerprint_hash text
);
