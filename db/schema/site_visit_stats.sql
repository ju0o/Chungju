create table if not exists site_visit_stats (
  id text primary key,
  pathname text not null,
  guest_id text,
  visited_at timestamptz default now(),
  hour_bucket text
);
