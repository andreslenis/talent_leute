"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Pause,
  Check,
  FileText,
  FileImage,
  Search,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  listMaterials,
  getCohortsForTrainer,
  publishMaterial,
  unpublishMaterial,
  deleteMaterial,
  type CourseContent,
} from "@/lib/actions/materials";
import { formatDate } from "@/lib/utils";
import { MaterialForm } from "./material-form";

function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <Badge
      variant={isPublished ? "secondary" : "default"}
      className={isPublished
        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"}
    >
      {isPublished ? "Publicado" : "Borrador"}
    </Badge>
  );
}

function TypeBadge({ contentType }: { contentType: string }) {
  const isPdf = contentType === "pdf";
  return (
    <Badge variant="outline" className="text-xs">
      {isPdf ? (
        <>
          <FileImage className="mr-1 h-3 w-3" /> PDF
        </>
      ) : (
        <>
          <FileText className="mr-1 h-3 w-3" /> Texto
        </>
      )}
    </Badge>
  );
}

export function MaterialsTableClient() {
  const [cohorts, setCohorts] = useState<{ id: string; name: string }[]>([]);
  const [materials, setMaterials] = useState<CourseContent[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CourseContent | null>(null);

  const loadCohorts = useCallback(async () => {
    const { data, error } = await getCohortsForTrainer();
    if (error) {
      toast.error(error);
      return;
    }
    setCohorts(data || []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCohorts();
  }, [loadCohorts]);

  const loadMaterials = useCallback(async () => {
    if (!selectedCohortId) return;
    setLoading(true);
    try {
      const { data, error } = await listMaterials(selectedCohortId, selectedWeek ?? undefined);
      if (error) {
        toast.error(error);
        return;
      }
      setMaterials(data || []);
    } finally {
      setLoading(false);
    }
  }, [selectedCohortId, selectedWeek, refreshKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMaterials();
  }, [loadMaterials]);

  const handlePublish = async (id: string) => {
    const { error } = await publishMaterial(id);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Material publicado");
    setRefreshKey((k) => k + 1);
  };

  const handleUnpublish = async (id: string) => {
    const { error } = await unpublishMaterial(id);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Material despublicado");
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este material?")) {
      return;
    }
    setDeletingId(id);
    try {
      const { error } = await deleteMaterial(id);
      if (error) {
        toast.error(error);
        return;
      }
      toast.success("Material eliminado");
      setRefreshKey((k) => k + 1);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreate = () => {
    setEditingMaterial(null);
    setFormOpen(true);
  };

  const handleEdit = (material: CourseContent) => {
    setEditingMaterial(material);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingMaterial(null);
    toast.success("Material guardado");
    setRefreshKey((k) => k + 1);
  };

  if (!selectedCohortId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Materiales</h1>
          <p className="text-muted-foreground">
            Gestiona los materiales de tus cohortes. Selecciona una cohorte para comenzar.
          </p>
        </div>

        <div className="max-w-md">
          <Label>Cohorte</Label>
          <Select
            value={selectedCohortId ?? ""}
            onValueChange={(value) => {
              setSelectedCohortId(value || null);
              setSelectedWeek(null);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar cohorte" />
            </SelectTrigger>
            <SelectContent>
              {cohorts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted p-6 rounded-lg text-center text-muted-foreground">
          Selecciona una cohorte para ver sus materiales
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Materiales</h1>
          <p className="text-muted-foreground">
            Gestiona los materiales de la cohorte seleccionada
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreate}
            className="gap-2"
            disabled={loading}
          >
            <Plus className="h-4 w-4" /> Nuevo material
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Select
            value={selectedCohortId ?? ""}
            onValueChange={(value) => {
              setSelectedCohortId(value || null);
              setSelectedWeek(null);
            }}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Seleccionar cohorte" />
            </SelectTrigger>
            <SelectContent>
              {cohorts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full sm:w-48">
          <Label htmlFor="week-filter" className="sr-only">Semana</Label>
          <Input
            id="week-filter"
            type="number"
            min="1"
            max="16"
            placeholder="Semana"
            value={selectedWeek ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedWeek(v === "" ? null : parseInt(v, 10));
            }}
          />
        </div>

        <Button
          onClick={() => setRefreshKey((k) => k + 1)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Actualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="animate-spin h-6 w-6" />
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-muted p-8 rounded-lg text-center text-muted-foreground">
          No hay materiales en esta cohorte
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3">Semana</th>
                <th className="pb-3">Título</th>
                <th className="pb-3">Tipo</th>
                <th className="pb-3">Estado</th>
                <th className="pb-3">Creado</th>
                <th className="pb-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="border-b hover:bg-muted/50">
                  <td className="py-4 font-medium">{m.week}</td>
                  <td className="py-4">{m.title}</td>
                  <td className="py-4">
                    <TypeBadge contentType={m.content_type} />
                  </td>
                  <td className="py-4">
                    <StatusBadge isPublished={m.is_published} />
                  </td>
                  <td className="py-4 text-muted-foreground">
                    {formatDate(m.created_at || "")}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {m.is_published ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnpublish(m.id)}
                          disabled={deletingId === m.id}
                          className="h-8 w-8 p-0"
                          aria-label="Despublicar"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePublish(m.id)}
                          disabled={deletingId === m.id}
                          className="h-8 w-8 p-0"
                          aria-label="Publicar"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(m)}
                        className="h-8 w-8 p-0"
                        aria-label="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(m.id)}
                        disabled={deletingId === m.id}
                        className="h-8 w-8 p-0"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MaterialForm
        open={formOpen}
        onOpenChange={setFormOpen}
        material={editingMaterial}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
