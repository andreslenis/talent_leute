import Link from "next/link";
import { getSession, requireStaff } from "@/lib/auth";
import { statusLabel } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  status: string | null;
  created_at: string | null;
};

export default async function EquipoHome() {
  const profile = await requireStaff();
  const { supabase } = await getSession();

  const [{ data: applicationsRaw }, { count: pendingPayments }, { count: publishedContents }] = await Promise.all([
    supabase
      .from("applications")
      .select("id, full_name, email, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("verified", false),
    supabase.from("course_contents").select("id", { count: "exact", head: true }).eq("published", true),
  ]);

  const applications = (applicationsRaw ?? []) as ApplicationRow[];
  const inCohort = applications.filter((a) => a.status === "cohorte").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Hola, {profile.full_name ?? "equipo"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Vista operativa de postulantes y contenidos. Para la ficha completa de cada postulación, el administrador entra
            desde <span className="font-mono text-xs">/admin</span>.
          </p>
        </div>
        <ButtonLink href="/equipo/postulantes" size="sm">
          Ver postulantes
        </ButtonLink>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Postulaciones" value={applications.length} />
        <StatCard label="En cohorte" value={inCohort} />
        <StatCard label="Pagos por verificar" value={pendingPayments ?? 0} />
        <StatCard label="Contenidos publicados" value={publishedContents ?? 0} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Últimas postulaciones</h2>
            <Link href="/equipo/postulantes" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              Ver todas
            </Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">Etapa</th>
                  <th className="py-2">Fecha</th>
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
                    <td className="py-2 text-xs text-slate-500">{formatDate(app.created_at)}</td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-sm text-slate-500">
                      Aún no hay postulaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Accesos rápidos</h2>
          <div className="mt-3 space-y-2 text-sm">
            <Link
              href="/equipo/postulantes"
              className="block rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
            >
              Postulantes y etapas del embudo →
            </Link>
            <Link
              href="/equipo/contenidos"
              className="block rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-800 hover:bg-slate-50"
            >
              Contenidos de las 16 semanas →
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Los pagos se registran y verifican desde la ficha del administrador.
          </p>
        </Card>
      </div>
    </div>
  );
}
