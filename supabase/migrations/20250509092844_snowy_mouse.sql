/*
  # Initial inventory management system schema

  1. New Tables
    - categories
      - id (uuid, primary key) 
      - name (text, unique)
      - created_at (timestamptz)

    - inventory_items
      - id (uuid, primary key)
      - name (text)
      - category_id (uuid, foreign key)
      - unit (text)
      - current_quantity (numeric)
      - min_quantity (numeric) 
      - price (numeric)
      - last_updated (timestamptz)
      - expiry_date (timestamptz)
      - created_at (timestamptz)

    - inventory_transactions
      - id (uuid, primary key)
      - type (text) - incoming/outgoing
      - item_id (uuid, foreign key)
      - quantity (numeric)
      - date (timestamptz)
      - notes (text)
      - supplier_id (uuid) - for incoming
      - branch_id (uuid) - for outgoing
      - representative_id (uuid) - for outgoing
      - total_price (numeric) - for incoming
      - paid_amount (numeric) - for incoming
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Indexes
    - category_id on inventory_items
    - item_id on inventory_transactions
    - type on inventory_transactions
    - date on inventory_transactions
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id),
  unit text NOT NULL,
  current_quantity numeric NOT NULL DEFAULT 0,
  min_quantity numeric NOT NULL DEFAULT 0,
  price numeric NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  expiry_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create inventory_transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('incoming', 'outgoing')),
  item_id uuid NOT NULL REFERENCES inventory_items(id),
  quantity numeric NOT NULL,
  date timestamptz DEFAULT now(),
  notes text,
  supplier_id uuid,
  branch_id uuid,
  representative_id uuid,
  total_price numeric,
  paid_amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read categories" ON categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read items" ON inventory_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read transactions" ON inventory_transactions
  FOR SELECT TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS inventory_items_category_id_idx ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS inventory_transactions_item_id_idx ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS inventory_transactions_type_idx ON inventory_transactions(type);
CREATE INDEX IF NOT EXISTS inventory_transactions_date_idx ON inventory_transactions(date);