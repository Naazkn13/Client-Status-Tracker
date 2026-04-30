import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('client_updates').select('*').limit(1);
  console.log('client_updates:', error ? error.message : data);
  
  const { data: d2, error: e2 } = await supabase.from('updates').select('*').limit(1);
  console.log('updates:', e2 ? e2.message : d2);

  const { data: d3, error: e3 } = await supabase.rpc('get_schema');
  console.log('rpc:', e3 ? e3.message : d3);
}

check();
