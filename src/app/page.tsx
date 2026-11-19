export default function Home() {
  const benefits = ["Programa de 16 semanas", "Alemán aplicado al entorno geriátrico", "Evaluación continua con refuerzo"];
  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">
        {/* Hero 2 cols */}
        <section className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900">Talent Leute</h1>
            <p className="text-lg text-slate-600">
              Formación geriátrica de 16 semanas con capacitador activo que reside y trabaja en Alemania. Selección para
              residencias geriátricas.
            </p>
            <a href="/postular" className="inline-block rounded bg-teal-600 text-white px-5 py-2 font-medium">
              Postular para próxima apertura
            </a>
            <p className="text-sm text-slate-500">
              Actualmente no hay inscripciones abiertas a cohorte. Completa el formulario de valoración para futuras aperturas.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-2">
            <p className="font-semibold text-slate-900">Puntos clave</p>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>16 semanas de formación</li>
              <li>Enfoque geriátrico</li>
              <li>Valoración previa</li>
              <li>Acompañamiento hasta 2 meses</li>
              <li>Rango salarial 1.300 € – 2.800 € (sujeto a homologación, empleador y estado federal)</li>
            </ul>
          </div>
        </section>

        {/* Ejes formativos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Programa de 16 semanas</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {["Alemán aplicado (~32 h + práctica + autónomo)", "Comunicación", "Atención y cuidado geriátrico", "Simulación laboral", "Evaluación continua"].map((t) => (
              <div key={t} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm text-sm text-slate-700">{t}</div>
            ))}
          </div>
        </section>

        {/* Transparencia */}
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Transparencia salarial y condiciones</h2>
          <p className="text-sm text-slate-600">Rango de referencia en Alemania: 1.300 € – 2.800 € mensuales aprox. Depende de homologación del título, empleador y estado federal.</p>
          <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600">
            <li>Contrato de prestación de servicios.</li>
            <li>Contratación final sujeta a empleadores/residencias en Alemania.</li>
            <li>Sin traslado ni financiación de familiares.</li>
            <li>Acompañamiento post-llegada máximo 2 meses (vivienda y adaptación); conservar el empleo es responsabilidad del candidato.</li>
          </ul>
        </section>

        {/* Modalidades de inversión (informativas, sin botones de compra) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Modalidades de inversión</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-900">Contado</h3>
              <p className="text-2xl font-bold text-slate-900">$800.000 COP</p>
              <p className="text-sm text-slate-600">Pago único</p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600">{benefits.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="font-semibold text-slate-900">Financiado</h3>
              <p className="text-2xl font-bold text-slate-900">$1.000.000 COP</p>
              <p className="text-sm text-slate-600">Cuota inicial $250.000 COP + cuotas</p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-slate-600">{benefits.map((b) => <li key={b}>{b}</li>)}</ul>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            El acceso se define tras el formulario y la valoración al abrirse cohorte. Los medios de pago se entregan solo a perfiles habilitados.
          </p>
        </section>
      </div>
    </div>
  );
}
