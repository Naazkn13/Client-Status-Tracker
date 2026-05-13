-- ==========================================
-- CLIENT STATUS TRACKER - FULL SCHEMA (AUTH)
-- ==========================================

-- 1. Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  row_number integer NOT NULL,
  name text NOT NULL,
  industry text NOT NULL DEFAULT '',
  status_color text NOT NULL DEFAULT 'yellow',
  status_note text NOT NULL DEFAULT '',
  detailed_notes text NOT NULL DEFAULT '',
  updated_by text NOT NULL DEFAULT '',
  updated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2. Create status_history table
CREATE TABLE IF NOT EXISTS status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  status_color text NOT NULL DEFAULT 'yellow',
  status_note text NOT NULL DEFAULT '',
  detailed_notes text NOT NULL DEFAULT '',
  updated_by text NOT NULL DEFAULT '',
  status_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS status_history_client_id_idx ON status_history(client_id);
CREATE INDEX IF NOT EXISTS status_history_status_date_idx ON status_history(status_date DESC);

-- 4. Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Clients (Only Authenticated)
CREATE POLICY "Allow authenticated read clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Policies for Status History (Only Authenticated)
CREATE POLICY "Allow authenticated read status_history"
  ON status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert status_history"
  ON status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);
