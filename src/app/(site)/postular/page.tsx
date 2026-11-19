"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/fields";

const steps = [
  { title: "Datos y formación", detail: "Identificación, contacto, estudios y experiencia." },
  { title: "Alemán y motivación", detail: "Nivel de idioma, expectativas y plan de adaptación." },
  { title: "Disponibilidad y autorizaciones", detail: "Familia, viaje, turnos y consentimientos." },
];

export default function PostularPage() {
  const [step, setStep] = useState<"intro" | "form" | "done">("intro");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workedElderly, setWorkedElderly] = useState(false);
  const [hasCert, setHasCert] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");

  function handleBirthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setBirthDate(v);
    if (v) {
      const a = Math.floor((Date.now() - new Date(v).getTime()) / (365.25 * 24 * 3600 * 1000));
      setAge(String(a));
    } else {
      setAge("");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, age, workedElderly, hasCert, hasChildren }),
      });

      if (res.ok) {
        setStep("done");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "No pudimos enviar tu postulación. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (step === "intro") {
    return (
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Postulación</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Formulario de valoración
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Enfoque en residencias geriátricas en Alemania. Rango salarial de referencia 1.300 € – 2.800 € (depende de
          homologación, empleador y estado federal).
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={s.title}>
              <span className="text-xs font-semibold text-teal-700">Paso {i + 1}</span>
              <p className="mt-1 font-semibold text-slate-900">{s.title}</p>
              <p className="mt-1 text-sm text-slate-600">{s.detail}</p>
            </Card>
          ))}
        </div>

        <Alert variant="warning" title="Antes de empezar">
          Esta es una oportunidad individual. Talent Leute no ofrece ni financia el traslado de familiares, y diligenciar el
          formulario no garantiza el ingreso al programa ni una contratación en Alemania.
        </Alert>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={() => setStep("form")}>Iniciar postulación</Button>
          <ButtonLink href="/programa" variant="secondary">
            Ver el programa
          </ButtonLink>
        </div>
        <p className="mt-4 text-sm text-slate-500">Tiempo estimado: 10 a 15 minutos.</p>
      </section>
    );
  }

  if (step === "done") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Card className="text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Postulación enviada</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Recibimos tu información. El equipo revisará tu perfil y te contactará por correo o WhatsApp cuando haya
            novedades sobre la próxima cohorte.
          </p>
          <div className="mx-auto mt-6 max-w-md rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Qué sigue</p>
            <ol className="mt-2 space-y-1">
              <li>1. Revisión documental de tu perfil.</li>
              <li>2. Entrevistas de preselección y con supervisión.</li>
              <li>3. Definición de modalidad de inversión y pago.</li>
              <li>4. Código de invitación para tu cuenta en el portal.</li>
            </ol>
          </div>
          <div className="mt-6">
            <ButtonLink href="/" variant="secondary">
              Volver al inicio
            </ButtonLink>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Formulario de postulación</h1>
          <p className="mt-1 text-sm text-slate-600">Todos los campos marcados con * son obligatorios.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setStep("intro")}>
          Volver
        </Button>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Bloque 1</span>
            <h2 className="text-lg font-semibold text-slate-900">Confirmaciones iniciales</h2>
          </div>
          <div className="space-y-3">
            <Checkbox
              name="confirm_individual_opportunity"
              required
              label="Confirmo que esta es una oportunidad individual y que Talent Leute no ofrece ni financia el traslado de familiares."
            />
            <Checkbox
              name="confirm_no_guarantee"
              required
              label="Comprendo que diligenciar el formulario no garantiza el ingreso al programa ni una contratación en Alemania."
            />
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Bloque 2</span>
            <h2 className="text-lg font-semibold text-slate-900">Identificación, contacto y referidos</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo" htmlFor="fullName" required>
              <Input id="fullName" name="fullName" autoComplete="name" required />
            </Field>
            <Field label="Correo electrónico" htmlFor="email" required>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </Field>
            <Field label="Número de documento de identidad" htmlFor="document_id" required>
              <Input id="document_id" name="document_id" required />
            </Field>
            <Field label="Fecha de nacimiento" htmlFor="birth_date" required>
              <Input id="birth_date" name="birth_date" type="date" value={birthDate} onChange={handleBirthChange} required />
            </Field>
            <Field label="Edad" htmlFor="age" hint="Se calcula automáticamente.">
              <Input id="age" name="age" value={age} readOnly />
            </Field>
            <Field label="Ciudad y departamento de residencia" htmlFor="city" required>
              <Input id="city" name="city" required />
            </Field>
            <Field label="Teléfono / WhatsApp" htmlFor="phone" required>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
            </Field>
            <Field label="¿Quién te refiere? (opcional)" htmlFor="referrer_name">
              <Input id="referrer_name" name="referrer_name" />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Bloque 3</span>
            <h2 className="text-lg font-semibold text-slate-900">Pasaporte y disponibilidad</h2>
          </div>
          <div className="space-y-3">
            <Checkbox name="has_passport" label="¿Tiene pasaporte vigente?" />
            <Checkbox name="available_16_weeks" label="¿Tiene disponibilidad para el proceso de preparación de ~16 semanas?" />
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Bloque 4</span>
            <h2 className="text-lg font-semibold text-slate-900">Formación y experiencia</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nivel de formación" htmlFor="education_level" required>
              <Input id="education_level" name="education_level" required />
            </Field>
            <Field label="Institución educativa" htmlFor="institution" required>
              <Input id="institution" name="institution" required />
            </Field>
            <Field label="Año de finalización" htmlFor="graduation_year" required>
              <Input id="graduation_year" name="graduation_year" type="number" inputMode="numeric" required />
            </Field>
            <Field label="Años de experiencia en cuidado/atención" htmlFor="care_experience_years" required>
              <Input id="care_experience_years" name="care_experience_years" type="number" inputMode="numeric" required />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Descripción de experiencia principal" htmlFor="experience_description" required>
              <Textarea id="experience_description" name="experience_description" required />
            </Field>
          </div>
          <div className="mt-4 space-y-3">
            <Checkbox
              checked={workedElderly}
              onChange={(e) => setWorkedElderly(e.target.checked)}
              label="¿Ha trabajado directamente con personas mayores?"
            />
            {workedElderly && (
              <Field label="¿Dónde y durante cuánto tiempo?" htmlFor="elderly_work_detail">
                <Textarea id="elderly_work_detail" name="elderly_work_detail" />
              </Field>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Bloque 5</span>
            <h2 className="text-lg font-semibold text-slate-900">Nivel y dedicación al alemán</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nivel actual de alemán" htmlFor="german_level" required>
              <Input id="german_level" name="german_level" required />
            </Field>
            <Field label="Tiempo semanal dispuesto a estudiar" htmlFor="weekly_study_hours" required>
              <Input id="weekly_study_hours" name="weekly_study_hours" required />
            </Field>
          </div>
          <div className="mt-4 space-y-3">
            <Checkbox name="german_course_before" label="¿Ha realizado un curso de alemán antes?" />
            <Checkbox
              checked={hasCert}
              onChange={(e) => setHasCert(e.target.checked)}
              label="¿Cuenta con certificación de alemán?"
            />
            {hasCert && (
              <Field label="¿Cuál certificación y cuándo la obtuvo?" htmlFor="german_cert_detail">
                <Input id="german_cert_detail" name="german_cert_detail" />
              </Field>
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Bloque 6</span>
            <h2 className="text-lg font-semibold text-slate-900">Motivación, expectativas y adaptación</h2>
          </div>
          <div className="space-y-4">
            <Field label="¿Por qué desea trabajar en Alemania?" htmlFor="why_germany" required>
              <Textarea id="why_germany" name="why_germany" required />
            </Field>
            <Field label="¿Por qué le interesa trabajar con personas mayores?" htmlFor="why_elderly" required>
              <Textarea id="why_elderly" name="why_elderly" required />
            </Field>
            <Field label="¿Qué espera conseguir en Talent Leute?" htmlFor="expectations" required>
              <Textarea id="expectations" name="expectations" required />
            </Field>
            <Field label="¿Qué considera más difícil de vivir/trabajar temporalmente en Alemania?" htmlFor="hardest_part" required>
              <Textarea id="hardest_part" name="hardest_part" required />
            </Field>
            <Field
              label="¿Qué está dispuesto(a) a hacer para adaptarse al idioma y la cultura laboral alemana?"
              htmlFor="adaptation_plan"
              required
            >
              <Textarea id="adaptation_plan" name="adaptation_plan" required />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Bloque 7</span>
            <h2 className="text-lg font-semibold text-slate-900">Permanencia, familia, trabajo y turnos</h2>
          </div>
          <div className="space-y-3">
            <Checkbox
              name="willing_travel"
              label="¿Dispuesto(a) a viajar y permanecer fuera de Colombia por un periodo prolongado?"
            />
            <Field label="Responsabilidades que dificulten una permanencia prolongada (si aplica)" htmlFor="responsibilities_abroad">
              <Textarea id="responsibilities_abroad" name="responsibilities_abroad" />
            </Field>
            <Field label="Circunstancias personales, familiares o de cuidado (si aplica)" htmlFor="personal_circumstances">
              <Textarea id="personal_circumstances" name="personal_circumstances" />
            </Field>
            <Checkbox
              name="can_organize_travel"
              label="¿Podría organizar con anticipación sus asuntos personales para un viaje de larga duración?"
            />
            <Checkbox
              checked={hasChildren}
              onChange={(e) => setHasChildren(e.target.checked)}
              label="¿Tiene hijos?"
            />
            {hasChildren && (
              <Field label="¿Cuántos hijos?" htmlFor="children_count">
                <Input id="children_count" name="children_count" type="number" inputMode="numeric" />
              </Field>
            )}
            <Checkbox
              name="dependents"
              label="¿Hijos u otras personas dependen de usted para cuidado o sostenimiento?"
            />
            <Checkbox
              name="support_network"
              label="¿Cuenta con red familiar o persona de confianza para asumir responsabilidades?"
            />
            <Checkbox name="currently_working" label="¿Trabaja actualmente?" />
            <Checkbox name="can_attend_16_weeks" label="¿Podría asistir regularmente a las 16 semanas?" />
            <Checkbox
              name="willing_extra_study"
              label="¿Dispuesto(a) a realizar actividades adicionales de estudio fuera de clases?"
            />
            <Checkbox
              name="willing_virtual_interviews"
              label="¿Dispuesto(a) a participar en entrevistas virtuales con representantes de Alemania?"
            />
            <Checkbox name="willing_shifts" label="¿Dispuesto(a) a trabajar en turnos (mañana, tarde o noche)?" />
            <Field label="Otras condiciones de disponibilidad" htmlFor="availability_notes">
              <Textarea id="availability_notes" name="availability_notes" />
            </Field>
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-teal-700">Bloque 8</span>
            <h2 className="text-lg font-semibold text-slate-900">Confirmaciones y autorizaciones finales</h2>
          </div>
          <div className="space-y-3">
            <Checkbox
              name="confirm_truthful_info"
              required
              label="Confirmo que la información proporcionada es verdadera y corresponde a mi situación actual."
            />
            <Checkbox
              name="authorize_data_processing"
              required
              label="Autorizo el tratamiento de mis datos personales para las finalidades informadas por Talent Leute."
            />
            <Checkbox
              name="understand_false_info"
              required
              label="Entiendo que proporcionar información falsa o incompleta puede afectar mi participación."
            />
            <Checkbox
              name="understand_no_guarantee_outcome"
              required
              label="Entiendo que la inscripción no garantiza ingreso al programa, examen, contratación, visa o viaje."
            />
            <Checkbox
              name="authorize_share_with_employers"
              required
              label="Autorizo a Talent Leute a utilizar y compartir mi información profesional para presentar mi candidatura ante empleadores en Alemania."
            />
            <Checkbox
              name="authorize_third_party_evaluation"
              required
              label="Al aceptar esta casilla, entiendo que esta autorización permite la evaluación de mi perfil por terceros vinculados."
            />
          </div>
        </Card>

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={sending}>
            {sending ? "Enviando..." : "Enviar postulación"}
          </Button>
          <p className="text-xs text-slate-500">Revisa tus respuestas antes de enviar. No podrás editarlas después.</p>
        </div>
      </form>
    </section>
  );
}
