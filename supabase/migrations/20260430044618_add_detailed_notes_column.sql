/*
  # Add detailed_notes column to clients

  Adds a long-form `detailed_notes` column for storing MOM, meeting minutes,
  and other extended notes alongside the existing short status note.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'detailed_notes'
  ) THEN
    ALTER TABLE clients ADD COLUMN detailed_notes text NOT NULL DEFAULT '';
  END IF;
END $$;
