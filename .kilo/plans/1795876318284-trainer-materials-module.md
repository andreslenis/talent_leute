# Plan: Módulo de Materiales para el Capacitador

**Ruta del plan:** `.kilo/plans/1795876318284-trainer-materials-module.md`
**Estado:** Listo para implementar (otro agente ejecuta los cambios de código).
**Autor:** Kilo (Plan Mode) — no se realizan cambios de fuente en este turno.

---

## Contexto y hallazgos del codebase

El proyecto es un scaffling de Next.js 16 (App Router) + React 19 + Tailwind 4 + TypeScript + Supabase JS. Existe una única página de admin (`src/app/admin/applications/`) que es un stub sin control de acceso.

**Brechas detectadas frente al contexto declarado por el usuario** (importante para la implementación):
- No existe capa de autenticación/sesión: no hay middleware, ni helpers de auth, ni Server Actions.
- No existen tipos para `course_contents` ni `cohorts` en `src/types/index.ts`.
- No existe componente de toast, ni librería de formularios (`react-hook-form` no instalada), ni editor de texto enriquecido.
- `zod` está instalado transitivamente pero no declarado en `package.json`.
- Las variables de entorno usan valores dummy (`.env.local`): se necesitan credenciales reales de Supabase.

Decisiones resueltas con el usuario (ver respuestas):
1. **Auth gate:** `lib/auth.ts` con `supabase.auth.getUser()` + Server Action `getCurrentUserRole()` que lee `profiles.role`; los Server Actions de materiales guardan `role in ('trainer','admin')`.
2. **Editor:** `@uiw/react-rich-text`.
3. **Formularios/toast:** `zod` + `react-hook-form` + `@hookform/resolvers` + `sonner` (declarar en `package.json` e instalar).
4. **Storage:** bucket `materials` creado vía migración SQL con políticas de Storage RLS (subida trainer, lectura pública de PDFs publicados).
5. **Arquitectura:** Server Actions (no Route Handlers), página servidor con Suspense + cliente para el formulario, siguiendo el patrón existente de `admin/applications`.

Suposición de esquema (a confirmar contra la DB real): el acceso del trainer a cohortes se resuelve por `cohorts.created_by = auth.uid()` (o tabla unión `trainers_cohorts`). Los materiales se filtran por `cohort_id`.

---

## Archivos a crear / modificar

### Nuevos
- `src/lib/auth.ts` — helpers de sesión y rol (`getSession`, `getCurrentUserRole`, `requireTrainerOrAdmin`).
- `src/lib/actions/materials.ts` — Server Actions de materiales.
- `src/app/trainer/materials/page.tsx` — página servidor (listado + selector de cohorte + filtro semana).
- `src/app/trainer/materials/materials-table.tsx` — cliente, tabla de materiales.
- `src/app/trainer/materials/material-form.tsx` — cliente, formulario crear/editar (dialog o página propia).
- `src/components/ui/toaster.tsx` — toaster de sonner.
- `supabase/migrations/xxxx_materials_bucket.sql` — bucket `materials` + políticas RLS de Storage.
- `supabase/migrations/xxxx_trainer_cohort_access.sql` (opcional) — tabla unión trainer/cohorte si no existe.

### Modificar
- `src/types/index.ts` — añadir `Cohort`, `CourseContent`, `ContentType`, `MaterialFormInput`.
- `package.json` — añadir `zod`, `react-hook-form`, `@hookform/resolvers`, `sonner`, `@uiw/react-rich-text`.
- `src/components/ui/*` — si faltan primitivos (sheet, separator), añadirlos siguiendo el estilo shadcn existente.

---

## Tareas ordenadas (para el agente implementador)

1. **Instalar dependencias**
   - `npm install zod react-hook-form @hookform/resolvers sonner @uiw/react-rich-text`
   - Declararlas en `package.json` (zod ya presente, solo falta en dependencias declaradas).

2. **Capa de auth (`src/lib/auth.ts`)**
   - `getSession()`: `supabase.auth.getUser()`.
   - `getCurrentUserRole()`: Server Action que devuelve el `role` de `profiles` del usuario autenticado.
   - `requireTrainerOrAdmin()`: lanza error/retorna null si el rol no es `trainer` ni `admin`.
   - Nota: usar el cliente de Supabase existente (`src/lib/supabase.ts`).

