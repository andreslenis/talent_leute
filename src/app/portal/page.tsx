"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function Portal() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      setRole(profile?.role ?? "candidate");
      const { data: payments } = await supabase
        .from("payments")
        .select("verified")
        .eq("verified", true)
        .limit(1);
      setPaid((payments?.length ?? 0) > 0);
      setLoading(false);
    });
  }, [router]);

  if (loading) return <section className="mx-auto max-w-5xl px-4 py-12">Cargando...</section>;

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 space-y-4">
      <h1 className="text-2xl font-bold">Portal Talent Leute</h1>
      <p className="text-sm text-slate-600">Rol: {role}</p>
      {role === "candidate" && !paid && (
        <p className="text-sm text-amber-600">Tu acceso al informe y contenidos se habilitará tras validar tu pago.</p>
      )}
      <div className="flex gap-4 text-sm">
        {(role !== "candidate" || paid) && <Link href="/portal/informe" className="underline">Informe</Link>}
        {(role !== "candidate" || paid) && <Link href="/portal/contenidos" className="underline">Contenidos 16 semanas</Link>}
        {(role === "staff" || role === "admin" || role === "trainer") && <Link href="/equipo" className="underline">Panel del equipo</Link>}
      </div>
    </section>
  );
}
