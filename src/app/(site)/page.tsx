import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PricingCard } from "@/components/PricingCard";

const ejes = [
  "Alemán aplicado (~32 h + práctica + trabajo autónomo)",
  "Comunicación con residentes y supervisores",
  "Atención y cuidado geriátrico",
  "Simulación laboral real",
  "Evaluación continua con refuerzo",
];

const keyPoints = [
  "16 semanas de formación",
  "Enfoque geriátrico",
  "Valoración previa del perfil",
  "Acompañamiento hasta 2 meses",
];

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Formación geriátrica en Alemania</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Talent Leute
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Formación geriátrica de 16 semanas con capacitador activo que reside y trabaja en Alemania. Selección para
              residencias geriátricas.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/postular">Postular para próxima apertura</ButtonLink>
              <ButtonLink href="/programa" variant="secondary">
                Conocer el programa
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Actualmente no hay inscripciones abiertas a cohorte. Completa el formulario de valoración para futuras aperturas.
            </p>
          </div>

          <Card className="bg-white">
            <p className="text-sm font-semibold text-slate-900">Puntos clave</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {keyPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-teal-600">✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              Rango sujeto a homologación del título, empleador y estado federal.
            </p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Programa de 16 semanas</h2>
            <p className="mt-1 text-sm text-slate-600">
              Cinco ejes formativos que combinan idioma, cuidado y práctica laboral.
            </p>
          </div>
          <Link href="/programa" className="text-sm font-semibold text-teal-700 hover:text-teal-800">
            Ver detalle completo →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ejes.map((t, i) => (
            <div key={t} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-semibold text-teal-700">Eje {i + 1}</span>
              <p className="mt-2 text-sm font-medium text-slate-800">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Card className="border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">Transparencia salarial y condiciones</h2>
            <p className="mt-2 text-sm text-slate-600">
              Rango de referencia en Alemania: 1.300 € – 2.800 € mensuales aprox. Depende de homologación del título,
              empleador y estado federal.
            </p>
            <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <li>Contrato de prestación de servicios.</li>
              <li>Contratación final sujeta a empleadores/residencias en Alemania.</li>
              <li>Sin traslado ni financiación de familiares.</li>
              <li>Acompañamiento post-llegada máximo 2 meses.</li>
            </ul>
            <Link href="/transparencia" className="mt-4 inline-block text-sm font-semibold text-teal-700 hover:text-teal-800">
              Leer condiciones completas →
            </Link>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900">Modalidades de inversión</h2>
        <p className="mt-1 text-sm text-slate-600">
          El acceso se define tras el formulario y la valoración al abrirse cohorte.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <PricingCard title="Contado" price="$800.000 COP" detail="Pago único" />
          <PricingCard
            title="Financiado"
            price="$1.000.000 COP"
            detail="Cuota inicial $250.000 COP + cuotas"
            highlighted
          />
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Los medios de pago se entregan solo a perfiles habilitados.
        </p>
      </section>

      <section className="bg-teal-700 py-14">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">¿Listo para dar el siguiente paso?</h2>
            <p className="mt-2 max-w-2xl text-sm text-teal-50">
              Completa el formulario de valoración. Te contactaremos cuando se abra la próxima cohorte.
            </p>
          </div>
          <ButtonLink href="/postular" variant="secondary" className="shrink-0">
            Comenzar postulación
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
