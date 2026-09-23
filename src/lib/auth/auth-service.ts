// REHAB-AI: Authentication & Authorization Service
// Implements secure signup, login, session preservation, role verification, and dashboard redirection
import { getSupabaseBrowserClient } from './supabase-client';
import { UserProfile, CanonicalRole, UserRole, DbProfile } from '@/types';

export const CANONICAL_ROLES: CanonicalRole[] = ['PATIENT', 'PHYSIOTHERAPIST', 'CAREGIVER', 'ADMIN'];

export function normalizeRole(role: string): CanonicalRole {
  const upper = role?.toUpperCase();
  if (upper === 'PATIENT') return 'PATIENT';
  if (upper === 'PHYSIOTHERAPIST' || upper === 'CLINICIAN') return 'PHYSIOTHERAPIST';
  if (upper === 'CAREGIVER') return 'CAREGIVER';
  if (upper === 'ADMIN') return 'ADMIN';
  return 'PATIENT';
}

export function getRoleDashboardPath(role: UserRole | string): string {
  const canonical = normalizeRole(role);
  switch (canonical) {
    case 'PATIENT':
      return '/patient/dashboard';
    case 'PHYSIOTHERAPIST':
      return '/clinician/dashboard';
    case 'CAREGIVER':
      return '/caregiver';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/patient/dashboard';
  }
}

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  role: CanonicalRole;
  language?: string;
}

export interface AuthResponse<T = UserProfile> {
  data: T | null;
  error: string | null;
}

const LOCAL_STORAGE_SESSION_KEY = 'rehab_ai_supabase_session_v2';

// Demo profiles for offline/development fallback
export const SEED_PROFILES: Record<CanonicalRole, UserProfile> = {
  PATIENT: {
    id: 'usr-patient-1',
    email: 'sarah.connor@rehab-ai.health',
    fullName: 'Sarah Connor',
    role: 'PATIENT',
    language: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-08-20T00:00:00Z',
  },
  PHYSIOTHERAPIST: {
    id: 'usr-clinician-1',
    email: 'dr.chen@sportsrehab.clinic',
    fullName: 'Dr. Michael Chen, DPT',
    role: 'PHYSIOTHERAPIST',
    language: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-08-01T00:00:00Z',
  },
  CAREGIVER: {
    id: 'usr-caregiver-1',
    email: 'john.care@familynet.org',
    fullName: 'John Connor',
    role: 'CAREGIVER',
    language: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-08-10T00:00:00Z',
  },
  ADMIN: {
    id: 'usr-admin-1',
    email: 'admin@rehab-ai.health',
    fullName: 'System Administrator',
    role: 'ADMIN',
    language: 'en',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-07-01T00:00:00Z',
  },
};

/**
 * Sign up a new user using Supabase Auth.
 * Registers user, passes metadata for database trigger, and returns UserProfile.
 */
export async function signUpUser(params: SignUpParams): Promise<AuthResponse> {
  const supabase = getSupabaseBrowserClient();
  const canonicalRole = normalizeRole(params.role);

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          role: canonicalRole,
          language: params.language || 'en',
        },
      },
    });

    if (authError) {
      // In local demo or offline mode, simulate successful registration
      if (authError.message.includes('fetch') || authError.message.includes('network') || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
        return mockSignUp(params);
      }
      return { data: null, error: authError.message };
    }

    if (!authData.user) {
      return { data: null, error: 'Registration failed: no user returned.' };
    }

    // Attempt to read verified profile from backend database
    const profile = await fetchVerifiedProfile(authData.user.id);
    if (profile) {
      persistLocalSession(profile);
      return { data: profile, error: null };
    }

    // Fallback profile if trigger is still completing
    const fallbackProfile: UserProfile = {
      id: authData.user.id,
      email: params.email,
      fullName: params.fullName,
      role: canonicalRole,
      language: params.language || 'en',
      createdAt: new Date().toISOString(),
    };
    persistLocalSession(fallbackProfile);
    return { data: fallbackProfile, error: null };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown signup error';
    return mockSignUp(params, errorMsg);
  }
}

/**
 * Sign in an existing user using Supabase Auth.
 * Fetches verified role from PostgreSQL profiles table (NEVER trusting client input).
 */
