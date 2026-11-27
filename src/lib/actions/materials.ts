"use server";

import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { requireTrainerOrAdmin } from "@/lib/auth";
import type { CourseContent, MaterialFormInput } from "@/types";

export type { CourseContent };

const materialSchema = z.object({
  cohort_id: z.string().uuid(),
  week: z.number().int().min(1).max(16),
  title: z.string().min(1).max(200),
  content_type: z.enum(["text", "pdf"]),
  body: z.string().optional().nullable(),
  content_html: z.string().optional().nullable(),
  file_path: z.string().optional().nullable(),
  order_index: z.number().int().min(0).default(0),
  estimated_minutes: z.number().int().min(0).optional().nullable(),
  is_published: z.boolean().optional().default(false),
});

export type MaterialFormData = z.infer<typeof materialSchema>;

async function assertTrainerOrAdmin() {
  const result = await requireTrainerOrAdmin();
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.role;
}

async function assertCohortAccess(cohortId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No autenticado");
  }

  const { data, error } = await supabase
    .from("cohorts")
    .select("id, created_by")
    .eq("id", cohortId)
    .single();

  if (error || !data) {
    throw new Error("Cohorte no encontrada");
  }

  const role = await requireTrainerOrAdmin();
  if (role.role === "admin") {
    return;
  }

  if (data.created_by !== user.id) {
    throw new Error("No tienes acceso a esta cohorte");
  }
}

export async function listMaterials(
  cohortId: string,
  week?: number | null
): Promise<{ data: CourseContent[]; error: string | null }> {
  try {
    await assertCohortAccess(cohortId);

    let query = supabase
      .from("course_contents")
      .select("*")
      .eq("cohort_id", cohortId)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });

    if (week != null) {
      query = query.eq("week", week);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data as CourseContent[]) || [], error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function getCohortsForTrainer(): Promise<{
  data: { id: string; name: string }[];
  error: string | null;
}> {
  try {
    await assertTrainerOrAdmin();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: [], error: "No autenticado" };
    }

    const role = await requireTrainerOrAdmin();

    let query = supabase.from("cohorts").select("id, name").order("name", { ascending: true });

    if (role.role !== "admin") {
      query = query.eq("created_by", user.id);
    }

    const { data, error } = await query;

    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data as { id: string; name: string }[]) || [], error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : "Error desconocido" };
  }
}

export async function uploadPdf(file: File): Promise<{ path: string | null; error: string | null }> {
  try {
    await assertTrainerOrAdmin();

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `materials/${fileName}`;

    const { error } = await supabase.storage.from("materials").upload(filePath, file, {
      contentType: "application/pdf",
      upsert: false,
    });

    if (error) {
      return { path: null, error: error.message };
    }

    return { path: filePath, error: null };
  } catch (err) {
    return { path: null, error: err instanceof Error ? err.message : "Error al subir el PDF" };
  }
}

export async function createMaterial(input: MaterialFormInput): Promise<{ data: CourseContent | null; error: string | null }> {
  try {
    await assertTrainerOrAdmin();
    await assertCohortAccess(input.cohort_id);

    const validated = materialSchema.parse(input);

    const { data, error } = await supabase
      .from("course_contents")
      .insert([
        {
          cohort_id: validated.cohort_id,
          week: validated.week,
          title: validated.title,
          body: validated.body ?? null,
          content_html: validated.content_html ?? null,
          file_path: validated.file_path ?? null,
          content_type: validated.content_type,
          is_published: validated.is_published ?? false,
          published_at: validated.is_published ? new Date().toISOString() : null,
          order_index: validated.order_index ?? 0,
          estimated_minutes: validated.estimated_minutes ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as CourseContent, error: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { data: null, error: err.issues.map((e) => e.message).join(", ") };
    }
    return { data: null, error: err instanceof Error ? err.message : "Error al crear material" };
  }
}

export async function updateMaterial(
  id: string,
  input: Partial<MaterialFormInput>
): Promise<{ data: CourseContent | null; error: string | null }> {
  try {
    await assertTrainerOrAdmin();

    const { data: existing, error: fetchError } = await supabase
      .from("course_contents")
      .select("cohort_id, content_type, file_path")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return { data: null, error: "Material no encontrado" };
    }

    await assertCohortAccess(existing.cohort_id);

    const validated = materialSchema.partial().parse(input);

    const updateData: Record<string, unknown> = {};

    if (validated.cohort_id !== undefined) updateData.cohort_id = validated.cohort_id;
    if (validated.week !== undefined) updateData.week = validated.week;
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.body !== undefined) updateData.body = validated.body;
    if (validated.content_html !== undefined) updateData.content_html = validated.content_html;
    if (validated.file_path !== undefined) updateData.file_path = validated.file_path;
    if (validated.content_type !== undefined) updateData.content_type = validated.content_type;
    if (validated.order_index !== undefined) updateData.order_index = validated.order_index;
    if (validated.estimated_minutes !== undefined) updateData.estimated_minutes = validated.estimated_minutes;
    if (validated.is_published !== undefined) {
      updateData.is_published = validated.is_published;
      updateData.published_at = validated.is_published ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from("course_contents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as CourseContent, error: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { data: null, error: err.issues.map((e) => e.message).join(", ") };
    }
    return { data: null, error: err instanceof Error ? err.message : "Error al actualizar material" };
  }
}

export async function publishMaterial(id: string): Promise<{ error: string | null }> {
  try {
    await assertTrainerOrAdmin();

    const { error } = await supabase
      .from("course_contents")
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al publicar material" };
  }
}

export async function unpublishMaterial(id: string): Promise<{ error: string | null }> {
  try {
    await assertTrainerOrAdmin();

    const { error } = await supabase
      .from("course_contents")
      .update({ is_published: false })
      .eq("id", id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al despublicar material" };
  }
}

export async function deleteMaterial(id: string): Promise<{ error: string | null }> {
  try {
    await assertTrainerOrAdmin();

    const { data: existing, error: fetchError } = await supabase
      .from("course_contents")
      .select("file_path, content_type")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return { error: "Material no encontrado" };
    }

    const { error } = await supabase.from("course_contents").delete().eq("id", id);

    if (error) {
      return { error: error.message };
    }

    if (existing.content_type === "pdf" && existing.file_path) {
      await supabase.storage.from("materials").remove([existing.file_path]);
    }

    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error al eliminar material" };
  }
}
