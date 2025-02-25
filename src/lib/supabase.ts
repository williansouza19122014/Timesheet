
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with the correct values
export const supabase = createClient(
  'https://pzeiwmtinjdhroyzcumi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6ZWl3bXRpbmpkaHJveXpjdW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzQxOTMsImV4cCI6MjA1NTgxMDE5M30.8gRrvxCfXb5jvy0SkhwS_Mt1Y3TQGJXk4823AW-zZjI'
);
