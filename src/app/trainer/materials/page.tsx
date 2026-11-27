import { Suspense } from "react";
import { Metadata } from "next";
import { MaterialsTableClient } from "./materials-table-client";

export const metadata: Metadata = {
  title: "Materiales | Talent Leute",
  description: "Gestión de materiales de curso para capacitadores",
};

export default function MaterialsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div className="animate-pulse">Cargando materiales...</div>}>
        <MaterialsTableClient />
      </Suspense>
    </div>
  );
}
