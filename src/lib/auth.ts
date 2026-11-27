"use server";

import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "trainer" | "student";

export async function getSession() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { user: null, error };
  }
  return { user: data.user, error: null };
}

export async function getCurrentUserRole(): Promise<UserRole | null> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return (data.role as UserRole) || null;
}

export async function requireTrainerOrAdmin(): Promise<{
  ok: boolean;
  role: UserRole | null;
  error?: string;
}> {
  const role = await getCurrentUserRole();
  if (!role || (role !== "trainer" && role !== "admin")) {
    return { ok: false, role, error: "No autorizado: se requiere rol de capacitador o administrador" };
  }
  return { ok: true, role };
}
