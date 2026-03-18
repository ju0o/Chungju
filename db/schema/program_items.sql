create table if not exists program_items (
  id text primary key,
  title text not null,
  description text,
  location text,
  start_time_text text,
  end_time_text text,
  category text,
  status text not null check (status in ('scheduled', 'live', 'delayed', 'done', 'hidden')),
  is_featured boolean not null default false,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by text
);
