import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold text-lg text-slate-900">Talent Leute</Link>
        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/programa">El Programa</Link>
          <Link href="/transparencia">Condiciones</Link>
          <Link href="/inversion">Inversión</Link>
          <Link href="/postular">Postularse</Link>
          <Link href="/login" className="rounded bg-teal-600 text-white px-3 py-1.5">Portal</Link>
        </nav>
      </div>
    </header>
  );
}
