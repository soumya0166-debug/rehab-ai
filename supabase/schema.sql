-- =========================================================
-- REHAB-AI: PostgreSQL Schema (Supabase)
-- Real-time Tele-Rehabilitation Telemetry & Clinical EMR
-- Authentication, RBAC, Exercise Models & RLS Policies
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

-- =========================================================
-- 5. EXERCISES & REHABILITATION DATA MODEL
-- =========================================================

-- EXERCISES TABLE
create table if not exists public.exercises (
  id text primary key,
  name text not null,
  description text not null,
  body_part text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  camera_view text not null check (camera_view in ('frontal', 'sagittal_left', 'sagittal_right', 'oblique_45', 'custom')),
  required_landmarks jsonb not null default '[]'::jsonb,
  configuration jsonb not null default '{}'::jsonb,
  safety_notes text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_exercises_body_part on public.exercises(body_part);

-- PRESCRIPTIONS TABLE
create table if not exists public.prescriptions (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  exercise_id text not null references public.exercises(id) on delete cascade,
  target_reps int not null check (target_reps > 0),
  target_range_min numeric(5,2) not null,
  target_range_max numeric(5,2) not null,
  instructions text not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prescriptions_patient on public.prescriptions(patient_id);
create index if not exists idx_prescriptions_exercise on public.prescriptions(exercise_id);
create index if not exists idx_prescriptions_created_by on public.prescriptions(created_by);

-- SESSIONS TABLE
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  exercise_id text not null references public.exercises(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  repetitions int not null default 0,
  successful_repetitions int not null default 0,
  incomplete_repetitions int not null default 0,
  duration_seconds numeric(8,2) not null default 0,
  quality_score numeric(5,2) not null default 0,
  tracking_quality text not null default 'high' check (tracking_quality in ('high', 'medium', 'low', 'uncalibrated')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned'))
);

create index if not exists idx_sessions_patient on public.sessions(patient_id);
create index if not exists idx_sessions_exercise on public.sessions(exercise_id);
create index if not exists idx_sessions_status on public.sessions(status);

-- SESSION_METRICS TABLE
create table if not exists public.session_metrics (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  average_angle numeric(5,2) not null,
  minimum_angle numeric(5,2) not null,
  maximum_angle numeric(5,2) not null,
  average_rep_duration numeric(6,2) not null,
  successful_reps int not null default 0,
  incomplete_reps int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_session_metrics_session on public.session_metrics(session_id);

-- PATIENT_FEEDBACK TABLE
create table if not exists public.patient_feedback (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  pain_level int not null check (pain_level between 0 and 10),
  fatigue_level int not null check (fatigue_level between 1 and 10),
  patient_comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_patient_feedback_session on public.patient_feedback(session_id);

-- CLINICAL PATIENT RECORDS (EMR diagnosis)
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

-- Helper to check if current user is a PHYSIOTHERAPIST
create or replace function public.is_physiotherapist()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'PHYSIOTHERAPIST'
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
alter table public.exercises enable row level security;
alter table public.prescriptions enable row level security;
alter table public.sessions enable row level security;
alter table public.session_metrics enable row level security;
alter table public.patient_feedback enable row level security;
alter table public.patient_records enable row level security;

-- ---------------------------------------------------------
-- PROFILES POLICIES
-- ---------------------------------------------------------
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Clinicians can view assigned patient profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.patients p
      join public.clinician_patient cp on cp.patient_id = p.id
      where cp.clinician_id = auth.uid() and p.profile_id = profiles.id
    )
  );

create policy "Caregivers can view authorized patient profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.patients p
      join public.caregiver_patient cgp on cgp.patient_id = p.id
      where cgp.caregiver_id = auth.uid() and p.profile_id = profiles.id
    )
  );

create policy "Users can update own profile non-role fields"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin()
    or (
      auth.uid() = id
      and role = (select p.role from public.profiles p where p.id = auth.uid())
    )
  );

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

