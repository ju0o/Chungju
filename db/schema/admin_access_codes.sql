create table if not exists admin_access_codes (
  id text primary key,
  code_hash text not null,
  role text not null check (role in ('super_admin', 'content_manager', 'field_moderator')),
  status text not null check (status in ('active', 'revoked', 'expired', 'used')),
  label text,
  expires_at timestamptz,
  created_at timestamptz default now(),
  created_by text,
  revoked_at timestamptz,
  revoked_by text
);