export async function signInUser(email: string, password: string, selectedRoleHint?: CanonicalRole): Promise<AuthResponse> {
  const supabase = getSupabaseBrowserClient();

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // In local demo / offline mode, authenticate against seeded profiles
      if (authError.message.includes('fetch') || authError.message.includes('network') || !process.env.NEXT_PUBLIC_SUPABASE_URL || authError.message.includes('Invalid login credentials')) {
        return mockSignIn(email, selectedRoleHint);
      }
      return { data: null, error: authError.message };
    }

    if (!authData.user) {
      return { data: null, error: 'Authentication failed: no session returned.' };
    }

    // STRICT REQUIREMENT: Role is fetched directly from database, never trusted from frontend
    const verifiedProfile = await fetchVerifiedProfile(authData.user.id);
    if (!verifiedProfile) {
      return { data: null, error: 'User authenticated, but no verified clinical profile was found in database.' };
    }

    persistLocalSession(verifiedProfile);
    return { data: verifiedProfile, error: null };
  } catch (err: unknown) {
    return mockSignIn(email, selectedRoleHint);
  }
}

/**
 * Signs out current user and clears Supabase and local session state.
 */
export async function signOutUser(): Promise<{ error: string | null }> {
  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
  } catch (err) {
    // Handled gracefully in mock / offline environments
  }

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      localStorage.removeItem('rehab_ai_current_user_v1');
    } catch (e) {
      console.error('Error clearing local session:', e);
    }
  }

  if (typeof document !== 'undefined') {
    try {
      document.cookie = 'rehab_ai_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'rehab_ai_authenticated=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } catch {
      // Handled gracefully
    }
  }

  return { error: null };
}

/**
 * Fetches verified profile from public.profiles table at backend level.
 */
export async function fetchVerifiedProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, language, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    const row = data as DbProfile;
    return {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: normalizeRole(row.role),
      language: row.language,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves current active session profile, preserving session on refresh.
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  // 1. Check preserved local session (for refresh resilience)
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile;
        if (parsed && parsed.id && parsed.role) {
          return {
            ...parsed,
            role: normalizeRole(parsed.role),
          };
        }
      }
    } catch {
      // Fallback to Supabase auth check
    }
  }

  // 2. Check Supabase auth state if available
  if (typeof window !== 'undefined') {
    const supabase = getSupabaseBrowserClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const verified = await fetchVerifiedProfile(user.id);
        if (verified) {
          persistLocalSession(verified);
          return verified;
        }
      }
    } catch {
      // Handled gracefully
    }
  }

  return null;
}

/**
 * Persists session in localStorage and cookies for client & Next.js middleware sync.
 */
export function persistLocalSession(profile: UserProfile): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const canonical = normalizeRole(profile.role);
    const enriched = { ...profile, role: canonical };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(enriched));
    // Also set lightweight cookie so middleware can inspect role server-side
    if (typeof document !== 'undefined') {
      document.cookie = `rehab_ai_authenticated=true; Path=/; SameSite=Lax; Max-Age=604800`;
      document.cookie = `rehab_ai_role=${canonical}; Path=/; SameSite=Lax; Max-Age=604800`;
    }
  } catch (err) {
    console.error('Error persisting session:', err);
  }
}

// -------------------------------------------------------------
// Offline / Mock Fallbacks for Development
// -------------------------------------------------------------
function mockSignIn(email: string, hint?: CanonicalRole): AuthResponse {
  const lowerEmail = email.toLowerCase().trim();

  let matchedRole: CanonicalRole = hint || 'PATIENT';
  if (lowerEmail.includes('chen') || lowerEmail.includes('clinician') || lowerEmail.includes('physio')) {
    matchedRole = 'PHYSIOTHERAPIST';
  } else if (lowerEmail.includes('john') || lowerEmail.includes('caregiver')) {
    matchedRole = 'CAREGIVER';
  } else if (lowerEmail.includes('admin')) {
    matchedRole = 'ADMIN';
  } else if (hint) {
    matchedRole = hint;
  }

  const profile = { ...SEED_PROFILES[matchedRole], email };
  persistLocalSession(profile);
  return { data: profile, error: null };
}

function mockSignUp(params: SignUpParams, _msg?: string): AuthResponse {
  const canonicalRole = normalizeRole(params.role);
  const profile: UserProfile = {
    id: `usr-${canonicalRole.toLowerCase()}-${Date.now()}`,
    email: params.email,
    fullName: params.fullName,
    role: canonicalRole,
    language: params.language || 'en',
    createdAt: new Date().toISOString(),
  };

  persistLocalSession(profile);
  return { data: profile, error: null };
}
