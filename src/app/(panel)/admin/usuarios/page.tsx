import { getSession, requireAdmin } from "@/lib/auth";
import { ROLE_LABELS, type Role } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card, StatCard } from "@/components/ui/card";
import { RoleSelect } from "@/components/admin/RoleSelect";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  created_at: string | null;
};

export default async function AdminUsers() {
  const me = await requireAdmin();
  const { supabase } = await getSession();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false });

  const profiles = (data ?? []) as ProfileRow[];
  const counts = profiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Usuarios y roles</h1>
        <p className="mt-1 text-sm text-slate-600">
          Los usuarios se crean en Supabase Auth; aquí solo se asigna el rol. Los postulantes no tienen cuenta.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(["alumno", "staff", "trainer", "admin"] as Role[]).map((role) => (
          <StatCard key={role} label={ROLE_LABELS[role]} value={counts[role] ?? 0} />
        ))}
      </div>

      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol actual</th>
                <th className="px-4 py-3">Cambiar rol</th>
                <th className="px-4 py-3">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{profile.full_name ?? "Sin nombre"}</p>
                    <p className="text-xs text-slate-500">{profile.email ?? "Sin correo"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={profile.role === "admin" ? "brand" : "neutral"}>{ROLE_LABELS[profile.role]}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <RoleSelect userId={profile.id} role={profile.role} disabled={profile.id === me.id} />
                    {profile.id === me.id && <p className="mt-1 text-xs text-slate-500">No puedes cambiar tu propio rol.</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(profile.created_at)}</td>
                </tr>
              ))}
              {profiles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">
                    Todavía no hay usuarios con perfil.
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