-- ---------------------------------------------------------
-- PATIENTS POLICIES
-- ---------------------------------------------------------
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
-- EXERCISES POLICIES
-- ---------------------------------------------------------
-- All authenticated users can view clinical exercise catalog
create policy "Authenticated users can view exercise catalog"
  on public.exercises for select
  using (auth.uid() is not null);

-- Clinicians and Admins can create or update exercise catalog definitions
create policy "Clinicians and Admins can manage exercise definitions"
  on public.exercises for all
  using (public.is_physiotherapist() or public.is_admin())
  with check (public.is_physiotherapist() or public.is_admin());

-- ---------------------------------------------------------
-- PRESCRIPTIONS POLICIES
-- ---------------------------------------------------------
-- Patients view own; Clinicians view assigned; Caregivers view authorized; Admins view all
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
    (public.is_assigned_clinician(patient_id) and created_by = auth.uid())
    or public.is_admin()
  );

create policy "Clinicians can update prescriptions for assigned patients"
  on public.prescriptions for update
  using (
    (public.is_assigned_clinician(patient_id) and created_by = auth.uid())
    or public.is_admin()
  );

-- ---------------------------------------------------------
-- SESSIONS POLICIES
-- ---------------------------------------------------------
-- Patients view own; Clinicians view assigned; Caregivers view authorized; Admins view all
create policy "Authorized users can read sessions"
  on public.sessions for select
  using (
    patient_id = public.get_my_patient_id()
    or public.is_assigned_clinician(patient_id)
    or public.is_authorized_caregiver(patient_id)
    or public.is_admin()
  );

create policy "Patients can insert their own exercise sessions"
  on public.sessions for insert
  with check (
    patient_id = public.get_my_patient_id()
    or public.is_admin()
  );

create policy "Patients can update their ongoing sessions"
  on public.sessions for update
  using (
    patient_id = public.get_my_patient_id()
    or public.is_admin()
  );

-- ---------------------------------------------------------
-- SESSION_METRICS POLICIES
-- ---------------------------------------------------------
create policy "Authorized users can read session metrics"
  on public.session_metrics for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_metrics.session_id
        and (
          s.patient_id = public.get_my_patient_id()
          or public.is_assigned_clinician(s.patient_id)
          or public.is_authorized_caregiver(s.patient_id)
          or public.is_admin()
        )
    )
  );

create policy "Patients can record session metrics"
  on public.session_metrics for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_metrics.session_id
        and (s.patient_id = public.get_my_patient_id() or public.is_admin())
    )
  );

-- ---------------------------------------------------------
-- PATIENT_FEEDBACK POLICIES
-- ---------------------------------------------------------
create policy "Authorized users can read patient feedback"
  on public.patient_feedback for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = patient_feedback.session_id
        and (
          s.patient_id = public.get_my_patient_id()
          or public.is_assigned_clinician(s.patient_id)
          or public.is_authorized_caregiver(s.patient_id)
          or public.is_admin()
        )
    )
  );

create policy "Patients can submit session feedback"
  on public.patient_feedback for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = patient_feedback.session_id
        and (s.patient_id = public.get_my_patient_id() or public.is_admin())
    )
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

-- =========================================================
-- AUTOMATED USER REGISTRATION TRIGGER
-- =========================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role_enum;
  v_full_name text;
  v_language text;
