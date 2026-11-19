import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, MISSING_ENV_MESSAGE } from "@/lib/env";

export async function createServerSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error(MISSING_ENV_MESSAGE);

  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {}
      },
    },
  });
}
