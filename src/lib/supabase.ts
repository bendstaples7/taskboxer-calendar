import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Ensure environment variables are set
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Optional helper to confirm the database is reachable (for dev/debug)
export const initializeDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);

    if (error) {
      console.warn('Supabase schema check failed. Table may not exist yet.', error);
    } else {
      console.log('✅ Supabase connection and tasks table verified.');
    }

    return true;
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error);
    return false;
  }
};
