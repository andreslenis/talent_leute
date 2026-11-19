import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession, requireAdmin } from "@/lib/auth";
import { APPLICATION_FIELD_GROUPS, statusLabel } from "@/lib/types";
import { formatDate, formatDateTime, formatValue } from "@/lib/format";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ApplicationStatusForm } from "@/components/admin/ApplicationStatusForm";
import { InterviewSection, InvitationSection, PaymentSection, type PaymentItem } from "@/components/admin/ApplicationOps";

type ApplicationRow = Record<string, unknown> & {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  status: string | null;
  created_at: string | null;
  user_id: string | null;
};

const INTERVIEW_LABELS: Record<string, string> = {
  preselection: "Preselección",
  supervisor: "Supervisora",
  manager: "Gerencia",
};

export default async function AdminApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { supabase } = await getSession();

  const { data: rawApplication } = await supabase.from("applications").select("*").eq("id", id).maybeSingle();
  if (!rawApplication) notFound();

  const application = rawApplication as ApplicationRow;

  const [
    { data: referrals },
    { data: stages },
    { data: interviews },
    { data: payments },
    { data: documents },
    { data: evaluations },
    { data: invitations },
  ] = await Promise.all([
    supabase
      .from("referrals")
      .select("id, referrer_name, referrer_contact, notes, created_at")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("pipeline_stages")
      .select("id, stage, notes, created_at")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("interviews")
      .select("id, interview_type, scheduled_at, duration_min, result, observations")
      .eq("application_id", id)
      .order("scheduled_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id, amount_cop, method, verified, modality, created_at")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("id, bucket, path, doc_type, created_at")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
    application.user_id
      ? supabase
          .from("evaluations")
          .select("id, week, score, passed, retry_count, reinforced, notes")
          .eq("user_id", application.user_id)
          .order("week", { ascending: true })
      : Promise.resolve({ data: [] }),
    supabase
      .from("invitations")
      .select("id, code, email, expires_at, used_at, created_at")
      .eq("application_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const paymentList = (payments ?? []) as PaymentItem[];
  const stageList = (stages ?? []) as { id: string; stage: string | null; notes: string | null; created_at: string | null }[];
  const interviewList = (interviews ?? []) as {
    id: string;
    interview_type: string | null;
    scheduled_at: string | null;
    duration_min: number | null;
    result: string | null;
    observations: string | null;
  }[];
  const referralList = (referrals ?? []) as {
    id: string;
    referrer_name: string | null;
    referrer_contact: string | null;
    notes: string | null;
    created_at: string | null;
  }[];
  const documentList = (documents ?? []) as {
    id: string;
    bucket: string;
    path: string;
    doc_type: string | null;
    created_at: string | null;
  }[];
  const evaluationList = (evaluations ?? []) as unknown as {
    id: string;
    week: number;
    score: number | null;
    passed: boolean | null;
    retry_count: number | null;
    reinforced: boolean | null;
    notes: string | null;
  }[];
  const invitationList = (invitations ?? []) as {
    id: string;
    code: string;
    email: string;
    expires_at: string;
    used_at: string | null;
  }[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/admin/postulaciones" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            ← Volver a postulaciones
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{application.full_name}</h1>
          <p className="text-sm text-slate-600">
            {application.email} · {application.phone ?? "Sin teléfono"} · {application.city ?? "Sin ciudad"}
          </p>
        </div>
        <div className="text-right">
          <Badge tone={statusTone(application.status)}>{statusLabel(application.status)}</Badge>
          <p className="mt-2 text-xs text-slate-500">Alta: {formatDate(application.created_at)}</p>
          {application.user_id && <p className="text-xs text-emerald-700">Cuenta vinculada</p>}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {APPLICATION_FIELD_GROUPS.map((group) => (
            <Card key={group.title}>
              <h2 className="text-lg font-semibold text-slate-900">{group.title}</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {group.fields.map((field) => (
                  <div key={field.key} className={field.type === "long" ? "sm:col-span-2" : ""}>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{field.label}</dt>
                    <dd className="mt-0.5 whitespace-pre-line text-sm text-slate-800">
                      {formatValue(application[field.key], field.type)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}

          <PaymentSection applicationId={application.id} payments={paymentList} />

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Entrevistas</h2>
            {interviewList.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Sin entrevistas registradas.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {interviewList.map((i) => (
                  <li key={i.id} className="py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-slate-800">
                        {INTERVIEW_LABELS[i.interview_type ?? ""] ?? i.interview_type ?? "Entrevista"}
                      </p>
                      <Badge tone={i.result === "aprobada" ? "success" : i.result === "rechazada" ? "danger" : "neutral"}>
                        {i.result ?? "Pendiente"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDateTime(i.scheduled_at)} · {i.duration_min ?? 45} min
                    </p>
                    {i.observations && <p className="mt-1 text-sm text-slate-600">{i.observations}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Historial del embudo</h2>
            {stageList.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Sin movimientos registrados.</p>
            ) : (
              <ol className="mt-3 space-y-3 text-sm">
                {stageList.map((s) => (
                  <li key={s.id} className="border-l-2 border-teal-200 pl-3">
                    <p className="font-medium text-slate-800">{statusLabel(s.stage)}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(s.created_at)}</p>
                    {s.notes && <p className="text-slate-600">{s.notes}</p>}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Referidos</h2>
            {referralList.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Sin referidos registrados.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {referralList.map((r) => (
                  <li key={r.id} className="py-2">
                    <p className="font-medium text-slate-800">{r.referrer_name ?? "Sin nombre"}</p>
                    <p className="text-xs text-slate-500">
                      {r.referrer_contact ?? "Sin contacto"} · {formatDate(r.created_at)}
                    </p>
                    {r.notes && <p className="text-slate-600">{r.notes}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Documentos</h2>
            {documentList.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Sin documentos cargados.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {documentList.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2 py-2">
                    <div>
                      <p className="font-medium text-slate-800">{d.doc_type ?? d.path}</p>
                      <p className="text-xs text-slate-500">
                        {d.bucket}/{d.path}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(d.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Evaluaciones (16 semanas)</h2>
            {evaluationList.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Sin evaluaciones registradas.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {evaluationList.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <div>
                      <p className="font-medium text-slate-800">Semana {e.week}</p>
                      {e.notes && <p className="text-xs text-slate-500">{e.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {e.reinforced && <Badge tone="info">Refuerzo</Badge>}
                      <span className="text-slate-600">{e.score != null ? `${e.score} pts` : "Sin nota"}</span>
                      <Badge tone={e.passed ? "success" : "warning"}>{e.passed ? "Aprobada" : "Pendiente"}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Acciones</h2>
            <p className="mt-1 text-sm text-slate-600">Los cambios quedan registrados en el historial.</p>
            <div className="mt-4">
              <ApplicationStatusForm applicationId={application.id} status={application.status} />
            </div>
          </Card>

          <InterviewSection applicationId={application.id} />

          <InvitationSection applicationId={application.id} email={application.email} />

          <Card>
            <h2 className="text-lg font-semibold text-slate-900">Invitaciones emitidas</h2>
            {invitationList.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">Sin invitaciones.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {invitationList.map((inv) => {
                  const expired = new Date(inv.expires_at).getTime() < Date.now();
                  return (
                    <li key={inv.id} className="rounded-lg border border-slate-200 p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold tracking-widest text-slate-900">{inv.code}</span>
                        <Badge tone={inv.used_at ? "neutral" : expired ? "danger" : "success"}>
                          {inv.used_at ? "Usado" : expired ? "Expirado" : "Vigente"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {inv.email} · expira {formatDate(inv.expires_at)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
