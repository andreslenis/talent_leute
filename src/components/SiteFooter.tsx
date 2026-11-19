import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-teal-600 text-xs font-bold text-white">TL</span>
            <span className="font-semibold text-slate-900">Talent Leute</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Formación y acompañamiento para profesionales sanitarios que quieren trabajar en residencias geriátricas en Alemania.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Navegación</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/programa" className="hover:text-teal-700">Programa de 16 semanas</Link></li>
            <li><Link href="/transparencia" className="hover:text-teal-700">Condiciones y transparencia</Link></li>
            <li><Link href="/inversion" className="hover:text-teal-700">Inversión y pagos</Link></li>
            <li><Link href="/postular" className="hover:text-teal-700">Formulario de postulación</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Información legal</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Operado por Manager FC · NIT 9018988427</li>
            <li>WhatsApp oficial: 305 249 8099</li>
            <li>Recaudo por Global66</li>
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            La contratación final depende de empleadores y residencias en Alemania. La postulación no garantiza ingreso ni contratación.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Talent Leute. Todos los derechos reservados.
      </div>
    </footer>
  );
}
