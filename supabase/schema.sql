-- =========================================================
-- REHAB-AI: PostgreSQL Schema (Supabase)
-- Real-time Tele-Rehabilitation Telemetry & Clinical EMR
-- Authentication, RBAC & Row Level Security (RLS) Policies
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ROLE ENUM & PROFILES TABLE
-- Roles: PATIENT, PHYSIOTHERAPIST, CAREGIVER, ADMIN
create type user_role_enum as enum ('PATIENT', 'PHYSIOTHERAPIST', 'CAREGIVER', 'ADMIN');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role_enum not null default 'PATIENT',
  language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for rapid email & role lookup
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_email on public.profiles(email);

-- 2. PATIENTS TABLE
create table if not exists public.patients (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  date_of_birth date,
  created_at timestamptz not null default now()
);

create index if not exists idx_patients_profile_id on public.patients(profile_id);

-- 3. CLINICIAN - PATIENT ASSIGNMENTS TABLE
-- Physiotherapists can only access assigned patients
create table if not exists public.clinician_patient (
  id uuid primary key default uuid_generate_v4(),
  clinician_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (clinician_id, patient_id)
);

create index if not exists idx_cp_clinician on public.clinician_patient(clinician_id);
create index if not exists idx_cp_patient on public.clinician_patient(patient_id);

-- 4. CAREGIVER - PATIENT AUTHORIZATION TABLE
-- Caregivers can only access explicitly authorized patient information
create table if not exists public.caregiver_patient (
  id uuid primary key default uuid_generate_v4(),
  caregiver_id uuid not null references public.profiles(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  access_level text not null default 'view_summary' check (access_level in ('view_summary', 'view_telemetry', 'emergency_contact')),
  created_at timestamptz not null default now(),
  unique (caregiver_id, patient_id)
);

create index if not exists idx_cgp_caregiver on public.caregiver_patient(caregiver_id);
create index if not exists idx_cgp_patient on public.caregiver_patient(patient_id);

-- 5. CLINICAL PATIENT RECORDS
create table if not exists public.patient_records (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  diagnosis text not null,
  affected_side text check (affected_side in ('left', 'right', 'both')),
  surgery_date date,
  protocol_start_date date default current_date,
  risk_level text check (risk_level in ('low', 'medium', 'high')) default 'low',
  risk_notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_records_patient on public.patient_records(patient_id);

-- 6. EXERCISE PRESCRIPTIONS
create table if not exists public.prescriptions (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  clinician_id uuid not null references public.profiles(id),
  exercise_id text not null,
  exercise_name text not null,
  target_reps int not null default 10,
  target_sets int not null default 3,
  target_angle_min numeric(5,2) not null,
  target_angle_max numeric(5,2) not null,
  hold_duration_seconds numeric(4,1) not null default 2.0,
  frequency_days_per_week int not null default 5,
  notes_for_patient text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_prescriptions_patient on public.prescriptions(patient_id);

-- 7. REHABILITATION SESSIONS
create table if not exists public.exercise_sessions (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  prescription_id uuid references public.prescriptions(id),
  exercise_id text not null,
  exercise_name text not null,
  target_reps int not null,
  completed_reps int not null,
  clean_reps int not null,
  average_rom numeric(5,2) not null,
  peak_rom numeric(5,2) not null,
  target_rom numeric(5,2) not null,
  average_hold_time numeric(4,2) not null,
  overall_score numeric(5,2) not null,
  pain_score int check (pain_score between 0 and 10),
  effort_rpe int check (effort_rpe between 1 and 10),
  patient_feedback text,
  clinician_notes text,
  started_at timestamptz not null default now(),
  completed_at timestamptz not null default now()
);

create index if not exists idx_sessions_patient on public.exercise_sessions(patient_id);

-- 8. REP-BY-REP TELEMETRY
create table if not exists public.rep_telemetry (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.exercise_sessions(id) on delete cascade,
  rep_number int not null,
  peak_angle numeric(5,2) not null,
  target_angle_min numeric(5,2) not null,
  hold_duration_achieved numeric(4,2) not null,
  target_hold_duration numeric(4,2) not null,
  score numeric(5,2) not null,
  passed boolean not null default true,
  compensations_detected jsonb default '[]'::jsonb,
  duration_ms int not null,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_rep_telemetry_session on public.rep_telemetry(session_id);

-- =========================================================
-- SECURITY FUNCTIONS & HELPERS
-- =========================================================

-- Helper to check if current user is an ADMIN
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

-- Helper to get patient id associated with current auth user (if patient)
create or replace function public.get_my_patient_id()
returns uuid language sql stable security definer as $$
  select id from public.patients
  where profile_id = auth.uid()
  limit 1;
$$;

-- Helper to check if current user is an assigned clinician for a patient
create or replace function public.is_assigned_clinician(p_patient_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.clinician_patient
    where clinician_id = auth.uid() and patient_id = p_patient_id
  );
$$;

-- Helper to check if current user is an authorized caregiver for a patient
create or replace function public.is_authorized_caregiver(p_patient_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.caregiver_patient
    where caregiver_id = auth.uid() and patient_id = p_patient_id
  );
$$;

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.clinician_patient enable row level security;
alter table public.caregiver_patient enable row level security;
alter table public.patient_records enable row level security;
alter table public.prescriptions enable row level security;
alter table public.exercise_sessions enable row level security;
alter table public.rep_telemetry enable row level security;

-- ---------------------------------------------------------
-- PROFILES POLICIES
-- ---------------------------------------------------------
-- 1. Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- 2. Clinicians can view profiles of their assigned patients
create policy "Clinicians can view assigned patient profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.patients p
      join public.clinician_patient cp on cp.patient_id = p.id
      where cp.clinician_id = auth.uid() and p.profile_id = profiles.id
    )
  );

-- 3. Caregivers can view profiles of their authorized patients
create policy "Caregivers can view authorized patient profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.patients p
      join public.caregiver_patient cgp on cgp.patient_id = p.id
      where cgp.caregiver_id = auth.uid() and p.profile_id = profiles.id
    )
  );

