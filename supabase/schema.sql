create extension if not exists pgcrypto;

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  symbol_url text,
  primary_color text default '#7d2f8f',
  secondary_color text default '#f2a72c',
  whatsapp_number text,
  instagram_url text,
  maps_url text,
  admin_token text not null default encode(gen_random_bytes(24), 'hex'),
  reminder_time time,
  reminder_enabled boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists menu_days (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  date date not null,
  title text not null,
  price text,
  service_hours text,
  notes text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_day_id uuid not null references menu_days(id) on delete cascade,
  name text not null,
  category text not null,
  description text,
  price text,
  is_highlight boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists story_assets (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  menu_day_id uuid references menu_days(id) on delete set null,
  image_url text not null,
  template_name text not null default 'daily-menu-v1',
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  menu_day_id uuid references menu_days(id) on delete set null,
  event_type text not null,
  source text default 'direct',
  user_agent text,
  referrer text,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table if not exists reminder_settings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  channel text not null default 'whatsapp',
  reminder_time time not null,
  message_template text not null,
  enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_restaurants_slug on restaurants(slug);
create index if not exists idx_menu_days_restaurant_date on menu_days(restaurant_id, date desc);
create index if not exists idx_menu_items_menu_day on menu_items(menu_day_id, sort_order);
create index if not exists idx_events_restaurant_created on events(restaurant_id, created_at desc);
create index if not exists idx_events_type_source on events(event_type, source);
