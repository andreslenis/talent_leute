"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { homeForRole, type Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/fields";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError || !data.user) {
        setError("Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      const role = ((profile?.role as Role | undefined) ?? "alumno") as Role;
      router.replace(homeForRole(role));
      router.refresh();
    } catch {
      setError("No pudimos conectar con el servidor. Revisa la configuración e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-gradient-to-br from-teal-700 to-teal-600 p-8 text-white md:flex">
        <div>
          <span className="inline-flex rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Portal privado
          </span>
          <h2 className="mt-6 text-2xl font-bold leading-tight">
            Tu proceso de formación con Talent Leute
          </h2>
          <p className="mt-3 text-sm text-teal-50">
            Accede al estado de tu proceso, los contenidos de las 16 semanas y tu informe.
          </p>
        </div>
        <ul className="mt-10 space-y-3 text-sm text-teal-50">
          <li>✓ Contenidos publicados por semana</li>
          <li>✓ Estado financiero e historial académico</li>
          <li>✓ Avance del proceso y entrevistas</li>
        </ul>
      </div>

      <div className="p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-slate-600">Acceso para alumnos, equipo y administración.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Correo electrónico" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Contraseña" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <div className="mt-6 space-y-2 border-t border-slate-100 pt-5 text-sm">
          <p className="text-slate-600">
            ¿Tienes un código de invitación?{" "}
            <Link href="/activar" className="font-semibold text-teal-700 hover:text-teal-800">
              Activa tu cuenta
            </Link>
          </p>
          <p className="text-slate-600">
            ¿Olvidaste tu contraseña?{" "}
            <Link href="/recuperar" className="font-semibold text-teal-700 hover:text-teal-800">
              Recuperar acceso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
