// REHAB-AI: Backend Authorization Guards & Access Control Evaluators
// Enforces authorization rules at the backend level (Never trusting client claims)
import { CanonicalRole, UserProfile } from '@/types';
import { normalizeRole } from './auth-service';

export interface AuthorizationContext {
  userId: string;
  role: CanonicalRole;
  patientId?: string; // If user is patient, their own patient ID
}

export interface PatientAccessCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates whether a user is authorized to access a patient's records.
 * Rules:
 * 1. Admin has full administrative access.
 * 2. Patient can only access their own patient records.
 * 3. Physiotherapist can only access assigned patients.
 * 4. Caregiver can only access explicitly authorized patients.
 */
export function evaluatePatientDataAccess(params: {
  context: AuthorizationContext;
  targetPatientId: string;
  targetPatientProfileId?: string;
  assignedClinicianIds?: string[];
  authorizedCaregiverIds?: string[];
}): PatientAccessCheck {
  const { context, targetPatientId, targetPatientProfileId, assignedClinicianIds = [], authorizedCaregiverIds = [] } = params;

  // Rule 1: ADMIN has administrative access
  if (context.role === 'ADMIN') {
    return { allowed: true, reason: 'Administrative override granted.' };
  }

  // Rule 2: PATIENT can only access their own patient data
  if (context.role === 'PATIENT') {
    const isSelfPatientId = context.patientId && context.patientId === targetPatientId;
    const isSelfProfileId = targetPatientProfileId && targetPatientProfileId === context.userId;

    if (isSelfPatientId || isSelfProfileId) {
      return { allowed: true, reason: 'Patient accessing own telemetry/records.' };
    }
    return {
      allowed: false,
      reason: 'FORBIDDEN: Patient users can only access their own patient data.',
    };
  }

  // Rule 3: PHYSIOTHERAPIST can only access assigned patients
  if (context.role === 'PHYSIOTHERAPIST') {
    const isAssigned = assignedClinicianIds.includes(context.userId);
    if (isAssigned) {
      return { allowed: true, reason: 'Clinician is assigned to this patient.' };
    }
    return {
      allowed: false,
      reason: 'FORBIDDEN: Physiotherapists can only access assigned patients.',
    };
  }

  // Rule 4: CAREGIVER can only access explicitly authorized patient information
  if (context.role === 'CAREGIVER') {
    const isAuthorized = authorizedCaregiverIds.includes(context.userId);
    if (isAuthorized) {
      return { allowed: true, reason: 'Caregiver has explicit authorization for this patient.' };
    }
    return {
      allowed: false,
      reason: 'FORBIDDEN: Caregivers can only access explicitly authorized patient information.',
    };
  }

  return { allowed: false, reason: 'FORBIDDEN: Unrecognized role or permissions.' };
}

/**
 * Checks if a route path is permissible for a verified user role.
 */
export function isRouteAllowedForRole(pathname: string, verifiedRole: CanonicalRole): boolean {
  if (verifiedRole === 'ADMIN') {
    return true; // Admin has administrative access to all portals
  }

  if (pathname.startsWith('/patient')) {
    return verifiedRole === 'PATIENT';
  }

  if (pathname.startsWith('/clinician')) {
    return verifiedRole === 'PHYSIOTHERAPIST';
  }

  if (pathname.startsWith('/caregiver')) {
    return verifiedRole === 'CAREGIVER';
  }

  if (pathname.startsWith('/admin')) {
    return false;
  }

  return true;
}

/**
 * Checks if user has admin privileges.
 */
export function hasAdminPrivileges(user: UserProfile | null): boolean {
  if (!user) return false;
  return normalizeRole(user.role) === 'ADMIN';
}
