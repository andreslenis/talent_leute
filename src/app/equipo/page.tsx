import Link from "next/link";

export default function Equipo() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 space-y-4">
      <h1 className="text-2xl font-bold">Panel del Equipo — Talent Leute</h1>
      <div className="flex gap-4 text-sm">
        <Link href="/equipo/postulantes" className="underline">Postulantes</Link>
        <Link href="/equipo/contenidos" className="underline">Contenidos</Link>
      </div>
    </section>
  );
}
