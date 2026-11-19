import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { homeForRole, type Profile, type Role } from "@/lib/types";

export const getSession = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user };
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const { supabase, user } = await getSession();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      id: user.id,
      full_name: user.email ?? null,
      email: user.email ?? null,
      phone: null,
      whatsapp: null,
      role: "alumno" as Role,
      created_at: null,
    };
  }

  return {
    id: data.id,
    full_name: data.full_name,
    email: data.email ?? user.email ?? null,
    phone: (data as { phone?: string | null }).phone ?? null,
    whatsapp: (data as { whatsapp?: string | null }).whatsapp ?? null,
    role: (data.role as Role) ?? "alumno",
    created_at: (data as { created_at?: string | null }).created_at ?? null,
  };
});

export async function requireAuth(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(allowed: Role[]): Promise<Profile> {
  const profile = await requireAuth();
  if (!allowed.includes(profile.role)) redirect(homeForRole(profile.role));
  return profile;
}

export async function requireStaff(): Promise<Profile> {
  return requireRole(["staff", "trainer", "admin"]);
}

export async function requireAdmin(): Promise<Profile> {
  return requireRole(["admin"]);
}
