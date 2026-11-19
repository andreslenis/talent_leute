"use client";
import { useState } from "react";

export default function PostularPage() {
  const [step, setStep] = useState<"intro" | "form">("intro");
  const [status, setStatus] = useState<string | null>(null);
  const [workedElderly, setWorkedElderly] = useState(false);
  const [hasCert, setHasCert] = useState(false);
  const [hasChildren, setHasChildren] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");
  // compute age when birthDate changes
  function handleBirthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setBirthDate(v);
    if (v) {
      const a = Math.floor((Date.now() - new Date(v).getTime()) / (365.25 * 24 * 3600 * 1000));
      setAge(String(a));
    } else setAge("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, age, workedElderly, hasCert, hasChildren }),
    });
    setStatus(res.ok ? "Postulación enviada." : "Error al enviar.");
  }

  if (step === "intro") {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <h1 className="text-2xl font-bold">Formulario de Postulación — Talent Leute</h1>
        <p className="text-sm text-neutral-600">
          Enfoque en residencias geriátricas en Alemania. Rango salarial de referencia 1.300 € – 2.800 € (depende de
          homologación, empleador y estado federal). Inversión $800.000 COP contado / $1.000.000 COP financiado
          (inicial $250.000 COP). Recaudo Global66 / NIT 9018988427. WhatsApp 305 249 8099.
        </p>
        <button onClick={() => setStep("form")} className="rounded bg-black text-white px-4 py-2">
          Iniciar postulación
        </button>
      </section>
    );
  }

  const input = "w-full border rounded p-2";
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">Formulario de Postulación</h1>
      <button onClick={() => setStep("intro")} className="text-sm underline mb-4">Volver</button>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Bloque 1 */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Bloque 1 — Confirmaciones iniciales</legend>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="confirm_individual_opportunity" required /> Confirmo que esta es una oportunidad individual y que Talent Leute no ofrece ni financia el traslado de familiares.</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="confirm_no_guarantee" required /> Comprendo que diligenciar el formulario no garantiza el ingreso al programa ni una contratación en Alemania.</label>
        </fieldset>

        {/* Bloque 2 */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Bloque 2 — Identificación, contacto y referidos</legend>
          <input name="fullName" placeholder="Nombre completo" className={input} required />
          <input name="email" type="email" placeholder="Correo electrónico" className={input} required />
          <input name="document_id" placeholder="Número de documento de identidad" className={input} required />
          <input name="birth_date" type="date" className={input} value={birthDate} onChange={handleBirthChange} required />
          <input name="age" placeholder="Edad" className={input} value={age} readOnly />
          <input name="city" placeholder="Ciudad y departamento de residencia" className={input} required />
          <input name="phone" placeholder="Número de teléfono / WhatsApp" className={input} required />
          <input name="referrer_name" placeholder="Quién te refiere (opcional)" className={input} />
        </fieldset>

        {/* Bloque 3 */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Bloque 3 — Pasaporte y disponibilidad</legend>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="has_passport" /> ¿Tiene pasaporte vigente?</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="available_16_weeks" /> ¿Disponibilidad para proceso de preparación de ~16 semanas?</label>
        </fieldset>

        {/* Bloque 4 */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Bloque 4 — Formación y experiencia</legend>
          <input name="education_level" placeholder="Nivel de formación" className={input} required />
          <input name="institution" placeholder="Institución educativa" className={input} required />
          <input name="graduation_year" type="number" placeholder="Año de finalización" className={input} required />
          <input name="care_experience_years" type="number" placeholder="Tiempo de experiencia en cuidado/atención" className={input} required />
          <textarea name="experience_description" placeholder="Descripción de experiencia principal" className={input} required />
          <label className="flex gap-2 text-sm">
            <input type="checkbox" checked={workedElderly} onChange={(e) => setWorkedElderly(e.target.checked)} /> ¿Ha trabajado directamente con personas mayores?
          </label>
          {workedElderly && <textarea name="elderly_work_detail" placeholder="Dónde y durante cuánto tiempo" className={input} />}
        </fieldset>

        {/* Bloque 5 */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Bloque 5 — Nivel y dedicación al alemán</legend>
          <input name="german_level" placeholder="Nivel actual de alemán" className={input} required />
          <label className="flex gap-2 text-sm"><input type="checkbox" name="german_course_before" /> ¿Ha realizado curso de alemán antes?</label>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" checked={hasCert} onChange={(e) => setHasCert(e.target.checked)} /> ¿Cuenta con certificación de alemán?
          </label>
          {hasCert && (
            <>
              <input name="german_cert_detail" placeholder="Cuál certificación y cuándo la obtuvo" className={input} />
            </>
          )}
          <input name="weekly_study_hours" placeholder="Tiempo semanal dispuesto a estudiar alemán" className={input} required />
        </fieldset>

        {/* Bloque 6 */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Bloque 6 — Motivación, expectativas y adaptación</legend>
          <textarea name="why_germany" placeholder="¿Por qué desea trabajar en Alemania?" className={input} required />
          <textarea name="why_elderly" placeholder="¿Por qué le interesa trabajar con personas mayores?" className={input} required />
          <textarea name="expectations" placeholder="¿Qué espera conseguir en Talent Leute?" className={input} required />
          <textarea name="hardest_part" placeholder="¿Qué considera más difícil de vivir/trabajar temporalmente en Alemania?" className={input} required />
          <textarea name="adaptation_plan" placeholder="¿Qué está dispuesto(a) a hacer para adaptarse al idioma y cultura laboral alemana?" className={input} required />
        </fieldset>

        {/* Bloque 7 */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Bloque 7 — Permanencia, familia, trabajo y turnos</legend>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="willing_travel" /> ¿Dispuesto(a) a viajar y permanecer fuera de Colombia por periodo prolongado?</label>
          <textarea name="responsibilities_abroad" placeholder="Responsabilidades que dificulten permanencia prolongada (si aplica)" className={input} />
          <textarea name="personal_circumstances" placeholder="Circunstancias personales/familiares/de cuidado (si aplica)" className={input} />
          <label className="flex gap-2 text-sm"><input type="checkbox" name="can_organize_travel" /> ¿Podría organizar con anticipación sus asuntos personales para viaje de larga duración?</label>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" checked={hasChildren} onChange={(e) => setHasChildren(e.target.checked)} /> ¿Tiene hijos?
          </label>
          {hasChildren && <input name="children_count" type="number" placeholder="¿Cuántos hijos?" className={input} />}
          <label className="flex gap-2 text-sm"><input type="checkbox" name="dependents" /> ¿Hijos u otras personas dependen de usted para cuidado/sostenimiento?</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="support_network" /> ¿Cuenta con red familiar o persona de confianza para asumir responsabilidades?</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="currently_working" /> ¿Trabaja actualmente?</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="can_attend_16_weeks" /> ¿Podría asistir regularmente a las 16 semanas?</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="willing_extra_study" /> ¿Dispuesto(a) a realizar actividades adicionales de estudio fuera de clases?</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="willing_virtual_interviews" /> ¿Dispuesto(a) a participar en entrevistas virtuales con representantes de Alemania?</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="willing_shifts" /> ¿Dispuesto(a) a trabajar en turnos (mañana, tarde o noche)?</label>
          <textarea name="availability_notes" placeholder="Otras condiciones de disponibilidad" className={input} />
        </fieldset>

        {/* Bloque 8 */}
        <fieldset className="space-y-3">
          <legend className="font-semibold">Bloque 8 — Confirmaciones y autorizaciones finales</legend>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="confirm_truthful_info" required /> Confirmo que la información proporcionada es verdadera y corresponde a mi situación actual.</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="authorize_data_processing" required /> Autorizo el tratamiento de mis datos personales para las finalidades informadas por Talent Leute.</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="understand_false_info" required /> Entiendo que proporcionar información falsa o incompleta puede afectar mi participación.</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="understand_no_guarantee_outcome" required /> Entiendo que la inscripción no garantiza ingreso al programa, examen, contratación, visa o viaje.</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="authorize_share_with_employers" required /> Autorizo a Talent Leute a utilizar y compartir mi información profesional para presentar mi candidatura ante empleadores en Alemania.</label>
          <label className="flex gap-2 text-sm"><input type="checkbox" name="authorize_third_party_evaluation" required /> Al aceptar esta casilla, entiendo que esta autorización permite la evaluación de mi perfil por terceros vinculados.</label>
        </fieldset>

        <button type="submit" className="rounded bg-black text-white px-4 py-2">Enviar postulación</button>
        {status && <p className="text-green-600 text-sm">{status}</p>}
      </form>
    </section>
  );
}
