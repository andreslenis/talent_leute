import { ButtonLink } from "@/components/ui/button";

const benefits = [
  "Programa de 16 semanas",
  "Alemán aplicado al entorno geriátrico",
  "Evaluación continua con refuerzo",
  "Acompañamiento post-llegada (2 meses)",
];

export function PricingCard({
  title,
  price,
  detail,
  highlighted = false,
}: {
  title: string;
  price: string;
  detail: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
        highlighted ? "border-teal-600 ring-1 ring-teal-600" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {highlighted && (
          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-800">Recomendado</span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{price}</p>
      <p className="mt-1 text-sm text-slate-600">{detail}</p>
      <ul className="mt-5 space-y-2 border-t border-slate-100 pt-5 text-sm text-slate-600">
        {benefits.map((b) => (
          <li key={b} className="flex gap-2">
            <span aria-hidden="true" className="mt-0.5 text-teal-600">✓</span>
            {b}
          </li>
        ))}
      </ul>
      <ButtonLink href="/postular" variant={highlighted ? "primary" : "secondary"} className="mt-6 w-full">
        Iniciar postulación
      </ButtonLink>
    </div>
  );
}
