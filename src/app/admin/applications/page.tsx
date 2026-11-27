import { Suspense } from "react";
import { Metadata } from "next";
import { ApplicationsPageClient } from "./applications-page-client";

export const metadata: Metadata = {
  title: "Postulaciones | Talent Leute Admin",
  description: "Gestión de postulaciones y funnel de candidatos",
};

export default function ApplicationsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Cargando...</div>}>
        <ApplicationsPageClient />
      </Suspense>
    </div>
  );
}