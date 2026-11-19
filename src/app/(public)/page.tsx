import Link from "next/link";

export default function PublicPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-1 text-xs font-semibold text-white mb-6">
          Talent Leute
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Plataforma educativa</h1>
        <p className="text-lg text-slate-600 mb-8">
          Formación y acompañamiento para profesionales sanitarios que buscan oportunidades en Alemania.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login" className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700">
            Iniciar sesión
          </Link>
          <Link href="/activar" className="px-6 py-3 border border-slate-200 bg-white text-slate-800 rounded-lg font-semibold hover:bg-slate-50">
            Activa tu cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
