"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_LABELS, type Profile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export type NavItem = { href: string; label: string; exact?: boolean };

export function PanelShell({
  profile,
  nav,
  children,
}: {
  profile: Profile;
  nav: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (item: NavItem) =>
    item.exact ?? (item.href === "/admin" || item.href === "/equipo" || item.href === "/portal")
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const navLinks = (
    <nav className="space-y-1" aria-label="Secciones del panel">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
            isActive(item) ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );

  const userBox = (
    <div className="border-t border-slate-100 p-4">
      <p className="truncate text-sm font-semibold text-slate-900">{profile.full_name ?? "Usuario"}</p>
      <p className="truncate text-xs text-slate-500">{profile.email}</p>
      <div className="mt-2 flex items-center justify-between">
        <Badge tone="brand">{ROLE_LABELS[profile.role]}</Badge>
        <button
          type="button"
          onClick={signOut}
          className="text-xs font-semibold text-slate-600 hover:text-red-600"
        >
          Salir
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-600 text-sm font-bold text-white">TL</span>
          <span className="text-base font-semibold tracking-tight text-slate-900">Talent Leute</span>
        </Link>
        <div className="flex-1 overflow-y-auto px-3 py-2">{navLinks}</div>
        {userBox}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-teal-600 text-xs font-bold text-white">TL</span>
            <span className="text-sm font-semibold text-slate-900">Talent Leute</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge tone="brand">{ROLE_LABELS[profile.role]}</Badge>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700"
              aria-label="Abrir menú"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </header>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 py-4">
                <span className="font-semibold text-slate-900">Menú</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-600"
                  aria-label="Cerrar menú"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-3">{navLinks}</div>
              {userBox}
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
