
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with default or environment values
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy-key'
);
