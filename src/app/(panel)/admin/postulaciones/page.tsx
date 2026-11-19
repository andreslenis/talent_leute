import Link from "next/link";
import { getSession, requireAdmin } from "@/lib/auth";
import { APPLICATION_STATUSES, STATUS_LABELS, statusLabel } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/fields";

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  profession: string | null;
  status: string | null;
  range_score: number | null;
  created_at: string | null;
};

const PER_PAGE = 20;

export default async function AdminApplications({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { supabase } = await getSession();
  const sp = await searchParams;

  const rawQuery = typeof sp.q === "string" ? sp.q : "";
  const status = typeof sp.status === "string" && sp.status !== "all" ? sp.status : "";
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);
  const safeQuery = rawQuery.trim().slice(0, 80).replace(/[,%()]/g, " ");

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  let query = supabase
    .from("applications")
    .select("id, full_name, email, phone, city, profession, status, range_score, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status);
  if (safeQuery) {
    query = query.or(
      `full_name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,document_id.ilike.%${safeQuery}%`,
    );
  }

  const { data, count } = await query;
  const applications = (data ?? []) as ApplicationRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (rawQuery) params.set("q", rawQuery);
    if (status) params.set("status", status);
    if (target > 1) params.set("page", String(target));
    const qs = params.toString();
    return `/admin/postulaciones${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Postulaciones</h1>
          <p className="mt-1 text-sm text-slate-600">{total} registro(s) · ficha completa con todos los campos introducidos.</p>
        </div>
      </div>

      <Card className="p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label htmlFor="q" className="mb-1 block text-sm font-medium text-slate-700">
              Buscar
            </label>
            <input
              id="q"
              name="q"
              defaultValue={rawQuery}
              placeholder="Nombre, correo o documento"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </div>
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700">
              Etapa
            </label>
            <Select id="status" name="status" defaultValue={status || "all"} className="min-w-44">
              <option value="all">Todas</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" size="sm">
            Filtrar
          </Button>
          {(rawQuery || status) && (
            <Link href="/admin/postulaciones" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Limpiar
            </Link>
          )}
        </form>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Postulante</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Ciudad</th>
                <th className="px-4 py-3">Perfil</th>
                <th className="px-4 py-3">Etapa</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{app.full_name}</p>
                    {app.range_score != null && (
                      <p className="text-xs text-slate-500">Puntaje orientativo: {app.range_score}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <p>{app.email}</p>
                    <p className="text-xs text-slate-500">{app.phone ?? "Sin teléfono"}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{app.city ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{app.profession ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(app.status)}>{statusLabel(app.status)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(app.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/postulaciones/${app.id}`}
                      className="text-sm font-semibold text-teal-700 hover:text-teal-800"
                    >
                      Ver ficha
                    </Link>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    No hay postulaciones con estos criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageHref(page - 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageHref(page + 1)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
