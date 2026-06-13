alter table orders add column if not exists courier_name text;
alter table orders add column if not exists courier_phone text;
alter table orders add column if not exists confirmed boolean not null default false;

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  buyer_tg_id bigint not null,
  rating int not null check (rating between 1 and 5),
  text text,
  photo_url text,
  created_at timestamptz not null default now()
);
alter table reviews enable row level security;
create policy "reviews_insert" on reviews for insert with check (true);
create policy "reviews_select" on reviews for select using (true);
