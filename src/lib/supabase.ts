
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// These will be populated once Supabase is connected via the Lovable interface
export const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);