3. **Tipos (`src/types/index.ts`)**
   - `ContentType = 'text' | 'pdf'`.
   - `Cohort { id, name, code?, start_date, end_date, created_by, created_at }`.
   - `CourseContent { id, cohort_id, week, title, body, content_html, file_path, content_type, is_published, published_at, order_index, created_by, created_at, estimated_minutes }`.
   - `MaterialFormInput` (zod schema).

4. **Server Actions (`src/lib/actions/materials.ts`)**
   - `listMaterials(cohortId, week?)`: devuelve materiales de la cohorte, ordenados por `order_index` / `created_at`.
   - `getCohortsForTrainer(userId)`: cohortes accesibles por el trainer.
   - `createMaterial(input)`: valida con zod, rol trainer/admin, inserta; si PDF sube a Storage primero y guarda `file_path` + `content_type='pdf'`.
   - `updateMaterial(id, input)`: rol trainer/admin, solo campos permitidos.
   - `publishMaterial(id)`: `is_published=true`, `published_at=now()`.
   - `unpublishMaterial(id)`: `is_published=false`.
   - `deleteMaterial(id)`: rol trainer/admin, borra archivo de Storage si es PDF.
   - `uploadPdf(file)`: sube a bucket `materials`, retorna path público.
   - Cada acción verifica pertenencia del trainer a la cohorte del material.

5. **Página listado (`src/app/trainer/materials/page.tsx`)**
   - Servidor, con `Suspense` fallback "Cargando...".
   - Selector de cohorte (obligatorio), filtro por semana.
   - Tabla: Semana, Título, Tipo, Estado (badge verde Publicado / gris Borrador), Fecha creación, Acciones.
   - Botón "Nuevo material" que abre el formulario.

6. **Formulario crear/editar (`src/app/trainer/materials/material-form.tsx`)**
   - Selector de cohorte, semana (1-16), título, tipo contenido (texto/PDF), editor enriquecido (texto), subida PDF (PDF), order_index, estimated_minutes.
   - Botones: "Guardar como Borrador", "Publicar".
   - Validación zod + react-hook-form.
   - Estados de carga, toast éxito/error (sonner).

7. **Acciones por material (tabla)**
   - Publicar / Despublicar / Editar / Eliminar (eliminar con diálogo de confirmación).
   - Toast de confirmación tras cada acción.

8. **Migraciones de Storage**
   - Crear bucket `materials` (público).
   - Políticas RLS: lectura pública; escritura/eliminación solo para rol trainer (vía JWT claims o función).

9. **Validación**
   - `npm run lint` (eslint).
   - `npx tsc --noEmit` (typecheck).
   - `npm run build` (opcional, si el entorno lo permite).

---

## Reglas de negocio aplicadas

- Solo `trainer`/`admin` crean/editar/eliminan.
- Al publicar: `is_published=true` y `published_at=now()`.
- Al despublicar: `is_published=false`.
- Alumnos ven solo `is_published=true` de su cohorte (respetado por RLS; el listado del trainer no filtra por publicado, muestra borradores y publicados).
- PDFs en bucket `materials`; `content_type='pdf'` cuando hay archivo, `'text'` cuando hay `content_html`.

---

## Riesgos y notas

- `.env.local` tiene credenciales dummy: el agente debe pedir al usuario credenciales reales de Supabase antes de probar contra la DB.
- No hay tabla de unión trainer/cohorte visible en el repo: asumir `cohorts.created_by` o crear migración; validar contra el esquema real.
- RLS de `course_contents` y Storage se asume configurado por el usuario; el plan añade políticas de Storage para el bucket `materials`.
- No se commitea a menos que el usuario lo pida explícitamente.

---

## Criterios de aceptación (Definition of Done)

- Página `/trainer/materials` accesible solo para trainer/admin.
- Listado con selector de cohorte obligatorio, filtro semana, badges de estado y acciones.
- Crear/editar material con todos los campos, editor enriquecido y subida PDF a Storage.
- Publicar/despublicar/eliminar con confirmación y toast.
- TypeScript sin errores (`tsc --noEmit`) y lint limpio.