begin
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

  if v_role = 'PATIENT' then
    insert into public.patients (profile_id, created_at)
    values (new.id, now())
    on conflict (profile_id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- SEED DATA: EXACTLY THREE INITIAL EXERCISES
-- Prototype configurations clearly marked as configurable by a qualified physiotherapist
-- =========================================================

insert into public.exercises (
  id,
  name,
  description,
  body_part,
  difficulty,
  camera_view,
  required_landmarks,
  configuration,
  safety_notes
) values
(
  'elbow-flexion',
  'Elbow Flexion',
  'Controlled concentric and eccentric flexion of the elbow joint to restore biceps and brachialis functional mobility.',
  'upper_extremity',
  'beginner',
  'sagittal_left',
  '["LEFT_SHOULDER", "LEFT_ELBOW", "LEFT_WRIST", "LEFT_HIP"]'::jsonb,
  '{
    "isPrototype": true,
    "clinicalDisclaimer": "PROTOTYPE CONFIGURATION: Range of motion targets and cadence must be customized and approved by a qualified physiotherapist.",
    "targetJoint": "left_elbow",
    "startingCondition": {
      "posture": "seated_or_standing_upright",
      "startAngleDegrees": 150.0,
      "maxAngleDeviation": 15.0,
      "settleTimeMs": 1000
    },
    "movementPhases": ["START", "CONCENTRIC_FLEXION", "PEAK_HOLD", "ECCENTRIC_EXTENSION", "COMPLETED"],
    "repetitionLogic": {
      "startAngle": 150.0,
      "peakFlexionMinAngle": 35.0,
      "peakFlexionMaxAngle": 55.0,
      "returnExtensionThreshold": 140.0,
      "minimumHoldSeconds": 1.5
    },
    "targetMeasurement": {
      "metric": "elbow_flexion_angle_degrees",
      "defaultMinAngle": 40.0,
      "defaultMaxAngle": 150.0,
      "unit": "degrees"
    },
    "feedbackRules": [
      {
        "id": "trunk_sway",
        "condition": "trunk_lean_greater_than_12_degrees",
        "cue": "Keep your upper body still. Avoid leaning backwards."
      },
      {
        "id": "shoulder_elevation",
        "condition": "shoulder_hike_detected",
        "cue": "Keep your shoulder relaxed and elbow anchored at your side."
      }
    ],
    "cameraPositioningGuidance": {
      "distanceMeters": 2.0,
      "recommendedAngle": "Side sagittal view (90 degrees to body)",
      "cameraHeight": "Chest height",
      "instructions": "Position camera at side profile. Ensure shoulder, elbow, and wrist remain in frame throughout the entire movement."
    }
  }'::jsonb,
  'PROTOTYPE CONFIGURATION: Must be reviewed and adjusted by a qualified clinician. Discontinue immediately if acute anterior elbow pain or joint impingement occurs.'
),
(
  'shoulder-raise',
  'Shoulder Raise',
  'Active assisted or unassisted glenohumeral arm raise in the scapular plane to rehabilitate subacromial clearance and shoulder mobility.',
  'upper_extremity',
  'intermediate',
  'frontal',
  '["LEFT_SHOULDER", "RIGHT_SHOULDER", "LEFT_ELBOW", "RIGHT_ELBOW", "LEFT_HIP", "RIGHT_HIP"]'::jsonb,
  '{
    "isPrototype": true,
    "clinicalDisclaimer": "PROTOTYPE CONFIGURATION: Elevation targets and cadence must be customized and approved by a qualified physiotherapist.",
    "targetJoint": "left_shoulder",
    "startingCondition": {
      "posture": "standing_feet_hip_width",
      "startAngleDegrees": 20.0,
      "maxAngleDeviation": 10.0,
      "settleTimeMs": 1200
    },
    "movementPhases": ["START", "ASCENT_SCAPTION", "PEAK_HOLD", "CONTROLLED_DESCENT", "COMPLETED"],
    "repetitionLogic": {
      "startAngle": 20.0,
      "peakFlexionMinAngle": 85.0,
      "peakFlexionMaxAngle": 110.0,
      "returnExtensionThreshold": 30.0,
      "minimumHoldSeconds": 2.0
    },
    "targetMeasurement": {
      "metric": "shoulder_elevation_angle_degrees",
      "defaultMinAngle": 85.0,
      "defaultMaxAngle": 110.0,
      "unit": "degrees"
    },
    "feedbackRules": [
      {
        "id": "shoulder_shrug",
        "condition": "trapezius_hiking_above_threshold",
        "cue": "Relax neck muscles. Do not shrug your shoulder toward your ear."
      },
      {
        "id": "lateral_trunk_lean",
        "condition": "lateral_lean_greater_than_10_degrees",
        "cue": "Maintain an upright spine without leaning sideways."
      }
    ],
    "cameraPositioningGuidance": {
      "distanceMeters": 2.5,
      "recommendedAngle": "Frontal view directly facing camera",
      "cameraHeight": "Mid-torso height",
      "instructions": "Step back until both shoulders, elbows, and hips are clearly visible in the camera frame."
    }
  }'::jsonb,
  'PROTOTYPE CONFIGURATION: Must be reviewed and adjusted by a qualified clinician. Avoid exceeding prescribed pain-free abduction angles; do not force range if subacromial pinch is experienced.'
),
(
  'sit-to-stand',
  'Sit-to-Stand',
  'Functional closed-chain lower body biomechanical transfer enhancing quadriceps, gluteal strength, and postural stability.',
  'lower_extremity',
  'intermediate',
  'oblique_45',
  '["LEFT_HIP", "RIGHT_HIP", "LEFT_KNEE", "RIGHT_KNEE", "LEFT_ANKLE", "RIGHT_ANKLE", "LEFT_SHOULDER", "RIGHT_SHOULDER"]'::jsonb,
  '{
    "isPrototype": true,
    "clinicalDisclaimer": "PROTOTYPE CONFIGURATION: Chair height, repetition count, and support assistance must be prescribed by a qualified physiotherapist.",
    "targetJoint": "bilateral_knee_and_hip",
    "startingCondition": {
      "posture": "seated_firm_chair_feet_flat",
      "startAngleDegrees": 90.0,
      "maxAngleDeviation": 15.0,
      "settleTimeMs": 1500
    },
    "movementPhases": ["SEATED", "FORWARD_WEIGHT_TRANSFER", "EXTENSION_DRIVE", "STANDING_LOCKOUT", "CONTROLLED_DESCENT", "COMPLETED"],
    "repetitionLogic": {
      "startAngle": 90.0,
      "peakFlexionMinAngle": 170.0,
      "peakFlexionMaxAngle": 180.0,
      "returnExtensionThreshold": 95.0,
      "minimumHoldSeconds": 1.0
    },
    "targetMeasurement": {
      "metric": "knee_extension_angle_degrees",
      "defaultMinAngle": 90.0,
      "defaultMaxAngle": 175.0,
      "unit": "degrees"
    },
    "feedbackRules": [
      {
        "id": "knee_valgus",
        "condition": "knee_inward_deviation_greater_than_15mm",
        "cue": "Keep knees tracking over second toes. Avoid knees caving inward."
      },
      {
        "id": "asymmetrical_weight_bearing",
        "condition": "weight_asymmetry_greater_than_20_percent",
        "cue": "Distribute weight symmetrically through both heels."
      }
    ],
    "cameraPositioningGuidance": {
      "distanceMeters": 3.0,
      "recommendedAngle": "45-degree front-diagonal or side sagittal view",
      "cameraHeight": "Hip height",
      "instructions": "Place camera to capture whole chair and standing body from head to feet. Ensure solid lighting and a stable, armless chair."
    }
  }'::jsonb,
  'PROTOTYPE CONFIGURATION: Must be reviewed and adjusted by a qualified clinician. Have a stable support surface nearby if balance or vestibular impairments exist.'
)
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  body_part = excluded.body_part,
  difficulty = excluded.difficulty,
  camera_view = excluded.camera_view,
  required_landmarks = excluded.required_landmarks,
  configuration = excluded.configuration,
  safety_notes = excluded.safety_notes;
