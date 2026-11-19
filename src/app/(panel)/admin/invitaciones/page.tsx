import { getSession, requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { InvitationsPanel } from "@/components/admin/InvitationsPanel";

type InvitationRow = {
  id: string;
  code: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  created_at: string | null;
};

export default async function AdminInvitations() {
  await requireAdmin();
  const { supabase } = await getSession();

  const { data } = await supabase
    .from("invitations")
    .select("id, code, email, expires_at, used_at, created_at")
    .order("created_at", { ascending: false });

  const invitations = (data ?? []) as InvitationRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Invitaciones</h1>
        <p className="mt-1 text-sm text-slate-600">
          Códigos de un solo uso para que los alumnos aprobados creen su cuenta.
        </p>
      </div>

      <Card className="bg-slate-50">
        <p className="text-sm text-slate-700">
          La activación requiere <span className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</span> configurada en el
          servidor. Si falta, el alumno verá un aviso al intentar activar la cuenta.
        </p>
      </Card>

      <InvitationsPanel invitations={invitations} />
    </div>
  );
}
