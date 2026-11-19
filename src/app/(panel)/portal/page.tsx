import Link from "next/link";
import { requireAuth, getSession } from "@/lib/auth";
import { homeForRole, statusLabel } from "@/lib/types";
import { formatCop, formatDate } from "@/lib/format";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";

type ApplicationRow = {
  id: string;
  status: string | null;
  created_at: string | null;
  city: string | null;
  profession: string | null;
  german_level: string | null;
};

type PaymentRow = {
  id: string;
  amount_cop: number;
  method: string | null;
  verified: boolean | null;
  created_at: string | null;
  modality: string | null;
};

export default async function PortalPage() {
  const profile = await requireAuth();
  const { supabase } = await getSession();

  const { data: application } = await supabase
    .from("applications")
    .select("id, status, created_at, city, profession, german_level")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<ApplicationRow>();

  const [{ data: payments }, { count: contentsCount }, { count: pendingEvaluations }] = await Promise.all([
    application
      ? supabase
          .from("payments")
          .select("id, amount_cop, method, verified, created_at, modality")
          .eq("application_id", application.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as PaymentRow[] }),
    supabase
      .from("course_contents")
      .select("id", { count: "exact", head: true })
      .eq("published", true),
    supabase
      .from("evaluations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("passed", false),
  ]);

  const paymentList = (payments ?? []) as PaymentRow[];
  const verifiedTotal = paymentList
    .filter((p) => p.verified)
    .reduce((sum, p) => sum + (p.amount_cop ?? 0), 0);
  const hasVerified = paymentList.some((p) => p.verified);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Hola,</p>
          <h1 className="text-2xl font-bold text-slate-900">{profile.full_name ?? "Alumno"}</h1>
          <p className="mt-1 text-sm text-slate-600">Este es el estado de tu proceso con Talent Leute.</p>
        </div>
        <Badge tone="brand">{profile.role === "alumno" ? "Alumno" : profile.role}</Badge>
      </div>

      {profile.role !== "alumno" && (
        <Alert variant="info">
          Tienes un rol interno.{" "}
          <Link href={homeForRole(profile.role)} className="font-semibold underline">
            Ir a tu panel
          </Link>
          .
        </Alert>
      )}

      {!application ? (
        <EmptyState
          title="Tu cuenta aún no está vinculada a una postulación"
          description="Cuando el equipo apruebe tu proceso y active tu código de invitación, aquí verás tu avance, pagos y contenidos."
          action={<ButtonLink href="/activar" variant="secondary" size="sm">Usar código de invitación</ButtonLink>}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Etapa actual</p>
              <div className="mt-2">
                <Badge tone={statusTone(application.status)}>{statusLabel(application.status)}</Badge>
              </div>
              <p className="mt-2 text-xs text-slate-500">Postulación del {formatDate(application.created_at)}</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pago verificado</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{formatCop(verifiedTotal)}</p>
              <p className="mt-1 text-xs text-slate-500">
                {hasVerified ? `${paymentList.filter((p) => p.verified).length} pago(s) confirmado(s)` : "Sin pagos confirmados"}
              </p>
            </Card>
            <Card>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contenidos publicados</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{contentsCount ?? 0}</p>
              <p className="mt-1 text-xs text-slate-500">Semanas disponibles para ti</p>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Mi proceso</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Ciudad</dt>
                  <dd className="font-medium text-slate-800">{application.city ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Perfil</dt>
                  <dd className="font-medium text-slate-800">{application.profession ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Nivel de alemán</dt>
                  <dd className="font-medium text-slate-800">{application.german_level ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Evaluaciones pendientes</dt>
                  <dd className="font-medium text-slate-800">{pendingEvaluations ?? 0}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <ButtonLink href="/portal/informe" size="sm" variant="secondary">
                  Ver informe completo
                </ButtonLink>
                <ButtonLink href="/portal/contenidos" size="sm">
                  Ir a contenidos
                </ButtonLink>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900">Pagos</h2>
              {paymentList.length === 0 ? (
                <p className="mt-2 text-sm text-slate-600">Aún no hay pagos registrados a tu nombre.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {paymentList.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-slate-800">{formatCop(p.amount_cop)}</p>
                        <p className="text-xs text-slate-500">
                          {p.modality ?? "—"} · {formatDate(p.created_at)}
                        </p>
                      </div>
                      <Badge tone={p.verified ? "success" : "warning"}>{p.verified ? "Verificado" : "Pendiente"}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {!hasVerified && (
            <Alert variant="warning">
              Tu acceso completo se habilita cuando el equipo verifica tu pago. Si ya enviaste el comprobante, escríbenos al
              WhatsApp oficial 305 249 8099.
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
