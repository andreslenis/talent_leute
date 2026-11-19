import Link from "next/link";

export default function Portal() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 space-y-4">
      <h1 className="text-2xl font-bold">Portal Talent Leute</h1>
      <div className="flex gap-4">
        <Link href="/portal/informe" className="underline">Informe</Link>
        <Link href="/portal/contenidos" className="underline">Contenidos 16 semanas</Link>
      </div>
    </section>
  );
}
