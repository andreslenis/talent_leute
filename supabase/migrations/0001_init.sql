-- Talent Leute schema
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'candidate' check (role in ('candidate','staff','admin')),
  created_at timestamptz default now()
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  full_name text not null,
  email text not null,
  phone text,
  city text,
  profession text,
  experience_years int,
  motivation text,
  status text default 'submitted',
  created_at timestamptz default now()
);

create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  referrer_name text,
  referrer_contact text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  stage text not null,
  notes text,
  created_at timestamptz default now()
);

create table if not exists interviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  scheduled_at timestamptz,
  result text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  bucket text not null,
  path text not null,
  doc_type text,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references applications(id) on delete cascade,
  amount_cop int not null,
  method text,
  receipt_path text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists installments (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id) on delete cascade,
  amount_cop int not null,
  due_date date,
  paid boolean default false,
  created_at timestamptz default now()
);

create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  week int not null,
  score numeric,
  passed boolean,
  retry_allowed boolean default true,
  notes text,
  created_at timestamptz default now()
);

create table if not exists course_contents (
  id uuid primary key default gen_random_uuid(),
  week int not null,
  title text not null,
  body text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table applications enable row level security;
alter table referrals enable row level security;
alter table pipeline_stages enable row level security;
alter table interviews enable row level security;
alter table documents enable row level security;
alter table payments enable row level security;
alter table installments enable row level security;
alter table evaluations enable row level security;
alter table course_contents enable row level security;

create policy "profiles self read" on profiles for select using (auth.uid() = id);
create policy "applications insert anon" on applications for insert with check (true);
create policy "applications staff read" on applications for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
  or user_id = auth.uid()
);
create policy "course_contents read auth" on course_contents for select using (auth.role() = 'authenticated');
create policy "staff manage contents" on course_contents for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('staff','admin'))
);
