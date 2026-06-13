-- qty per order row (for accurate stock restore)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS qty INTEGER NOT NULL DEFAULT 1;

-- couriers registry
CREATE TABLE IF NOT EXISTS couriers (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tg_id      BIGINT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- allow courier bot (anon/service) to read/write couriers
ALTER TABLE couriers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service full access" ON couriers USING (true) WITH CHECK (true);