-- 4. Users can update their own profile, but CANNOT tamper with their role (role change requires admin)
create policy "Users can update own profile non-role fields"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    -- Admins can update any field including role
    public.is_admin()
    or (
      -- Normal users cannot change their role
      auth.uid() = id
      and role = (select p.role from public.profiles p where p.id = auth.uid())
    )
  );

-- 5. Insert policy for authenticated user
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

-- ---------------------------------------------------------
-- PATIENTS POLICIES
-- ---------------------------------------------------------
-- Patient can only access their own patient data
create policy "Patients can view own patient record"
  on public.patients for select
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or public.is_assigned_clinician(id)
    or public.is_authorized_caregiver(id)
  );

create policy "Admins or patients can insert patient record"
  on public.patients for insert
  with check (profile_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------
-- CLINICIAN_PATIENT POLICIES
-- ---------------------------------------------------------
create policy "Clinicians can view their patient assignments"
  on public.clinician_patient for select
  using (
    clinician_id = auth.uid()
    or patient_id = public.get_my_patient_id()
    or public.is_admin()
  );

create policy "Admins and clinicians can manage assignments"
  on public.clinician_patient for all
  using (clinician_id = auth.uid() or public.is_admin())
  with check (clinician_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------
-- CAREGIVER_PATIENT POLICIES
-- ---------------------------------------------------------
create policy "Caregivers can view their patient authorizations"
  on public.caregiver_patient for select
  using (
    caregiver_id = auth.uid()
    or patient_id = public.get_my_patient_id()
    or public.is_admin()
  );

create policy "Patients or admins can manage caregiver authorizations"
  on public.caregiver_patient for all
  using (
    patient_id = public.get_my_patient_id()
    or public.is_admin()
  )
  with check (
    patient_id = public.get_my_patient_id()
    or public.is_admin()
  );

-- ---------------------------------------------------------
-- PATIENT_RECORDS POLICIES
-- ---------------------------------------------------------
create policy "Authorized users can read patient records"
  on public.patient_records for select
  using (
    patient_id = public.get_my_patient_id()
    or public.is_assigned_clinician(patient_id)
    or public.is_authorized_caregiver(patient_id)
    or public.is_admin()
  );

create policy "Clinicians and admins can modify patient records"
  on public.patient_records for all
  using (
    public.is_assigned_clinician(patient_id)
    or public.is_admin()
  )
  with check (
    public.is_assigned_clinician(patient_id)
    or public.is_admin()
  );

-- ---------------------------------------------------------
-- PRESCRIPTIONS POLICIES
-- ---------------------------------------------------------
create policy "Authorized users can read prescriptions"
  on public.prescriptions for select
  using (
    patient_id = public.get_my_patient_id()
    or public.is_assigned_clinician(patient_id)
    or public.is_authorized_caregiver(patient_id)
    or public.is_admin()
  );

create policy "Clinicians can write prescriptions for assigned patients"
  on public.prescriptions for insert
  with check (
    (public.is_assigned_clinician(patient_id) and clinician_id = auth.uid())
    or public.is_admin()
  );

create policy "Clinicians can update prescriptions for assigned patients"
  on public.prescriptions for update
  using (
    (public.is_assigned_clinician(patient_id) and clinician_id = auth.uid())
    or public.is_admin()
  );

-- ---------------------------------------------------------
-- EXERCISE_SESSIONS POLICIES
-- ---------------------------------------------------------
create policy "Authorized users can read exercise sessions"
  on public.exercise_sessions for select
  using (
    patient_id = public.get_my_patient_id()
    or public.is_assigned_clinician(patient_id)
    or public.is_authorized_caregiver(patient_id)
    or public.is_admin()
  );

create policy "Patients can insert their own exercise sessions"
  on public.exercise_sessions for insert
  with check (
    patient_id = public.get_my_patient_id()
    or public.is_admin()
  );

create policy "Clinicians can review exercise sessions"
  on public.exercise_sessions for update
  using (
    public.is_assigned_clinician(patient_id)
    or public.is_admin()
  );

-- ---------------------------------------------------------
-- REP_TELEMETRY POLICIES
-- ---------------------------------------------------------
create policy "Authorized users can read rep telemetry"
  on public.rep_telemetry for select
  using (
    exists (
      select 1 from public.exercise_sessions s
      where s.id = rep_telemetry.session_id
        and (
          s.patient_id = public.get_my_patient_id()
          or public.is_assigned_clinician(s.patient_id)
          or public.is_authorized_caregiver(s.patient_id)
          or public.is_admin()
        )
    )
  );

create policy "Patients can insert telemetry for their own sessions"
  on public.rep_telemetry for insert
  with check (
    exists (
      select 1 from public.exercise_sessions s
      where s.id = rep_telemetry.session_id
        and (s.patient_id = public.get_my_patient_id() or public.is_admin())
    )
  );

-- =========================================================
-- AUTOMATED USER REGISTRATION TRIGGER
-- Synchronizes auth.users into public.profiles & public.patients
-- =========================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role_enum;
  v_full_name text;
  v_language text;
begin
  -- Resolve role safely from raw_user_meta_data or default to 'PATIENT'
  begin
    v_role := (new.raw_user_meta_data->>'role')::user_role_enum;
  exception when others then
    v_role := 'PATIENT'::user_role_enum;
  end;

  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_language := coalesce(new.raw_user_meta_data->>'language', 'en');

  insert into public.profiles (id, full_name, email, role, language, created_at, updated_at)
  values (new.id, v_full_name, new.email, v_role, v_language, now(), now())
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email,
      updated_at = now();

  -- If registered as PATIENT, automatically create corresponding patient record
  if v_role = 'PATIENT' then
    insert into public.patients (profile_id, created_at)
    values (new.id, now())
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
