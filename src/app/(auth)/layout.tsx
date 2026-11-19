import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-600 text-sm font-bold text-white">TL</span>
          <span className="text-base font-semibold tracking-tight text-slate-900">Talent Leute</span>
        </Link>
        <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Volver al sitio
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6">{children}</main>
      <footer className="px-4 py-6 text-center text-xs text-slate-500">
        Operado por Manager FC · NIT 9018988427 · WhatsApp 305 249 8099
      </footer>
    </div>
  );
}
