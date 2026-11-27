"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createMaterial,
  updateMaterial,
  uploadPdf,
  type MaterialFormData,
} from "@/lib/actions/materials";
import type { CourseContent, ContentType } from "@/types";
import { toast } from "sonner";
import { FileText, FileImage, Check, Save, Loader2 } from "lucide-react";

const formSchema = z.object({
  cohort_id: z.string().min(1, "Selecciona una cohorte"),
  week: z.string().min(1, "Semana obligatoria").refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 16, "Semana entre 1 y 16"),
  title: z.string().min(1, "El título es obligatorio").max(200),
  content_type: z.enum(["text", "pdf"]),
  body: z.string().optional().nullable(),
  content_html: z.string().optional().nullable(),
  file_path: z.string().optional().nullable(),
  order_index: z.string().optional().nullable(),
  estimated_minutes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface MaterialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: CourseContent | null;
  onSuccess: () => void;
}

export function MaterialForm({ open, onOpenChange, material, onSuccess }: MaterialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cohort_id: "",
      week: "1",
      title: "",
      content_type: "text" as ContentType,
      body: "",
      content_html: null,
      file_path: null,
      order_index: "0",
      estimated_minutes: null,
    },
  });

  useEffect(() => {
    if (open) {
      if (material) {
        form.reset({
          cohort_id: material.cohort_id,
          week: String(material.week),
          title: material.title,
          content_type: material.content_type,
          body: material.body ?? "",
          content_html: material.content_html ?? null,
          file_path: material.file_path ?? null,
          order_index: String(material.order_index ?? 0),
          estimated_minutes: material.estimated_minutes ? String(material.estimated_minutes) : null,
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPdfPath(material.file_path || null);
        setPdfFile(null);
      } else {
        form.reset({
          cohort_id: "",
          week: "1",
          title: "",
          content_type: "text" as ContentType,
          body: "",
          content_html: null,
          file_path: null,
          order_index: "0",
          estimated_minutes: null,
        });
        setPdfPath(null);
        setPdfFile(null);
      }
    }
  }, [open, material, form]);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return;
    }
    setPdfFile(file);
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfPath(null);
    form.setValue("file_path", null);
    form.setValue("content_html", null);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      let filePath = data.file_path ?? pdfPath ?? undefined;

      if (pdfFile && data.content_type === "pdf") {
        setUploading(true);
        const { path, error } = await uploadPdf(pdfFile);
        setUploading(false);
        if (error) {
          toast.error(error);
          return;
        }
        filePath = path || undefined;
      }

      const payload: MaterialFormData = {
        cohort_id: data.cohort_id,
        week: Number(data.week),
        title: data.title,
        content_type: data.content_type,
        body: data.content_type === "text" ? data.body : null,
        content_html: data.content_type === "text" ? data.content_html : null,
        file_path: filePath,
        order_index: data.order_index ? Number(data.order_index) : 0,
        estimated_minutes: data.estimated_minutes ? Number(data.estimated_minutes) : null,
        is_published: false,
      };

      if (material) {
        const { error } = await updateMaterial(material.id, payload);
        if (error) {
          toast.error(error);
          return;
        }
      } else {
        const { error } = await createMaterial(payload);
        if (error) {
          toast.error(error);
          return;
        }
      }

      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async (data: FormValues) => {
    const payload: MaterialFormData = {
      cohort_id: data.cohort_id,
      week: Number(data.week),
      title: data.title,
      content_type: data.content_type,
      body: data.content_type === "text" ? data.body : null,
      content_html: data.content_type === "text" ? data.content_html : null,
      file_path: data.file_path,
      order_index: data.order_index ? Number(data.order_index) : 0,
      estimated_minutes: data.estimated_minutes ? Number(data.estimated_minutes) : null,
      is_published: false,
    };
    try {
      const action = material
        ? () => updateMaterial(material.id, payload)
        : () => createMaterial(payload);
      const { error } = await action();
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Borrador guardado");
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{material ? "Editar material" : "Nuevo material"}</DialogTitle>
          <DialogDescription>
            Completa los datos del material de curso
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Cohorte</Label>
              <Select
                onValueChange={(value) => form.setValue("cohort_id", value)}
                defaultValue={form.getValues("cohort_id")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar cohorte" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SelectItem key={i} value={`cohort-${i}`}>
                      Cohorte {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semana</Label>
              <Input
                type="number"
                min={1}
                max={16}
                {...form.register("week")}
              />
              {form.formState.errors.week && (
                <span className="text-xs text-destructive">{form.formState.errors.week.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <span className="text-xs text-destructive">{form.formState.errors.title.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo de contenido</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  checked={form.getValues("content_type") === "text"}
                  onChange={() => form.setValue("content_type", "text")}
                />
                <FileText className="h-4 w-4" /> Texto enriquecido
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  checked={form.getValues("content_type") === "pdf"}
                  onChange={() => form.setValue("content_type", "pdf")}
                />
                <FileImage className="h-4 w-4" /> PDF
              </label>
            </div>
          </div>

          {form.getValues("content_type") === "text" && (
            <div className="space-y-2">
              <Label>Contenido (texto enriquecido)</Label>
              <div className="border border-input rounded-md">
                <ReactQuill
                  value={form.getValues("content_html") || ""}
                  onChange={(value) => form.setValue("content_html", value)}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      [{ indent: "-1" }, { indent: "+1" }],
                      ["link", "blockquote"],
                      ["clean"],
                    ],
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Usa el editor para dar formato al texto del material
              </p>
            </div>
          )}

          {form.getValues("content_type") === "pdf" && (
            <div className="space-y-2">
              <Label>Archivo PDF</Label>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {pdfFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                  <FileImage className="h-4 w-4 text-secondary" />
                  <span className="text-sm">{pdfFile.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePdf}
                    className="ml-auto h-8 px-2"
                  >
                    Remover
                  </Button>
                </div>
              )}
              {pdfPath && !pdfFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border">
                  <FileImage className="h-4 w-4 text-secondary" />
                  <span className="text-sm">PDF ya subido</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePdf}
                    className="ml-auto h-8 px-2"
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input
                type="number"
                min={0}
                {...form.register("order_index")}
              />
            </div>
            <div className="space-y-2">
              <Label>Tiempo estimado (minutos)</Label>
              <Input
                type="number"
                min={0}
                {...form.register("estimated_minutes")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={form.handleSubmit(handleSaveAsDraft)}
              disabled={isSubmitting || uploading}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar como Borrador
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || uploading}
              className="ml-auto gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Publicar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
