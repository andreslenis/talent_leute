import { getSession, requireAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";

type ContentRow = {
  id: string;
  week: number;
  title: string;
  body: string | null;
  published: boolean | null;
  created_at: string | null;
};

export default async function PortalContenidos() {
  await requireAuth();
  const { supabase } = await getSession();

  const { data } = await supabase
    .from("course_contents")
    .select("id, week, title, body, published, created_at")
    .eq("published", true)
    .order("week", { ascending: true });

  const contents = (data ?? []) as ContentRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contenidos de las 16 semanas</h1>
        <p className="mt-1 text-sm text-slate-600">
          Materiales publicados por el equipo: alemán geriátrico, comunicación, cuidado y simulación laboral.
        </p>
      </div>

      {contents.length === 0 ? (
        <EmptyState
          title="Todavía no hay contenidos publicados"
          description="El equipo irá habilitando el material por semana. Vuelve a revisar pronto."
        />
      ) : (
        <div className="space-y-4">
          {contents.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
                    {item.week}
                  </span>
                  <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                </div>
                <Badge tone="brand">Semana {item.week}</Badge>
              </div>
              {item.body && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{item.body}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
