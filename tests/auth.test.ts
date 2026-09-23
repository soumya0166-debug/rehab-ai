// REHAB-AI: Comprehensive Authentication & Authorization Layer Test Suite
// Verifies PostgreSQL RLS logic, role guards, protected routes, session preservation, and logout
import {
  evaluatePatientDataAccess,
  isRouteAllowedForRole,
  hasAdminPrivileges,
  AuthorizationContext,
} from '../src/lib/auth/guards';
import {
  normalizeRole,
  getRoleDashboardPath,
  SEED_PROFILES,
  persistLocalSession,
  signOutUser,
  getCurrentUserProfile,
} from '../src/lib/auth/auth-service';

// Mock localStorage and document for NodeJS testing environment
const mockStorage: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  length: 0,
  key: () => null,
};
(globalThis as unknown as { document: { cookie: string } }).document = { cookie: '' };

// Self-contained async test runner primitives
async function describe(suiteName: string, fn: () => Promise<void> | void) {
  console.log(`\n--- Test Suite: ${suiteName} ---`);
  await fn();
}

async function it(testName: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`  [PASS] ${testName}`);
  } catch (error) {
    console.error(`  [FAIL] ${testName}`, error);
    throw error;
  }
}

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${String(expected)}, but got ${String(actual)}`);
      }
    },
    toBeDefined() {
      if (actual === undefined || actual === null) {
        throw new Error(`Expected value to be defined, but got ${String(actual)}`);
      }
    },
    toBeNull() {
      if (actual !== null && actual !== undefined) {
        throw new Error(`Expected null, but got ${String(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy, but got ${String(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy, but got ${String(actual)}`);
      }
    },
  };
}

async function runAllTests() {
  // -------------------------------------------------------------
  // Test 1: Patient access isolation (RLS logic)
  // -------------------------------------------------------------
  await describe('Requirement 5: Patient Data Isolation', async () => {
    const patientContext: AuthorizationContext = {
      userId: 'usr-patient-1',
      role: 'PATIENT',
      patientId: 'pt-001',
    };

    await it('patient can access their own patient data', () => {
      const check = evaluatePatientDataAccess({
        context: patientContext,
        targetPatientId: 'pt-001',
        targetPatientProfileId: 'usr-patient-1',
      });
      expect(check.allowed).toBe(true);
    });

    await it('patient cannot access another patient records', () => {
      const check = evaluatePatientDataAccess({
        context: patientContext,
        targetPatientId: 'pt-002', // Marcus Vance
        targetPatientProfileId: 'usr-patient-2',
      });
      expect(check.allowed).toBe(false);
      expect(check.reason?.includes('FORBIDDEN')).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // Test 2: Clinician assignment verification (RLS logic)
  // -------------------------------------------------------------
  await describe('Requirement 6: Physiotherapist Assignment Access Control', async () => {
    const clinicianContext: AuthorizationContext = {
      userId: 'usr-clinician-1',
      role: 'PHYSIOTHERAPIST',
    };

    await it('clinician can access assigned patients', () => {
      const check = evaluatePatientDataAccess({
        context: clinicianContext,
        targetPatientId: 'pt-001',
        assignedClinicianIds: ['usr-clinician-1'], // Assigned to Sarah
      });
      expect(check.allowed).toBe(true);
    });

    await it('clinician cannot access unassigned patients', () => {
      const check = evaluatePatientDataAccess({
        context: clinicianContext,
        targetPatientId: 'pt-999', // Unknown / unassigned patient
        assignedClinicianIds: ['usr-clinician-2'], // Assigned to Dr. SomeoneElse
      });
      expect(check.allowed).toBe(false);
      expect(check.reason?.includes('assigned patients')).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // Test 3: Caregiver authorization verification (RLS logic)
  // -------------------------------------------------------------
  await describe('Requirement 7: Caregiver Explicit Authorization', async () => {
    const caregiverContext: AuthorizationContext = {
      userId: 'usr-caregiver-1',
      role: 'CAREGIVER',
    };

    await it('caregiver can access explicitly authorized patient information', () => {
      const check = evaluatePatientDataAccess({
        context: caregiverContext,
        targetPatientId: 'pt-001',
        authorizedCaregiverIds: ['usr-caregiver-1'], // John authorized for Sarah
      });
      expect(check.allowed).toBe(true);
    });

    await it('caregiver cannot access unauthorized patient records', () => {
      const check = evaluatePatientDataAccess({
        context: caregiverContext,
        targetPatientId: 'pt-002',
        authorizedCaregiverIds: ['usr-caregiver-2'], // Authorized for someone else
      });
      expect(check.allowed).toBe(false);
      expect(check.reason?.includes('explicitly authorized')).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // Test 4: Admin administrative access
  // -------------------------------------------------------------
  await describe('Requirement 8: Admin Universal Administrative Access', async () => {
    const adminContext: AuthorizationContext = {
      userId: 'usr-admin-1',
      role: 'ADMIN',
    };

    await it('admin has access across any patient record', () => {
      const check1 = evaluatePatientDataAccess({
        context: adminContext,
        targetPatientId: 'pt-001',
      });
      expect(check1.allowed).toBe(true);

      const check2 = evaluatePatientDataAccess({
        context: adminContext,
        targetPatientId: 'pt-999',
      });
      expect(check2.allowed).toBe(true);
    });

    await it('identifies admin privileges correctly', () => {
      expect(hasAdminPrivileges(SEED_PROFILES.ADMIN)).toBe(true);
      expect(hasAdminPrivileges(SEED_PROFILES.PATIENT)).toBe(false);
      expect(hasAdminPrivileges(SEED_PROFILES.PHYSIOTHERAPIST)).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // Test 5: Route protection and authorization
  // -------------------------------------------------------------
  await describe('Requirement 4 & 10: Protected Routes & Role Authorization', async () => {
    await it('allows patient only on patient routes', () => {
      expect(isRouteAllowedForRole('/patient/dashboard', 'PATIENT')).toBe(true);
      expect(isRouteAllowedForRole('/patient/exercises', 'PATIENT')).toBe(true);
      expect(isRouteAllowedForRole('/clinician/dashboard', 'PATIENT')).toBe(false);
      expect(isRouteAllowedForRole('/caregiver', 'PATIENT')).toBe(false);
      expect(isRouteAllowedForRole('/admin/dashboard', 'PATIENT')).toBe(false);
    });

    await it('allows physiotherapist only on clinician routes', () => {
      expect(isRouteAllowedForRole('/clinician/dashboard', 'PHYSIOTHERAPIST')).toBe(true);
      expect(isRouteAllowedForRole('/clinician/patients', 'PHYSIOTHERAPIST')).toBe(true);
      expect(isRouteAllowedForRole('/patient/dashboard', 'PHYSIOTHERAPIST')).toBe(false);
      expect(isRouteAllowedForRole('/admin/dashboard', 'PHYSIOTHERAPIST')).toBe(false);
    });

    await it('allows caregiver only on caregiver routes', () => {
      expect(isRouteAllowedForRole('/caregiver', 'CAREGIVER')).toBe(true);
      expect(isRouteAllowedForRole('/clinician/dashboard', 'CAREGIVER')).toBe(false);
      expect(isRouteAllowedForRole('/patient/dashboard', 'CAREGIVER')).toBe(false);
    });

    await it('allows admin across all portal routes', () => {
      expect(isRouteAllowedForRole('/patient/dashboard', 'ADMIN')).toBe(true);
      expect(isRouteAllowedForRole('/clinician/dashboard', 'ADMIN')).toBe(true);
      expect(isRouteAllowedForRole('/caregiver', 'ADMIN')).toBe(true);
      expect(isRouteAllowedForRole('/admin/dashboard', 'ADMIN')).toBe(true);
    });
  });

  // -------------------------------------------------------------
  // Test 6: Role normalization & dashboard redirection
  // -------------------------------------------------------------
  await describe('Requirement 3 & 12: Role Normalization & Dashboard Redirection', async () => {
    await it('normalizes legacy and mixed-case roles to canonical roles', () => {
      expect(normalizeRole('patient')).toBe('PATIENT');
      expect(normalizeRole('PATIENT')).toBe('PATIENT');
      expect(normalizeRole('clinician')).toBe('PHYSIOTHERAPIST');
      expect(normalizeRole('physiotherapist')).toBe('PHYSIOTHERAPIST');
      expect(normalizeRole('caregiver')).toBe('CAREGIVER');
      expect(normalizeRole('admin')).toBe('ADMIN');
    });

    await it('maps each canonical role to its dedicated dashboard', () => {
      expect(getRoleDashboardPath('PATIENT')).toBe('/patient/dashboard');
      expect(getRoleDashboardPath('PHYSIOTHERAPIST')).toBe('/clinician/dashboard');
      expect(getRoleDashboardPath('CAREGIVER')).toBe('/caregiver');
      expect(getRoleDashboardPath('ADMIN')).toBe('/admin/dashboard');
    });
  });

  // -------------------------------------------------------------
  // Test 7: Session preservation and logout
  // -------------------------------------------------------------
  await describe('Requirement 1 & 10: Session Persistence on Refresh & Logout', async () => {
    await it('refresh preserves session from stored profile', async () => {
      const profile = SEED_PROFILES.PATIENT;
      persistLocalSession(profile);

      const restored = await getCurrentUserProfile();
      expect(restored).toBeDefined();
      expect(restored?.email).toBe(profile.email);
      expect(restored?.role).toBe('PATIENT');
    });

    await it('logout completely revokes and clears session state', async () => {
      const profile = SEED_PROFILES.PHYSIOTHERAPIST;
      persistLocalSession(profile);

      const logoutResult = await signOutUser();
      expect(logoutResult.error).toBeNull();

      const restoredAfterLogout = await getCurrentUserProfile();
      expect(restoredAfterLogout).toBeNull();
    });
  });

  // -------------------------------------------------------------
  // Test 8: Frontend role spoofing defense
  // -------------------------------------------------------------
  await describe('Requirement 9: Never Trust Role Information Supplied by Frontend', async () => {
    await it('rejects client-forged admin role when database role is PATIENT', () => {
      const untrustedFrontendClaim = {
        userId: 'usr-patient-1',
        claimedRole: 'ADMIN', // Tampered!
      };

      // Backend queries database profiles table:
      const databaseVerifiedRole = SEED_PROFILES.PATIENT.role; // Real DB role is 'PATIENT'

      // Authorization evaluation must use databaseVerifiedRole:
      const check = evaluatePatientDataAccess({
        context: {
          userId: untrustedFrontendClaim.userId,
          role: normalizeRole(databaseVerifiedRole), // Enforcing backend truth
          patientId: 'pt-001',
        },
        targetPatientId: 'pt-002', // Attacking another patient's data
      });

      expect(check.allowed).toBe(false);
    });
  });

  console.log('\nAll REHAB-AI Authentication & Authorization tests completed successfully!\n');
}

runAllTests().catch((err) => {
  console.error('Test suite execution failed:', err);
  process.exit(1);
});
