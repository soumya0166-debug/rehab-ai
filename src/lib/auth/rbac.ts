// REHAB-AI: Authentication, Role-Based Access Control (RBAC), and Persona Switcher
import { UserRole } from '@/types/rehab';

export interface UserPersona {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl: string;
  title: string;
  associatedPatientId?: string;
}

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'usr-patient-1',
    name: 'Sarah Connor',
    role: 'patient',
    email: 'sarah.connor@rehab-ai.health',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    title: 'Post-Op Knee Patient',
    associatedPatientId: 'pt-001',
  },
  {
    id: 'usr-clinician-1',
    name: 'Dr. Michael Chen, DPT',
    role: 'clinician',
    email: 'dr.chen@sportsrehab.clinic',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=160&q=80',
    title: 'Lead Physical Therapist',
  },
  {
    id: 'usr-caregiver-1',
    name: 'John Connor',
    role: 'caregiver',
    email: 'john.care@familynet.org',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    title: 'Caregiver / Family Guardian',
    associatedPatientId: 'pt-001',
  },
];

export interface RolePermissions {
  canStartWorkout: boolean;
  canEditPrescriptions: boolean;
  canViewAllPatients: boolean;
  canViewCaregiverFeed: boolean;
  canGenerateClinicalNotes: boolean;
  canExportReports: boolean;
  canLogPainEffort: boolean;
}

const patientPerms: RolePermissions = {
  canStartWorkout: true,
  canEditPrescriptions: false,
  canViewAllPatients: false,
  canViewCaregiverFeed: false,
  canGenerateClinicalNotes: false,
  canExportReports: true,
  canLogPainEffort: true,
};

const clinicianPerms: RolePermissions = {
  canStartWorkout: true,
  canEditPrescriptions: true,
  canViewAllPatients: true,
  canViewCaregiverFeed: true,
  canGenerateClinicalNotes: true,
  canExportReports: true,
  canLogPainEffort: false,
};

const caregiverPerms: RolePermissions = {
  canStartWorkout: false,
  canEditPrescriptions: false,
  canViewAllPatients: false,
  canViewCaregiverFeed: true,
  canGenerateClinicalNotes: false,
  canExportReports: true,
  canLogPainEffort: false,
};

const adminPerms: RolePermissions = {
  canStartWorkout: true,
  canEditPrescriptions: true,
  canViewAllPatients: true,
  canViewCaregiverFeed: true,
  canGenerateClinicalNotes: true,
  canExportReports: true,
  canLogPainEffort: true,
};

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  patient: patientPerms,
  PATIENT: patientPerms,
  clinician: clinicianPerms,
  physiotherapist: clinicianPerms,
  PHYSIOTHERAPIST: clinicianPerms,
  caregiver: caregiverPerms,
  CAREGIVER: caregiverPerms,
  admin: adminPerms,
  ADMIN: adminPerms,
};

const ACTIVE_PERSONA_KEY = 'rehab_ai_active_persona_v1';

export function getActivePersona(): UserPersona {
  if (typeof window === 'undefined') return USER_PERSONAS[0];
  try {
    const raw = localStorage.getItem(ACTIVE_PERSONA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const found = USER_PERSONAS.find((p) => p.id === parsed.id);
      if (found) return found;
    }
  } catch (err) {
    console.error('Error reading active persona:', err);
  }
  return USER_PERSONAS[0];
}

export function setActivePersona(persona: UserPersona) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_PERSONA_KEY, JSON.stringify(persona));
  } catch (err) {
    console.error('Error saving active persona:', err);
  }
}
