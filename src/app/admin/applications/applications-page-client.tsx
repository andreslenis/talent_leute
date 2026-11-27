"use client";

import { useState } from "react";
import { Search, SortAsc, SortDesc } from "lucide-react";
import { Application, ApplicationFilters, ApplicationSortField } from "@/types";
import { ApplicationTable } from "./application-table";
import { ApplicationFilters as ApplicationFiltersComponent } from "./application-filters";
import { ApplicationDetailDialog } from "./application-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ApplicationsPageClient() {
  const [filters, setFilters] = useState<ApplicationFilters>({
    sort: "created_at",
    sortDirection: "desc",
  });

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleView = (app: Application) => {
    setSelectedApplication(app);
    setDetailOpen(true);
  };

  const handleFiltersChange = (newFilters: Partial<ApplicationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSort = (field: ApplicationSortField) => {
    setFilters((prev) => ({
      ...prev,
      sort: field,
      sortDirection: prev.sort === field && prev.sortDirection === "desc" ? "asc" : "desc",
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Postulaciones</h1>
          <p className="text-muted-foreground">
            Gestiona el funnel de candidatos y sus estados
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder=" buscar por nombre o email..."
            value={filters.search || ""}
            onChange={(e) => handleFiltersChange({ search: e.target.value })}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filters.sort === "range_score" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("range_score")}
            className="gap-2"
          >
            Puntaje
            {filters.sort === "range_score" &&
              (filters.sortDirection === "desc" ? (
                <SortDesc className="h-3.5 w-3.5" />
              ) : (
                <SortAsc className="h-3.5 w-3.5" />
              ))}
          </Button>
          <Button
            variant={filters.sort === "created_at" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("created_at")}
            className="gap-2"
          >
            Fecha
            {filters.sort === "created_at" &&
              (filters.sortDirection === "desc" ? (
                <SortDesc className="h-3.5 w-3.5" />
              ) : (
                <SortAsc className="h-3.5 w-3.5" />
              ))}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ApplicationFiltersComponent filters={filters} onChange={handleFiltersChange} />
      </div>

      <ApplicationTable
        filters={filters}
        onWhatsApp={(app) => {
          const phone = app.phone;
          if (phone) {
            window.open(
              `https://wa.me/${phone.replace(/\s/g, "")}`,
              "_blank"
            );
          }
        }}
        onEditStatus={(app) => {
          setSelectedApplication(app);
          setDetailOpen(true);
        }}
        onRowClick={handleView}
      />

      <ApplicationDetailDialog
        application={selectedApplication}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdate={(updates) => {
          console.log("Update:", updates);
        }}
      />
    </div>
  );
}