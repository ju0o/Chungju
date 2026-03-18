create table if not exists generated_cards (
  id text primary key,
  guest_id text not null,
  template_key text,
  summary_json jsonb default '{}'::jsonb,
  image_url text,
  created_at timestamptz default now()
);
