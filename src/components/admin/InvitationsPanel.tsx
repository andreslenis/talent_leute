"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/fields";

type InvitationRow = {
  id: string;
  code: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  created_at: string | null;
};

export function InvitationsPanel({ invitations }: { invitations: InvitationRow[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedCode(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase
      .from("invitations")
      .insert({
        email: email.trim().toLowerCase(),
        role: "alumno",
        created_by: userData.user?.id ?? null,
      })
      .select("code")
      .single();

    setLoading(false);

    if (insertError) {
      setError("No pudimos generar la invitación.");
      return;
    }

    setCreatedCode(data.code as string);
    setEmail("");
    router.refresh();
  }

  async function revoke(id: string) {
    const supabase = createClient();
    await supabase.from("invitations").update({ used_at: new Date().toISOString() }).eq("id", id);
    router.refresh();
  }

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">Nueva invitación</h2>
        <p className="mt-1 text-sm text-slate-600">
          El alumno usará este código en <span className="font-mono text-xs">/activar</span> con el mismo correo.
        </p>
        <form onSubmit={create} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <Field label="Correo del alumno" htmlFor="invite-email" required>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Generando..." : "Generar código"}
          </Button>
        </form>
        {error && <div className="mt-3"><Alert variant="danger">{error}</Alert></div>}
        {createdCode && (
          <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Código generado</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-[0.3em] text-teal-900">{createdCode}</p>
            <Button size="sm" variant="secondary" className="mt-2" onClick={() => copy(createdCode)}>
              {copied === createdCode ? "Copiado" : "Copiar código"}
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Expira</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invitations.map((invitation) => {
                const expired = new Date(invitation.expires_at).getTime() < Date.now();
                return (
                  <tr key={invitation.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold tracking-widest text-slate-900">{invitation.code}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{invitation.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={invitation.used_at ? "neutral" : expired ? "danger" : "success"}>
                        {invitation.used_at ? "Usado / revocado" : expired ? "Expirado" : "Vigente"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(invitation.expires_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => copy(invitation.code)}>
                          {copied === invitation.code ? "Copiado" : "Copiar"}
                        </Button>
                        {!invitation.used_at && !expired && (
                          <Button size="sm" variant="ghost" onClick={() => revoke(invitation.id)}>
                            Revocar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {invitations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                    Todavía no hay invitaciones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
