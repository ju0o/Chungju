create table if not exists quote_items (
  id text primary key,
  content text not null,
  author text,
  source_book text,
  source text,
  category text,
  theme text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  updated_by text
);
