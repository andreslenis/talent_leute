-- Segunda entrega: ampliación
alter table interviews add column if not exists interview_type text default 'preselection'
  check (interview_type in ('preselection','supervisor','manager'));
alter table interviews add column if not exists duration_min int default 45;
alter table interviews add column if not exists score numeric;
alter table interviews add column if not exists observations text;

alter table payments add column if not exists modality text
  check (modality in ('contado','financiado'));
alter table payments add column if not exists total_cop int;
alter table payments add column if not exists initial_paid boolean default false;

alter table evaluations add column if not exists retry_count int default 0;
alter table evaluations add column if not exists reinforced boolean default false;

alter table course_contents add column if not exists published boolean default false;
alter table course_contents add column if not exists week int;

alter table pipeline_stages add column if not exists updated_by uuid references profiles(id);
alter table pipeline_stages add column if not exists updated_at timestamptz default now();
alter table pipeline_stages add column if not exists stage text;
