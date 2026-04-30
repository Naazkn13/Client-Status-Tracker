/*
  # Add status_history table

  ## Overview
  Creates a history table so every status update is retained. The clients table
  continues to hold the *current* status. Each time a status is saved, a new row
  is inserted into status_history.

  ## New Tables
  ### status_history
  - id (uuid, primary key)
  - client_id (uuid, FK → clients.id, cascade delete)
  - status_color (text)
  - status_note (text)
  - detailed_notes (text)
  - updated_by (text)
  - status_date (date) — the date chosen by the user for this update
  - created_at (timestamptz) — when the record was inserted

  ## Security
  - RLS enabled
  - Anon can select, insert (same as clients table, internal tool)
*/

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

ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read status_history"
  ON status_history FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert status_history"
  ON status_history FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS status_history_client_id_idx ON status_history(client_id);
CREATE INDEX IF NOT EXISTS status_history_status_date_idx ON status_history(status_date DESC);
