"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/fields";

export type ContentItem = {
  id: string;
  week: number;
  title: string;
  body: string | null;
  published: boolean | null;
};

export function ContentManager({ items }: { items: ContentItem[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [week, setWeek] = useState("1");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setEditingId(null);
    setWeek("1");
    setTitle("");
    setBody("");
    setPublished(false);
  }

  function startEdit(item: ContentItem) {
    setEditingId(item.id);
    setWeek(String(item.week));
    setTitle(item.title);
    setBody(item.body ?? "");
    setPublished(Boolean(item.published));
    setError(null);
    setMessage(null);
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const numericWeek = Number(week);

    if (!Number.isFinite(numericWeek) || numericWeek < 1 || numericWeek > 16) {
      setError("La semana debe estar entre 1 y 16.");
      setLoading(false);
      return;
    }

    let saveError = null;

    if (editingId) {
      const { error } = await supabase
        .from("course_contents")
        .update({ week: numericWeek, title: title.trim(), body: body.trim() || null, published })
        .eq("id", editingId);
      saveError = error;
    } else {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("course_contents").insert({
        week: numericWeek,
        title: title.trim(),
        body: body.trim() || null,
        published,
        created_by: userData.user?.id ?? null,
      });
      saveError = error;
    }

    setLoading(false);

    if (saveError) {
      setError("No pudimos guardar el contenido.");
      return;
    }

    reset();
    setMessage("Contenido guardado.");
    router.refresh();
  }

  async function togglePublished(item: ContentItem) {
    const supabase = createClient();
    const { error } = await supabase
      .from("course_contents")
      .update({ published: !item.published })
      .eq("id", item.id);

    if (!error) router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? "Editar contenido" : "Nuevo contenido"}
        </h2>
        <form onSubmit={save} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            <Field label="Semana" htmlFor="week" required>
              <Input
                id="week"
                type="number"
                min={1}
                max={16}
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                required
              />
            </Field>
            <Field label="Título" htmlFor="title" required>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Field>
          </div>
          <Field label="Contenido" htmlFor="body" hint="Texto o enlaces que verá el alumno.">
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-32" />
          </Field>
          <Checkbox
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            label="Publicar para los alumnos"
          />

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear contenido"}
            </Button>
            {editingId && (
              <Button type="button" size="sm" variant="ghost" onClick={reset}>
                Cancelar edición
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            Todavía no hay contenidos creados.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Semana {item.week} · {item.title}
                  </p>
                  {item.body && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.body}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => togglePublished(item)}>
                    {item.published ? "Ocultar" : "Publicar"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                    Editar
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">{item.published ? "Publicado" : "Borrador"}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
