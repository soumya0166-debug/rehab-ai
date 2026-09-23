// REHAB-AI: Authentication & Session Management
import { UserProfile, UserRole } from '@/types';

export const MOCK_USERS: UserProfile[] = [
  {
    id: 'usr-patient-1',
    email: 'sarah.connor@rehab-ai.health',
    fullName: 'Sarah Connor',
    role: 'patient',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-08-20T00:00:00Z',
  },
  {
    id: 'usr-clinician-1',
    email: 'dr.chen@sportsrehab.clinic',
    fullName: 'Dr. Michael Chen, DPT',
    role: 'clinician',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=160&q=80',
    createdAt: '2026-08-01T00:00:00Z',
  },
];

const SESSION_KEY = 'rehab_ai_current_user_v1';

export function getCurrentUser(): UserProfile {
  if (typeof window === 'undefined') return MOCK_USERS[0];
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading session:', err);
  }
  return MOCK_USERS[0];
}

export function setCurrentUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Error writing session:', err);
  }
}

export function hasRole(role: UserRole): boolean {
  const current = getCurrentUser();
  return current.role === role;
}
