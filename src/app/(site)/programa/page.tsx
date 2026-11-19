import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHero } from "@/components/ui/page-hero";

const blocks = [
  {
    title: "Alemán aplicado",
    detail: "~32 h lectivas virtuales, práctica en vivo y trabajo autónomo guiado, con vocabulario del entorno geriátrico.",
  },
  {
    title: "Comunicación",
    detail: "Interacción con residentes, compañeros de turno y supervisores: reportes, instrucciones y trato diario.",
  },
  {
    title: "Atención y cuidado",
    detail:
      "Anatomía básica, higiene, movilización, alimentación e hidratación, vestimenta, confort, demencia, emergencias y entrega de turno.",
  },
  {
    title: "Preparación laboral",
    detail: "Simulación de entrevistas y escenarios reales de trabajo en Alemania.",
  },
  {
    title: "Evaluación continua",
    detail: "Seguimiento semanal con refuerzo y segunda oportunidad para consolidar los aprendizajes.",
  },
];

const weeks = [
  { range: "Semanas 1 – 4", focus: "Fundamentos del alemán geriátrico y rol del cuidador." },
  { range: "Semanas 5 – 8", focus: "Cuidado básico, movilización y comunicación con residentes." },
  { range: "Semanas 9 – 12", focus: "Demencia, emergencias, reportes y trabajo en equipo." },
  { range: "Semanas 13 – 16", focus: "Simulación laboral, entrevistas y evaluación final." },
];

export default function Programa() {
  return (
    <>
      <PageHero
        eyebrow="Programa formativo"
        title="16 semanas para prepararte para trabajar en Alemania"
        description="Un itinerario intensivo y práctico, diseñado para profesionales sanitarios que quieren desempeñarse en residencias geriátricas alemanas."
        actions={<ButtonLink href="/postular">Postularme</ButtonLink>}
      />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {blocks.map((block, i) => (
            <Card key={block.title}>
              <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Eje {i + 1}</span>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{block.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{block.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-slate-900">Cómo avanza el programa</h2>
          <p className="mt-1 text-sm text-slate-600">Cuatro tramos de cuatro semanas cada uno.</p>
          <ol className="mt-6 space-y-4">
            {weeks.map((w, i) => (
              <li key={w.range} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 text-sm font-bold text-teal-800">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{w.range}</p>
                  <p className="mt-1 text-sm text-slate-600">{w.focus}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Card className="bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Al finalizar</h2>
          <p className="mt-2 text-sm text-slate-600">
            Recibes acompañamiento para presentar tu perfil ante empleadores y residencias en Alemania. La contratación
            final depende de esos empleadores y de la homologación de tu título.
          </p>
          <div className="mt-4">
            <ButtonLink href="/transparencia" variant="secondary" size="sm">
              Ver condiciones
            </ButtonLink>
          </div>
        </Card>
      </section>
    </>
  );
}
