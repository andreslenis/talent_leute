import { getSession, requireStaff } from "@/lib/auth";
import { ContentManager, type ContentItem } from "@/components/admin/ContentManager";

export default async function EquipoContenidos() {
  await requireStaff();
  const { supabase } = await getSession();

  const { data } = await supabase
    .from("course_contents")
    .select("id, week, title, body, published")
    .order("week", { ascending: true });

  const items = (data ?? []) as ContentItem[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contenidos de 16 semanas</h1>
        <p className="mt-1 text-sm text-slate-600">Carga progresiva de materiales por semana y eje formativo.</p>
      </div>

      <ContentManager items={items} />
    </div>
  );
}
