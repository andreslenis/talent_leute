"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/fields";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?next=/actualizar-clave`,
      });
      if (resetError) {
        setError("No pudimos enviar el correo. Intenta de nuevo en unos minutos.");
        return;
      }
      setSent(true);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Recuperar contraseña</h1>
      <p className="mt-1 text-sm text-slate-600">
        Te enviaremos un enlace para crear una nueva contraseña.
      </p>

      {sent ? (
        <div className="mt-6 space-y-4">
          <Alert variant="success" title="Revisa tu correo">
            Si el correo está registrado, recibirás un enlace en los próximos minutos. Revisa también la carpeta de spam.
          </Alert>
          <Link href="/login" className="block text-sm font-semibold text-teal-700 hover:text-teal-800">
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Correo electrónico" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
          </Button>
        </form>
      )}

      <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-600">
        <Link href="/login" className="font-semibold text-teal-700 hover:text-teal-800">
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
