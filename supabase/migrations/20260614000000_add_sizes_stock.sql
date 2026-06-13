ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes_stock jsonb DEFAULT '{}';
