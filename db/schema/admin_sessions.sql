create table if not exists admin_sessions (
  id text primary key,
  access_code_id text not null,
  role text not null check (role in ('super_admin', 'content_manager', 'field_moderator')),
  session_token_hash text not null,
  issued_at timestamptz default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz,
  ip_hash text,
  user_agent_hash text,
  is_active boolean not null default true
);
