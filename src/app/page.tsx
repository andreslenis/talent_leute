export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold">Talent Leute</h1>
        <p className="text-lg text-neutral-600">
          Formación y acompañamiento para enfermería, auxiliares, fisioterapeutas y cuidadores con experiencia,
          orientada a residencias geriátricas en Alemania. Capacitador activo que reside y trabaja en el área en Alemania.
        </p>
        <a href="/postular" className="inline-block rounded bg-black text-white px-5 py-2">Postular ahora</a>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold text-lg">Programa de 16 semanas</h2>
          <ul className="mt-3 space-y-1 text-sm text-neutral-600">
            <li>Alemán aplicado al entorno geriátrico (~32 h lectivas virtuales, práctica en vivo y trabajo autónomo guiado).</li>
            <li>Comunicación con residentes, compañeros y supervisores.</li>
            <li>Atención y cuidado: anatomía básica, higiene, movilización, alimentación e hidratación, vestimenta y confort, demencia, emergencias, reportes y entrega de turno.</li>
            <li>Preparación laboral: simulación de entrevistas y escenarios reales en Alemania.</li>
            <li>Evaluación continua con refuerzo y segunda oportunidad.</li>
          </ul>
        </div>
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold text-lg">Transparencia salarial</h2>
          <p className="mt-3 text-sm text-neutral-600">
            Rango de referencia en Alemania: 1.300 € – 2.800 € mensuales aprox. Depende de la homologación del
            título, el empleador y el estado federal.
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            La contratación final depende de los empleadores/residencias en Alemania.
          </p>
        </div>
      </section>

      <section className="rounded-lg border p-6 space-y-3">
        <h2 className="font-semibold text-lg">Alcance y condiciones</h2>
        <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600">
          <li>Firma de contrato de prestación de servicios.</li>
          <li>Acompañamiento empresarial post-llegada en Alemania por máximo 2 meses (vivienda y adaptación); conservar el empleo es responsabilidad del candidato.</li>
          <li>No incluye traslado ni financiación de familiares.</li>
        </ul>
      </section>

      <section className="rounded-lg border p-6 space-y-3">
        <h2 className="font-semibold text-lg">Inversión y recaudo</h2>
        <p className="text-sm text-neutral-600">
          Contado: $800.000 COP. Financiado: $1.000.000 COP (cuota inicial $250.000 COP + cuotas).
        </p>
        <p className="text-sm text-neutral-600">
          Recaudo: Global66 / NIT 9018988427. Envía el comprobante al WhatsApp oficial 305 249 8099.
        </p>
      </section>
    </div>
  );
}
