alter table products add column if not exists stock integer not null default 0;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='products' and policyname='products_insert') then
    create policy "products_insert" on products for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='products' and policyname='products_update') then
    create policy "products_update" on products for update using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='products' and policyname='products_delete') then
    create policy "products_delete" on products for delete using (true);
  end if;
end $$;
