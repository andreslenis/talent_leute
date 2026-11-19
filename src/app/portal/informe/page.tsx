"use client";
export default function Informe() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="print:block">
        <header className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold">Talent Leute — Informe del Alumno</h1>
          <p className="text-sm text-neutral-500">Estado financiero, historial académico y avance del proceso.</p>
        </header>
        <div className="space-y-6 text-sm">
          <div>
            <h2 className="font-semibold">Estado financiero</h2>
            <p>Modalidad, pagos realizados/pendientes y comprobantes asociados.</p>
          </div>
          <div>
            <h2 className="font-semibold">Historial académico (16 semanas)</h2>
            <p>Resultados de evaluaciones, refuerzo y segunda oportunidad.</p>
          </div>
          <div>
            <h2 className="font-semibold">Avance en el proceso</h2>
            <p>Entrevistas (preselección, supervisora, gerencia), documentación e ingreso a cohorte.</p>
          </div>
        </div>
      </div>
      <button onClick={() => window.print()} className="mt-6 rounded bg-black text-white px-4 py-2 print:hidden">
        Imprimir / Guardar PDF
      </button>
      <style>{`@media print { nav, header.site-header, footer { display: none !important; } }`}</style>
    </section>
  );
}
