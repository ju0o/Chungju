create table if not exists landing_sections (
  id text primary key,
  section_key text not null unique,
  title text,
  description text,
  is_enabled boolean not null default true,
  display_order integer not null default 0,
  payload_json jsonb default '{}'::jsonb,
  updated_at timestamptz default now(),
  updated_by text
);
