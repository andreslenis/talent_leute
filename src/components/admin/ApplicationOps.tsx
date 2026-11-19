"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCop, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/fields";

export type PaymentItem = {
  id: string;
  amount_cop: number;
  method: string | null;
  verified: boolean | null;
  modality: string | null;
  created_at: string | null;
};

export function PaymentSection({
  applicationId,
  payments,
}: {
  applicationId: string;
  payments: PaymentItem[];
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [modality, setModality] = useState("contado");
  const [method, setMethod] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function addPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError("Ingresa un monto válido.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: insertError } = await supabase.from("payments").insert({
      application_id: applicationId,
      amount_cop: numeric,
      modality,
      method: method.trim() || null,
      verified,
    });

    setLoading(false);

    if (insertError) {
      setError("No pudimos registrar el pago.");
      return;
    }

    setAmount("");
    setMethod("");
    setVerified(false);
    router.refresh();
  }

  async function verify(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("payments").update({ verified: true }).eq("id", id);
    if (!error) router.refresh();
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Pagos</h2>

      {payments.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">Sin pagos registrados.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {payments.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0">
              <div>
                <p className="font-medium text-slate-800">{formatCop(p.amount_cop)}</p>
                <p className="text-xs text-slate-500">
                  {p.modality ?? "—"} · {p.method ?? "sin método"} · {formatDate(p.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={p.verified ? "success" : "warning"}>{p.verified ? "Verificado" : "Pendiente"}</Badge>
                {!p.verified && (
                  <Button size="sm" variant="subtle" onClick={() => verify(p.id)}>
                    Verificar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addPayment} className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-800">Registrar pago</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Monto (COP)" htmlFor="pay-amount" required>
            <Input
              id="pay-amount"
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Field>
          <Field label="Modalidad" htmlFor="pay-modality">
            <Select id="pay-modality" value={modality} onChange={(e) => setModality(e.target.value)}>
              <option value="contado">Contado</option>
              <option value="financiado">Financiado</option>
            </Select>
          </Field>
          <Field label="Método / referencia" htmlFor="pay-method">
            <Input id="pay-method" value={method} onChange={(e) => setMethod(e.target.value)} />
          </Field>
          <div className="flex items-end pb-2">
            <Checkbox
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              label="Marcar como verificado"
            />
          </div>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Guardando..." : "Registrar pago"}
        </Button>
      </form>
    </Card>
  );
}

export function InterviewSection({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [type, setType] = useState("preselection");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("45");
  const [result, setResult] = useState("pendiente");
  const [observations, setObservations] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function schedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("interviews").insert({
      application_id: applicationId,
      interview_type: type,
      scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      duration_min: Number(duration) || 45,
      result,
      observations: observations.trim() || null,
    });

    setLoading(false);

    if (insertError) {
      setError("No pudimos agendar la entrevista.");
      return;
    }

    setScheduledAt("");
    setObservations("");
    router.refresh();
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Agendar entrevista</h2>
      <form onSubmit={schedule} className="mt-3 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Tipo" htmlFor="interview-type">
            <Select id="interview-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="preselection">Preselección</option>
              <option value="supervisor">Supervisora</option>
              <option value="manager">Gerencia</option>
            </Select>
          </Field>
          <Field label="Fecha y hora" htmlFor="interview-date">
            <Input
              id="interview-date"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </Field>
          <Field label="Duración (min)" htmlFor="interview-duration">
            <Input
              id="interview-duration"
              type="number"
              min={15}
              step={15}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </Field>
          <Field label="Resultado" htmlFor="interview-result">
            <Select id="interview-result" value={result} onChange={(e) => setResult(e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </Select>
          </Field>
        </div>
        <Field label="Observaciones" htmlFor="interview-notes">
          <Textarea
            id="interview-notes"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="min-h-20"
          />
        </Field>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "Guardando..." : "Agendar entrevista"}
        </Button>
      </form>
    </Card>
  );
}

export function InvitationSection({
  applicationId,
  email,
}: {
  applicationId: string;
  email: string;
}) {
  const router = useRouter();
  const [inviteEmail, setInviteEmail] = useState(email);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function createInvitation() {
    setLoading(true);
    setError(null);
    setCode(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data, error: insertError } = await supabase
      .from("invitations")
      .insert({
        application_id: applicationId,
        email: inviteEmail.trim().toLowerCase(),
        role: "alumno",
        created_by: userData.user?.id ?? null,
      })
      .select("code")
      .single();

    setLoading(false);

    if (insertError) {
      setError("No pudimos crear la invitación.");
      return;
    }

    setCode(data.code as string);
    router.refresh();
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">Invitación al portal</h2>
      <p className="mt-1 text-sm text-slate-600">
        Genera un código para que el alumno cree su cuenta con su correo.
      </p>
      <div className="mt-3 space-y-3">
        <Field label="Correo del alumno" htmlFor="invite-email">
          <Input id="invite-email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
        </Field>
        {error && <Alert variant="danger">{error}</Alert>}
        {code && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">Código generado</p>
            <p className="mt-1 font-mono text-xl font-bold tracking-[0.25em] text-teal-900">{code}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" onClick={copyCode}>
                {copied ? "Copiado" : "Copiar"}
              </Button>
              <span className="self-center text-xs text-teal-800">Válido 14 días · un solo uso</span>
            </div>
          </div>
        )}
        <Button size="sm" onClick={createInvitation} disabled={loading || !inviteEmail.trim()}>
          {loading ? "Generando..." : "Generar código"}
        </Button>
      </div>
    </Card>
  );
}
