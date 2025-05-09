/*
  # Branches management schema

  1. New Tables
    - branches
      - id (uuid, primary key)
      - name (text)
      - location (text)
      - phone (text)
      - manager (text)
      - created_at (timestamptz)

    - branch_representatives
      - id (uuid, primary key)
      - branch_id (uuid, foreign key)
      - name (text)
      - phone (text)
      - role (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Indexes
    - branch_id on branch_representatives
*/

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  phone text,
  manager text,
  created_at timestamptz DEFAULT now()
);

-- Create branch_representatives table
CREATE TABLE IF NOT EXISTS branch_representatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL REFERENCES branches(id),
  name text NOT NULL,
  phone text,
  role text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_representatives ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read branches" ON branches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read representatives" ON branch_representatives
  FOR SELECT TO authenticated USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS branch_representatives_branch_id_idx ON branch_representatives(branch_id);