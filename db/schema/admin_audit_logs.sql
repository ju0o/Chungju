create table if not exists admin_audit_logs (
  id text primary key,
  admin_session_id text not null,
  admin_role text not null check (admin_role in ('super_admin', 'content_manager', 'field_moderator')),
  action_type text not null,
  resource_type text not null,
  resource_id text not null,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz default now()
);
