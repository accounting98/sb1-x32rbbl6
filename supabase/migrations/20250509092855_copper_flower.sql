/*
  # Suppliers management schema

  1. New Tables
    - suppliers
      - id (uuid, primary key)
      - name (text)
      - phone (text)
      - email (text)
      - address (text)
      - contact_person (text)
      - payment_terms (text)
      - total_purchases (numeric)
      - total_paid (numeric)
      - balance (numeric)
      - created_at (timestamptz)

    - supplier_transactions
      - id (uuid, primary key)
      - supplier_id (uuid, foreign key)
      - date (timestamptz)
      - type (text) - purchase/payment
      - amount (numeric)
      - paid (numeric)
      - balance (numeric)
      - notes (text)
      - related_transaction_id (uuid)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Indexes
    - supplier_id on supplier_transactions
    - date on supplier_transactions
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  contact_person text,
  payment_terms text,
  total_purchases numeric NOT NULL DEFAULT 0,
  total_paid numeric NOT NULL DEFAULT 0,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create supplier_transactions table
CREATE TABLE IF NOT EXISTS supplier_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id),
  date timestamptz DEFAULT now(),
  type text NOT NULL CHECK (type IN ('purchase', 'payment')),
  amount numeric NOT NULL,
  paid numeric NOT NULL,
  balance numeric NOT NULL,
  notes text,
  related_transaction_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read suppliers" ON suppliers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read supplier transactions" ON supplier_transactions
  FOR SELECT TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS supplier_transactions_supplier_id_idx ON supplier_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS supplier_transactions_date_idx ON supplier_transactions(date);