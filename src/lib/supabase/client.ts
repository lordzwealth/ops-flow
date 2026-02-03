// src/lib/supabase/client.ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

export const createClient = () => {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Create new instance only once
  supabaseInstance = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseInstance;
};

// Export the singleton instance
export const supabase = createClient();
