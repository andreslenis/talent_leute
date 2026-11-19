import { getSession, requireStaff } from "@/lib/auth";
import { statusLabel } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";
import { ApplicationStatusForm } from "@/components/admin/ApplicationStatusForm";

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  profession: string | null;
  german_level: string | null;
  status: string | null;
  created_at: string | null;
};

export default async function EquipoPostulantes() {
  await requireStaff();
  const { supabase } = await getSession();

  const { data } = await supabase
    .from("applications")
    .select("id, full_name, email, phone, city, profession, german_level, status, created_at")
    .order("created_at", { ascending: false });

  const applications = (data ?? []) as ApplicationRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Postulantes</h1>
        <p className="mt-1 text-sm text-slate-600">
          {applications.length} postulación(es). Actualiza la etapa y deja notas para el resto del equipo.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          title="Todavía no hay postulaciones"
          description="Cuando alguien complete el formulario público aparecerá aquí automáticamente."
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id} className="p-0">
              <details className="group">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{app.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {app.email} · {app.city ?? "Sin ciudad"} · {app.profession ?? "Sin perfil"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone(app.status)}>{statusLabel(app.status)}</Badge>
                    <span className="text-xs text-slate-500">{formatDate(app.created_at)}</span>
                    <span className="text-xs font-medium text-teal-700 group-open:hidden">Abrir</span>
                    <span className="hidden text-xs font-medium text-teal-700 group-open:inline">Cerrar</span>
                  </div>
                </summary>
                <div className="grid gap-4 border-t border-slate-100 px-5 py-4 lg:grid-cols-2">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Teléfono</dt>
                      <dd className="text-slate-800">{app.phone ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alemán</dt>
                      <dd className="text-slate-800">{app.german_level ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Etapa actual</dt>
                      <dd className="text-slate-800">{statusLabel(app.status)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alta</dt>
                      <dd className="text-slate-800">{formatDate(app.created_at)}</dd>
                    </div>
                  </dl>
                  <div>
                    <ApplicationStatusForm applicationId={app.id} status={app.status} notesLabel="Nota del equipo" />
                  </div>
                </div>
              </details>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        La ficha completa con datos sensibles, pagos e invitaciones está disponible para el rol administrador.
      </p>
    </div>
  );
}
