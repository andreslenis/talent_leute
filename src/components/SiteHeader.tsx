import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-4">
        <Link href="/" className="font-semibold text-lg">Talent Leute</Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/programa">Programa</Link>
          <Link href="/transparencia">Transparencia</Link>
          <Link href="/inversion">Inversión</Link>
          <Link href="/postular">Postular</Link>
          <Link href="/login">Portal</Link>
        </nav>
      </div>
    </header>
  );
}
