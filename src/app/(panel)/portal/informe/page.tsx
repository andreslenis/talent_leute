import { getSession, requireAuth } from "@/lib/auth";
import { statusLabel } from "@/lib/types";
import { formatCop, formatDate, formatDateTime } from "@/lib/format";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";
import { PrintButton } from "@/components/portal/PrintButton";

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  status: string | null;
  created_at: string | null;
  german_level: string | null;
  profession: string | null;
};

type PaymentRow = {
  id: string;
  amount_cop: number;
  method: string | null;
  verified: boolean | null;
  created_at: string | null;
  modality: string | null;
  total_cop: number | null;
};

type EvaluationRow = {
  id: string;
  week: number;
  score: number | null;
  passed: boolean | null;
  retry_count: number | null;
  reinforced: boolean | null;
  notes: string | null;
};

type InterviewRow = {
  id: string;
  interview_type: string | null;
  scheduled_at: string | null;
  result: string | null;
  observations: string | null;
};

type StageRow = {
  id: string;
  stage: string | null;
  notes: string | null;
  created_at: string | null;
};

const INTERVIEW_LABELS: Record<string, string> = {
  preselection: "Preselección",
  supervisor: "Supervisora",
  manager: "Gerencia",
};

export default async function InformePage() {
  const profile = await requireAuth();
  const { supabase } = await getSession();

  const { data: applicationRaw } = await supabase
    .from("applications")
    .select("id, full_name, email, phone, city, status, created_at, german_level, profession")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const application = applicationRaw as ApplicationRow | null;

  if (!application) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Mi informe</h1>
        <EmptyState
          title="Aún no hay información para tu informe"
          description="Cuando tu cuenta esté vinculada a una postulación podrás ver y descargar tu informe."
        />
      </div>
    );
  }

  const [{ data: paymentsRaw }, { data: evaluationsRaw }, { data: interviewsRaw }, { data: stagesRaw }] =
    await Promise.all([
      supabase
        .from("payments")
        .select("id, amount_cop, method, verified, created_at, modality, total_cop")
        .eq("application_id", application.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("evaluations")
        .select("id, week, score, passed, retry_count, reinforced, notes")
        .eq("user_id", profile.id)
        .order("week", { ascending: true }),
      supabase
        .from("interviews")
        .select("id, interview_type, scheduled_at, result, observations")
        .eq("application_id", application.id)
        .order("scheduled_at", { ascending: true }),
      supabase
        .from("pipeline_stages")
        .select("id, stage, notes, created_at")
        .eq("application_id", application.id)
        .order("created_at", { ascending: false }),
    ]);

  const payments = (paymentsRaw ?? []) as PaymentRow[];
  const evaluations = (evaluationsRaw ?? []) as EvaluationRow[];
  const interviews = (interviewsRaw ?? []) as InterviewRow[];
  const stages = (stagesRaw ?? []) as StageRow[];

  const verifiedTotal = payments.filter((p) => p.verified).reduce((sum, p) => sum + p.amount_cop, 0);
  const passed = evaluations.filter((e) => e.passed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Informe del alumno</h1>
          <p className="mt-1 text-sm text-slate-600">Estado financiero, historial académico y avance del proceso.</p>
        </div>
        <PrintButton />
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Talent Leute</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{application.full_name}</h2>
            <p className="text-sm text-slate-600">
              {application.email} · {application.phone ?? "Sin teléfono"}
            </p>
            <p className="text-sm text-slate-600">
              {application.city ?? "Sin ciudad"} · {application.profession ?? "Sin perfil"}
            </p>
          </div>
          <div className="text-right">
            <Badge tone={statusTone(application.status)}>{statusLabel(application.status)}</Badge>
            <p className="mt-2 text-xs text-slate-500">Alta: {formatDate(application.created_at)}</p>
            <p className="text-xs text-slate-500">Nivel de alemán: {application.german_level ?? "—"}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total verificado</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCop(verifiedTotal)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evaluaciones superadas</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {passed} / {evaluations.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Entrevistas</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{interviews.length}</p>
        </div>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Estado financiero</h3>
        {payments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Sin pagos registrados.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Fecha</th>
                  <th className="py-2 pr-4">Modalidad</th>
                  <th className="py-2 pr-4">Monto</th>
                  <th className="py-2 pr-4">Método</th>
                  <th className="py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-4 text-slate-600">{formatDate(p.created_at)}</td>
                    <td className="py-2 pr-4 capitalize text-slate-600">{p.modality ?? "—"}</td>
                    <td className="py-2 pr-4 font-medium text-slate-800">{formatCop(p.amount_cop)}</td>
                    <td className="py-2 pr-4 text-slate-600">{p.method ?? "—"}</td>
                    <td className="py-2">
                      <Badge tone={p.verified ? "success" : "warning"}>{p.verified ? "Verificado" : "Pendiente"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Historial académico (16 semanas)</h3>
        {evaluations.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Sin evaluaciones registradas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {evaluations.map((e) => (
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

      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Entrevistas</h3>
        {interviews.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Sin entrevistas agendadas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {interviews.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                  <p className="font-medium text-slate-800">
                    {INTERVIEW_LABELS[i.interview_type ?? ""] ?? i.interview_type ?? "Entrevista"}
                  </p>
                  <p className="text-xs text-slate-500">{formatDateTime(i.scheduled_at)}</p>
                  {i.observations && <p className="text-xs text-slate-500">{i.observations}</p>}
                </div>
                <Badge tone={i.result === "aprobada" ? "success" : "neutral"}>{i.result ?? "Pendiente"}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Avance del proceso</h3>
        {stages.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Sin movimientos registrados.</p>
        ) : (
          <ol className="mt-3 space-y-3 text-sm">
            {stages.map((s) => (
              <li key={s.id} className="border-l-2 border-teal-200 pl-3">
                <p className="font-medium text-slate-800">{statusLabel(s.stage)}</p>
                <p className="text-xs text-slate-500">{formatDate(s.created_at)}</p>
                {s.notes && <p className="text-slate-600">{s.notes}</p>}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
