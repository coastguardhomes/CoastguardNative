import { createClient } from "@supabase/supabase-js";

let supabaseInstance;

export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Cliente SEGURO (solo ANON KEY)
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

export default getSupabase();
