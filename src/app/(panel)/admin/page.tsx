import Link from "next/link";
import { getSession, requireAdmin } from "@/lib/auth";
import { statusLabel } from "@/lib/types";
import { formatCop, formatDate } from "@/lib/format";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  city: string | null;
  status: string | null;
  created_at: string | null;
};

type PaymentRow = {
  id: string;
  amount_cop: number;
  verified: boolean | null;
  created_at: string | null;
  applications: { id: string; full_name: string } | null;
};

export default async function AdminHome() {
  await requireAdmin();
  const { supabase } = await getSession();

  const [
    { data: applicationsRaw },
    { count: alumniCount },
    { count: pendingInvites },
    { data: paymentsRaw },
    { count: contentsCount },
  ] = await Promise.all([
    supabase
      .from("applications")
      .select("id, full_name, email, city, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "alumno"),
    supabase
      .from("invitations")
      .select("id", { count: "exact", head: true })
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString()),
    supabase
      .from("payments")
      .select("id, amount_cop, verified, created_at, applications(id, full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("course_contents").select("id", { count: "exact", head: true }).eq("published", true),
  ]);

  const applications = (applicationsRaw ?? []) as ApplicationRow[];
  const payments = (paymentsRaw ?? []) as unknown as PaymentRow[];
  const byStatus = applications.reduce<Record<string, number>>((acc, app) => {
    const key = app.status ?? "preinscripcion";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const inCohort = byStatus["cohorte"] ?? 0;
  const verifiedPayments = payments.filter((p) => p.verified).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resumen de administración</h1>
          <p className="mt-1 text-sm text-slate-600">
            Todo lo que los postulantes han introducido en el sistema, en un solo lugar.
          </p>
        </div>
        <ButtonLink href="/admin/postulaciones" size="sm">
          Ver postulaciones
        </ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Postulaciones" value={applications.length} hint="Recibidas en total" />
        <StatCard label="En cohorte" value={inCohort} hint="Alumnos activos en formación" />
        <StatCard label="Alumnos con cuenta" value={alumniCount ?? 0} hint="Perfiles con rol alumno" />
        <StatCard label="Invitaciones vigentes" value={pendingInvites ?? 0} hint="Códigos sin usar" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(byStatus)
          .sort((a, b) => b[1] - a[1])
          .map(([status, count]) => (
            <div key={status} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
                <span className="text-lg font-bold text-slate-900">{count}</span>
              </div>
            </div>
          ))}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Contenidos publicados</span>
            <span className="text-lg font-bold text-slate-900">{contentsCount ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Últimas postulaciones</h2>
            <Link href="/admin/postulaciones" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              Ver todas
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">Etapa</th>
                  <th className="py-2 pr-3">Fecha</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.slice(0, 6).map((app) => (
                  <tr key={app.id}>
                    <td className="py-2 pr-3">
                      <p className="font-medium text-slate-800">{app.full_name}</p>
                      <p className="text-xs text-slate-500">{app.email}</p>
                    </td>
                    <td className="py-2 pr-3">
                      <Badge tone={statusTone(app.status)}>{statusLabel(app.status)}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-500">{formatDate(app.created_at)}</td>
                    <td className="py-2 text-right">
                      <Link href={`/admin/postulaciones/${app.id}`} className="text-sm font-semibold text-teal-700 hover:text-teal-800">
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-500">
                      Aún no hay postulaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Últimos pagos</h2>
            <span className="text-xs text-slate-500">{verifiedPayments} verificados (últimos 5)</span>
          </div>
          {payments.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Sin pagos registrados.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 text-sm">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="font-medium text-slate-800">{formatCop(p.amount_cop)}</p>
                    <p className="text-xs text-slate-500">
                      {p.applications?.full_name ?? "Sin postulación"} · {formatDate(p.created_at)}
                    </p>
                  </div>
                  <Badge tone={p.verified ? "success" : "warning"}>{p.verified ? "Verificado" : "Pendiente"}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
