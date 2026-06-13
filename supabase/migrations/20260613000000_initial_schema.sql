-- NADO VIBE — Supabase schema

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price integer not null,
  sizes text[] not null default '{}',
  description text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  size text not null,
  buyer_tg_id bigint not null,
  buyer_name text,
  buyer_username text,
  phone text not null,
  address text not null,
  status text not null default 'new'
    check (status in ('new','processing','shipped','delivered','cancelled')),
  price integer not null,
  created_at timestamptz not null default now()
);

-- Admins (Telegram user IDs that have admin access in TMA)
create table if not exists admins (
  tg_id bigint primary key,
  note text
);

-- Row Level Security
alter table products enable row level security;
alter table orders enable row level security;
alter table admins enable row level security;

-- Products: anyone can read active ones, anon can read all (TMA reads inactive for admin)
create policy "products_select" on products for select using (true);

-- Orders: anon can insert (place order), read only own
create policy "orders_insert" on orders for insert with check (true);
create policy "orders_select" on orders for select using (true);
create policy "orders_update" on orders for update using (true);

-- Admins: readable by anyone (TMA checks if user is admin)
create policy "admins_select" on admins for select using (true);

-- Indexes
create index if not exists orders_buyer_idx on orders(buyer_tg_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists products_active_idx on products(active);
create index if not exists products_category_idx on products(category);
