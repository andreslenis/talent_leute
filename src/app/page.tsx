export default function Home() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Talent Leute</h1>
        <p className="mt-2 text-neutral-600">
          Formación y acompañamiento para enfermería, auxiliares, fisioterapeutas y cuidadores con experiencia,
          orientada al sector sanitario y geriátrico en Alemania. Capacitador activo que reside y trabaja en Alemania.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">Programa de 16 semanas</h2>
          <p className="text-sm mt-2">Alemán aplicado al entorno laboral/geriátrico, comunicación, atención y cuidado, preparación laboral.</p>
          <a href="/programa" className="inline-block mt-3 text-sm underline">Ver programa</a>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold">Postula o refiere</h2>
          <p className="text-sm mt-2">Formulario propio de postulación con soporte para referidos.</p>
          <a href="/postular" className="inline-block mt-3 text-sm underline">Postular</a>
        </div>
      </div>
    </section>
  );
}
