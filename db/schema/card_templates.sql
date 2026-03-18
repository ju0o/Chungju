create table if not exists card_templates (
  id text primary key,
  template_key text not null unique,
  title_text text,
  body_text text,
  closing_text text,
  badge_label text,
  save_button_label text,
  theme_name text,
  theme_payload_json jsonb default '{}'::jsonb,
  is_active boolean not null default true,
  updated_at timestamptz default now(),
  updated_by text
);
