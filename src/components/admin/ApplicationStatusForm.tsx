"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { APPLICATION_STATUSES, STATUS_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/fields";
import { Alert } from "@/components/ui/alert";

export function ApplicationStatusForm({
  applicationId,
  status,
  notesLabel = "Nota interna",
}: {
  applicationId: string;
  status: string | null;
  notesLabel?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status ?? "preinscripcion");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDone(false);

    const supabase = createClient();
    const { error: updateError } = await supabase.from("applications").update({ status: value }).eq("id", applicationId);

    if (updateError) {
      setError("No pudimos actualizar la etapa.");
      setLoading(false);
      return;
    }

    if (notes.trim()) {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from("pipeline_stages").insert({
        application_id: applicationId,
        stage: value,
        notes: notes.trim(),
        updated_by: userData.user?.id ?? null,
      });
    }

    setNotes("");
    setDone(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-3">
      <Field label="Etapa del proceso" htmlFor={`status-${applicationId}`}>
        <Select id={`status-${applicationId}`} value={value} onChange={(e) => setValue(e.target.value)}>
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={notesLabel} htmlFor={`notes-${applicationId}`} hint="Opcional: queda en el historial.">
        <Textarea
          id={`notes-${applicationId}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-20"
        />
      </Field>
      {error && <Alert variant="danger">{error}</Alert>}
      {done && <Alert variant="success">Etapa actualizada.</Alert>}
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Guardando..." : "Actualizar etapa"}
      </Button>
    </form>
  );
}
