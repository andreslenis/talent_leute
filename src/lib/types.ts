export type Role = "alumno" | "staff" | "trainer" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  role: Role;
  created_at: string | null;
};

export const ROLE_LABELS: Record<Role, string> = {
  alumno: "Alumno",
  staff: "Equipo",
  trainer: "Capacitador",
  admin: "Administrador",
};

export function homeForRole(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "staff" || role === "trainer") return "/equipo";
  return "/portal";
}

export type Cohort = {
  id: string;
  name: string;
  code: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string | null;
};

export type Enrollment = {
  id: string;
  profile_id: string;
  cohort_id: string;
  status: string;
  enrolled_at: string | null;
};

export type Session = {
  id: string;
  cohort_id: string | null;
  title: string | null;
  description: string | null;
  meet_link: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_recorded: boolean;
  recording_url: string | null;
  created_at: string | null;
};

export type CourseContent = {
  id: string;
  cohort_id: string | null;
  week: number | null;
  title: string;
  body: string | null;
  published: boolean;
  created_by: string | null;
  created_at: string | null;
};

export type Evaluation = {
  id: string;
  user_id: string;
  week: number | null;
  score: number | null;
  passed: boolean | null;
  retry_allowed: boolean;
  retry_count: number | null;
  reinforced: boolean | null;
  notes: string | null;
  created_at: string | null;
};

export const APPLICATION_STATUSES = [
  "preinscripcion",
  "documental",
  "entrevista_previa",
  "entrevista_supervisora",
  "entrevista_gerencia",
  "pago",
  "cohorte",
  "retirado",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  submitted: "Recibida",
  preinscripcion: "Preinscripción",
  documental: "Documental",
  entrevista_previa: "Entrevista previa",
  entrevista_supervisora: "Entrevista supervisora",
  entrevista_gerencia: "Entrevista gerencia",
  pago: "Pago",
  cohorte: "En cohorte",
  retirado: "Retirado",
  rechazado: "No continúa",
};

export function statusLabel(status: string | null | undefined) {
  if (!status) return "Sin estado";
  return STATUS_LABELS[status] ?? status;
}

export type FieldType = "text" | "long" | "bool" | "date" | "number";

export type ApplicationField = { key: string; label: string; type?: FieldType };

export const APPLICATION_FIELD_GROUPS: { title: string; fields: ApplicationField[] }[] = [
  {
    title: "Identificación y contacto",
    fields: [
      { key: "full_name", label: "Nombre completo" },
      { key: "email", label: "Correo electrónico" },
      { key: "phone", label: "Teléfono / WhatsApp" },
      { key: "document_id", label: "Documento de identidad" },
      { key: "birth_date", label: "Fecha de nacimiento", type: "date" },
      { key: "age", label: "Edad", type: "number" },
      { key: "city", label: "Ciudad y departamento" },
      { key: "referrer_name", label: "Referido por" },
    ],
  },
  {
    title: "Formación y experiencia",
    fields: [
      { key: "profession", label: "Profesión" },
      { key: "education_level", label: "Nivel de formación" },
      { key: "institution", label: "Institución" },
      { key: "graduation_year", label: "Año de finalización", type: "number" },
      { key: "experience_years", label: "Años de experiencia", type: "number" },
      { key: "care_experience_years", label: "Años en cuidado/atención", type: "number" },
      { key: "experience_description", label: "Descripción de experiencia", type: "long" },
      { key: "worked_with_elderly", label: "Ha trabajado con personas mayores", type: "bool" },
      { key: "elderly_work_detail", label: "Detalle del trabajo con mayores", type: "long" },
    ],
  },
  {
    title: "Alemán",
    fields: [
      { key: "german_level", label: "Nivel actual" },
      { key: "german_course_before", label: "Curso previo", type: "bool" },
      { key: "german_certification", label: "Certificación", type: "bool" },
      { key: "german_cert_detail", label: "Detalle de certificación" },
      { key: "weekly_study_hours", label: "Horas semanales de estudio" },
    ],
  },
  {
    title: "Motivación y expectativas",
    fields: [
      { key: "motivation", label: "Motivación (resumen)" },
      { key: "why_germany", label: "¿Por qué Alemania?", type: "long" },
      { key: "why_elderly", label: "¿Por qué personas mayores?", type: "long" },
      { key: "expectations", label: "Expectativas", type: "long" },
      { key: "hardest_part", label: "Parte más difícil", type: "long" },
      { key: "adaptation_plan", label: "Plan de adaptación", type: "long" },
    ],
  },
  {
    title: "Permanencia, familia y trabajo",
    fields: [
      { key: "willing_travel", label: "Dispuesto a viajar", type: "bool" },
      { key: "responsibilities_abroad", label: "Responsabilidades en Colombia", type: "long" },
      { key: "personal_circumstances", label: "Circunstancias personales", type: "long" },
      { key: "can_organize_travel", label: "Puede organizar su viaje", type: "bool" },
      { key: "has_children", label: "Tiene hijos", type: "bool" },
      { key: "children_count", label: "Número de hijos", type: "number" },
      { key: "dependents", label: "Tiene dependientes", type: "bool" },
      { key: "support_network", label: "Red de apoyo", type: "bool" },
      { key: "currently_working", label: "Trabaja actualmente", type: "bool" },
    ],
  },
  {
    title: "Disponibilidad",
    fields: [
      { key: "has_passport", label: "Pasaporte vigente", type: "bool" },
      { key: "available_16_weeks", label: "Disponible 16 semanas", type: "bool" },
      { key: "can_attend_16_weeks", label: "Puede asistir a las 16 semanas", type: "bool" },
      { key: "willing_extra_study", label: "Estudio adicional", type: "bool" },
      { key: "willing_virtual_interviews", label: "Entrevistas virtuales", type: "bool" },
      { key: "willing_shifts", label: "Turnos rotativos", type: "bool" },
      { key: "availability_notes", label: "Notas de disponibilidad", type: "long" },
    ],
  },
  {
    title: "Autorizaciones y confirmaciones",
    fields: [
      { key: "confirm_individual_opportunity", label: "Oportunidad individual", type: "bool" },
      { key: "confirm_no_guarantee", label: "Sin garantía de ingreso", type: "bool" },
      { key: "confirm_truthful_info", label: "Información veraz", type: "bool" },
      { key: "authorize_data_processing", label: "Autoriza datos", type: "bool" },
      { key: "understand_false_info", label: "Entiende consecuencias", type: "bool" },
      { key: "understand_no_guarantee_outcome", label: "Sin garantía de resultado", type: "bool" },
      { key: "authorize_share_with_employers", label: "Compartir con empleadores", type: "bool" },
      { key: "authorize_third_party_evaluation", label: "Evaluación por terceros", type: "bool" },
    ],
  },
];
