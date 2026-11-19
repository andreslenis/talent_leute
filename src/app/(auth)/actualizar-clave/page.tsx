"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/fields";

export default function ActualizarClavePage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setHasSession(Boolean(data.user)));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("No pudimos actualizar la contraseña. Solicita un enlace nuevo.");
      return;
    }
    router.replace("/login");
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
      <p className="mt-1 text-sm text-slate-600">Define una contraseña de al menos 8 caracteres.</p>

      {hasSession === false && (
        <div className="mt-6 space-y-4">
          <Alert variant="warning">
            El enlace expiró o no es válido. Solicita uno nuevo para continuar.
          </Alert>
          <Link href="/recuperar" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
            Solicitar enlace
          </Link>
        </div>
      )}

      {hasSession && (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Nueva contraseña" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field label="Confirmar contraseña" htmlFor="confirm" required>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Field>

          {error && <Alert variant="danger">{error}</Alert>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </form>
      )}
    </div>
  );
}
