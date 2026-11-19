import { Suspense, type ReactNode } from "react";
import { PanelShell, type NavItem } from "@/components/panel/PanelShell";
import { requireAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

function navFor(role: Role): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Resumen", exact: true },
      { href: "/admin/postulaciones", label: "Postulaciones" },
      { href: "/admin/usuarios", label: "Usuarios y roles" },
      { href: "/admin/invitaciones", label: "Invitaciones" },
      { href: "/admin/contenidos", label: "Contenidos" },
      { href: "/equipo", label: "Panel del equipo", exact: true },
    ];
  }

  if (role === "staff" || role === "trainer") {
    return [
      { href: "/equipo", label: "Resumen", exact: true },
      { href: "/equipo/postulantes", label: "Postulantes" },
      { href: "/equipo/contenidos", label: "Contenidos" },
    ];
  }

  return [
    { href: "/portal", label: "Mi panel", exact: true },
    { href: "/portal/contenidos", label: "Contenidos" },
    { href: "/portal/informe", label: "Mi informe" },
  ];
}

async function PanelFrame({ children }: { children: ReactNode }) {
  const profile = await requireAuth();
  return (
    <PanelShell profile={profile} nav={navFor(profile.role)}>
      {children}
    </PanelShell>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">Cargando panel…</div>
      }
    >
      <PanelFrame>{children}</PanelFrame>
    </Suspense>
  );
}
