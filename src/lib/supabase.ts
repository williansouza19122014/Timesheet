
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with default values for development
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'
);
