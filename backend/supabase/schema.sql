-- =============================================================================
-- FRKWEAR — Supabase Schema
-- Run this entire file once in the Supabase SQL Editor before starting the app.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS throughout.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto;   -- needed by gen_random_uuid() and seed.sql


-- ===========================================================================
-- TABLES
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- admins
-- ---------------------------------------------------------------------------
create table if not exists admins (
  id            uuid        primary key default gen_random_uuid(),
  username      text        unique not null,
  password_hash text        not null,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists products (
  id                text        primary key,
  name              text        not null,
  price             numeric     not null check (price >= 0),
  compare_price     numeric              check (compare_price >= 0),
  category          text        not null check (category in ('Hoodies', 'T-Shirts', 'Full Sets')),
  gender            text[]      not null default '{}',
  badge             text        not null default ''
                                check (badge in ('NEW', 'LIMITED', 'SOLD OUT', '')),
  rating            numeric     not null default 0 check (rating >= 0 and rating <= 5),
  reviews           integer     not null default 0 check (reviews >= 0),
  colors            jsonb       not null default '[]'::jsonb,  -- [{name, hex}]
  sizes             text[]      not null default '{}',
  images            text[]      not null default '{}',
  description       text,
  care_instructions text,
  shipping_note     text,
  in_stock          boolean     not null default true,
  featured          boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_content  (flat key-value CMS — one row per content key)
-- ---------------------------------------------------------------------------
create table if not exists site_content (
  key        text        primary key,
  value      jsonb       not null,   -- string | number | array stored as JSON
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table if not exists orders (
  order_id       text        primary key,   -- "FRK-20260612-0001"
  items          jsonb       not null,      -- [{productId, name, price, quantity, size, color, imageUrl}]
  subtotal       numeric     not null check (subtotal >= 0),
  shipping       numeric     not null default 0 check (shipping >= 0),
  total          numeric     not null check (total >= 0),
  customer       jsonb       not null,      -- {name, email, phone, address, city, pincode}
  status         text        not null default 'Processing'
                             check (status in ('Processing', 'Shipped', 'Delivered', 'Cancelled')),
  payment_method text                 check (payment_method in ('upi', 'card', 'cod')),
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- analytics  (one row per calendar day)
-- ---------------------------------------------------------------------------
create table if not exists analytics (
  date                text    primary key,   -- "YYYY-MM-DD"
  page_views          integer not null default 0 check (page_views >= 0),
  add_to_cart_events  integer not null default 0 check (add_to_cart_events >= 0),
  purchases           integer not null default 0 check (purchases >= 0),
  revenue             numeric not null default 0 check (revenue >= 0)
);


-- ===========================================================================
-- INDEXES
-- ===========================================================================

-- Products
create index if not exists idx_products_category   on products (category);
create index if not exists idx_products_featured   on products (featured) where featured = true;
create index if not exists idx_products_badge      on products (badge)    where badge <> '';
create index if not exists idx_products_in_stock   on products (in_stock);
create index if not exists idx_products_created_at on products (created_at desc);

-- Orders
create index if not exists idx_orders_status     on orders (status);
create index if not exists idx_orders_created_at on orders (created_at desc);

-- Analytics
create index if not exists idx_analytics_date on analytics (date desc);


-- ===========================================================================
-- TRIGGERS
-- ===========================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at
  before update on products
  for each row execute procedure set_updated_at();

drop trigger if exists site_content_updated_at on site_content;
create trigger site_content_updated_at
  before update on site_content
  for each row execute procedure set_updated_at();


-- ===========================================================================
-- STORED FUNCTIONS
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- increment_analytics
-- Atomically inserts today's row if missing, then increments one named column.
-- Called by POST /api/analytics/event on the backend.
--
-- Example:
--   select increment_analytics('2026-06-12', 'page_views', 1);
--   select increment_analytics('2026-06-12', 'revenue', 1899);
-- ---------------------------------------------------------------------------
create or replace function increment_analytics(
  p_date   text,
  p_field  text,
  p_amount numeric
)
returns void language plpgsql as $$
begin
  if p_field not in ('page_views', 'add_to_cart_events', 'purchases', 'revenue') then
    raise exception 'invalid analytics field: %', p_field;
  end if;

  insert into analytics (date, page_views, add_to_cart_events, purchases, revenue)
  values (p_date, 0, 0, 0, 0)
  on conflict (date) do nothing;

  execute format(
    'update analytics set %I = %I + $1 where date = $2',
    p_field, p_field
  ) using p_amount, p_date;
end;
$$;

-- ---------------------------------------------------------------------------
-- analytics_summary
-- Single-query summary used by GET /api/analytics/summary.
-- ---------------------------------------------------------------------------
create or replace function analytics_summary()
returns table (
  total_revenue   numeric,
  total_orders    bigint,
  products_live   bigint,
  avg_order_value numeric
) language sql stable as $$
  select
    coalesce(sum(total) filter (where status = 'Delivered'), 0)          as total_revenue,
    count(*)                                                               as total_orders,
    (select count(*) from products where in_stock = true)                 as products_live,
    coalesce(
      sum(total) filter (where status = 'Delivered') /
      nullif(count(*) filter (where status = 'Delivered'), 0),
      0
    )                                                                      as avg_order_value
  from orders;
$$;

-- ---------------------------------------------------------------------------
-- analytics_top_products
-- Top N products by units sold across all Delivered orders.
-- Used by Dashboard and Analytics pages.
-- ---------------------------------------------------------------------------
create or replace function analytics_top_products(top_n integer default 5)
returns table (
  product_id   text,
  product_name text,
  units_sold   bigint,
  revenue      numeric
) language sql stable as $$
  select
    item->>'productId'                                     as product_id,
    item->>'name'                                          as product_name,
    sum((item->>'quantity')::int)                          as units_sold,
    sum((item->>'price')::numeric * (item->>'quantity')::int) as revenue
  from orders,
       jsonb_array_elements(items) as item
  where status = 'Delivered'
  group by item->>'productId', item->>'name'
  order by units_sold desc
  limit top_n;
$$;

-- ---------------------------------------------------------------------------
-- analytics_by_range
-- Chart data for GET /api/analytics/chart?range=7d|30d|90d.
-- Joins the analytics table with orders aggregated per day.
-- ---------------------------------------------------------------------------
create or replace function analytics_by_range(days_back integer default 30)
returns table (
  date        text,
  revenue     numeric,
  orders      bigint,
  page_views  integer
) language sql stable as $$
  select
    a.date,
    coalesce(a.revenue, 0)      as revenue,
    coalesce(a.purchases, 0)    as orders,
    coalesce(a.page_views, 0)   as page_views
  from analytics a
  where a.date >= to_char(current_date - (days_back || ' days')::interval, 'YYYY-MM-DD')
  order by a.date asc;
$$;


-- ===========================================================================
-- ROW LEVEL SECURITY
-- ===========================================================================
-- The Express backend uses the SERVICE ROLE KEY which bypasses RLS entirely.
-- These restrictive policies block any direct anon/browser access to the DB.

alter table admins       enable row level security;
alter table products     enable row level security;
alter table site_content enable row level security;
alter table orders       enable row level security;
alter table analytics    enable row level security;

-- Drop then recreate to avoid duplicate-policy errors on re-run
drop policy if exists "deny_all_admins"       on admins;
drop policy if exists "deny_all_products"     on products;
drop policy if exists "deny_all_site_content" on site_content;
drop policy if exists "deny_all_orders"       on orders;
drop policy if exists "deny_all_analytics"    on analytics;

create policy "deny_all_admins"       on admins       as restrictive using (false);
create policy "deny_all_products"     on products     as restrictive using (false);
create policy "deny_all_site_content" on site_content as restrictive using (false);
create policy "deny_all_orders"       on orders       as restrictive using (false);
create policy "deny_all_analytics"    on analytics    as restrictive using (false);

-- ===========================================================================
-- STORAGE BUCKET SETUP (run via Supabase Dashboard or Management API)
-- ===========================================================================
-- Cannot be created with SQL — follow these steps in the Supabase dashboard:
--
--   1. Go to Storage → New bucket
--   2. Name: frkwear-images
--   3. Public bucket: YES (images must be publicly accessible by the storefront)
--   4. File size limit: 5 MB
--   5. Allowed MIME types: image/jpeg, image/png, image/webp
--
-- The public URL pattern will be:
--   https://<project-ref>.supabase.co/storage/v1/object/public/frkwear-images/<path>
-- ===========================================================================
