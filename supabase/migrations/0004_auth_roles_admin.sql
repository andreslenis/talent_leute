-- 0004: roles definitivos, invitaciones y RLS para el panel interno
-- Roles: alumno | staff | trainer | admin
-- Los postulantes NO tienen cuenta: applications se inserta de forma anónima.

-- 1. Roles ---------------------------------------------------------------
alter table profiles drop constraint if exists profiles_role_check;
update profiles set role = 'alumno' where role = 'candidate';
alter table profiles add constraint profiles_role_check
  check (role in ('alumno', 'staff', 'trainer', 'admin'));

alter table profiles add column if not exists email text;

update profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

-- 2. Helpers (security definer para evitar recursión de RLS) --------------
create or replace function public.profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.profile_role() = 'admin', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.profile_role() in ('staff', 'trainer', 'admin'), false);
$$;

create or replace function public.owns_application(app_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.applications a
    where a.id = app_id and a.user_id = auth.uid()
  );
$$;

-- 3. Perfil automático al crear usuario en auth ---------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    'alumno'
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Ningún usuario puede cambiarse el rol a sí mismo; solo admin/service role
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on profiles;
create trigger profiles_guard_role
  before update on profiles
  for each row execute function public.guard_profile_role();

-- 4. Invitaciones para alumnos -------------------------------------------
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
    default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  email text not null,
  application_id uuid references applications(id) on delete cascade,
  role text not null default 'alumno' check (role in ('alumno', 'staff', 'trainer')),
  expires_at timestamptz not null default now() + interval '14 days',
  used_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table invitations enable row level security;

create index if not exists invitations_code_idx on invitations (code);
create index if not exists applications_status_idx on applications (status);
create index if not exists applications_created_at_idx on applications (created_at desc);
create index if not exists applications_user_id_idx on applications (user_id);
create index if not exists payments_application_id_idx on payments (application_id);

-- 5. Políticas ------------------------------------------------------------
drop policy if exists "profiles self read" on profiles;
drop policy if exists "profiles self update" on profiles;
drop policy if exists "profiles admin update" on profiles;
drop policy if exists "applications insert anon" on applications;
drop policy if exists "applications staff read" on applications;
drop policy if exists "applications staff update" on applications;
drop policy if exists "course_contents read auth" on course_contents;
drop policy if exists "staff manage contents" on course_contents;

create policy "profiles self read" on profiles
  for select using (id = auth.uid() or public.is_staff());

create policy "profiles self update" on profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.profile_role());

create policy "profiles admin update" on profiles
  for update using (public.is_admin())
  with check (public.is_admin());

create policy "applications insert anon" on applications
  for insert with check (true);

create policy "applications staff read" on applications
  for select using (public.is_staff() or user_id = auth.uid());

create policy "applications staff update" on applications
  for update using (public.is_staff()) with check (public.is_staff());

create policy "course_contents read auth" on course_contents
  for select using (
    public.is_staff() or (auth.uid() is not null and published = true)
  );

create policy "course_contents staff write" on course_contents
  for insert with check (public.is_staff());

create policy "course_contents staff update" on course_contents
  for update using (public.is_staff()) with check (public.is_staff());

-- Tablas hijas: staff ve y gestiona todo; el alumno ve lo suyo.
do $$
declare
  t text;
begin
  foreach t in array array['referrals', 'pipeline_stages', 'interviews', 'documents', 'payments']
  loop
    execute format('drop policy if exists %I on %I', t || ' staff read', t);
    execute format('drop policy if exists %I on %I', t || ' staff write', t);
    execute format('drop policy if exists %I on %I', t || ' staff update', t);
    execute format('drop policy if exists %I on %I', t || ' owner read', t);
    execute format(
      'create policy %I on %I for select using (public.is_staff() or public.owns_application(application_id))',
      t || ' staff read', t
    );
    execute format(
      'create policy %I on %I for insert with check (public.is_staff())',
      t || ' staff write', t
    );
    execute format(
      'create policy %I on %I for update using (public.is_staff()) with check (public.is_staff())',
      t || ' staff update', t
    );
  end loop;
end;
$$;

-- Cuotas: dependen del pago, no de la postulación directamente.
drop policy if exists "installments staff read" on installments;
drop policy if exists "installments staff write" on installments;
drop policy if exists "installments staff update" on installments;

create policy "installments staff read" on installments
  for select using (
    public.is_staff() or exists (
      select 1 from payments p
      where p.id = installments.payment_id and public.owns_application(p.application_id)
    )
  );
create policy "installments staff write" on installments
  for insert with check (public.is_staff());
create policy "installments staff update" on installments
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "evaluations staff read" on evaluations;
drop policy if exists "evaluations staff write" on evaluations;
drop policy if exists "evaluations staff update" on evaluations;

create policy "evaluations staff read" on evaluations
  for select using (public.is_staff() or user_id = auth.uid());
create policy "evaluations staff write" on evaluations
  for insert with check (public.is_staff());
create policy "evaluations staff update" on evaluations
  for update using (public.is_staff()) with check (public.is_staff());

drop policy if exists "invitations admin read" on invitations;
drop policy if exists "invitations admin write" on invitations;
drop policy if exists "invitations admin update" on invitations;

create policy "invitations admin read" on invitations
  for select using (public.is_admin());
create policy "invitations admin write" on invitations
  for insert with check (public.is_admin());
create policy "invitations admin update" on invitations
  for update using (public.is_admin()) with check (public.is_admin());
