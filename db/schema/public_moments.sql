create table if not exists public_moments (
  id text primary key,
  guest_id text not null,
  nickname text,
  text_content text not null,
  image_url text,
  hashtags_json jsonb default '[]'::jsonb,
  is_public boolean not null default true,
  is_hidden boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz default now(),
  moderated_at timestamptz,
  moderated_by text
);
