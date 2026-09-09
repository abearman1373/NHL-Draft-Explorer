import { createClient } from "@supabase/supabase-js";

// Server-only client. SUPABASE_SERVICE_ROLE_KEY must never be exposed to the
// browser (no NEXT_PUBLIC_ prefix) — every caller of this module runs in a
// Server Component or Route Handler.
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
