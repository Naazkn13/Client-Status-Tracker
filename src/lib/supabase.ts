import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type StatusColor = 'red' | 'yellow' | 'green' | 'blue' | 'black';

export interface Client {
  id: string;
  row_number: number;
  name: string;
  industry: string;
  status_color: StatusColor;
  status_note: string;
  updated_by: string;
  updated_at: string | null;
  created_at: string;
  detailed_notes: string;
}

export interface StatusHistory {
  id: string;
  client_id: string;
  status_color: StatusColor;
  status_note: string;
  detailed_notes: string;
  updated_by: string;
  status_date: string;
  created_at: string;
}

export interface ChangeRequest {
  id: string;
  date: string | null;
  client: string;
  cr_description: string;
  note: string;
  update_as_on: string;
  amount: number | null;
  bucket1_po_received: boolean;
  bucket2_efforts_not_approved: boolean;
  date_of_sharing: string | null;
  final_agreed_cost: number | null;
  start_date: string | null;
  uat_date: string | null;
  go_live_date: string | null;
  account_manager: string;
  created_at: string;
}
