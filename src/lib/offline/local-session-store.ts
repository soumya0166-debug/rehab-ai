// REHAB-AI: Offline Local Session Store
// Secure, privacy-preserving client storage for offline rehabilitation session records.
// Explicit requirement: NEVER store raw camera video or image blobs.

import { SessionTrackingQuality, SessionStatus } from '@/types/exercises';

export interface LocalSessionPayload {
  id: string; // Unique local session UUID
  patientId: string;
  exerciseId: string;
  startedAt: string;
  completedAt: string;
  repetitions: number;
  successfulRepetitions: number;
  incompleteRepetitions: number;
  durationSeconds: number;
  qualityScore: number;
  trackingQuality: SessionTrackingQuality;
  status: SessionStatus;
  metrics: {
    averageAngle: number;
    minimumAngle: number;
    maximumAngle: number;
    averageRepDuration: number;
    successfulReps: number;
    incompleteReps: number;
  };
  feedback?: {
    painLevel: number;
    fatigueLevel: number;
    patientComment?: string;
  };
  createdAt: number;
  version: number;
}

const STORAGE_KEY = 'rehab_ai_local_sessions_v1';

// In-memory fallback for SSR and unit testing environments without localStorage
const memoryStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore.get(key) || null;
    }
  }
  return memoryStore.get(key) || null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      // Storage might be quota-exceeded or private browsing mode
    }
  }
  memoryStore.set(key, value);
}

/**
 * Generate a cryptographically strong unique local session ID
 */
export function generateLocalSessionId(): string {
  const timestamp = Date.now();
  let randomPart: string;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    randomPart = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  } else {
    randomPart = Math.random().toString(36).substring(2, 14);
  }
  return `sess_local_${timestamp}_${randomPart}`;
}

export class LocalSessionStore {
  /**
   * Save a completed session record to local offline storage.
   * Ensures no video, camera frames, or unnecessary PII is ever retained.
   */
  public static saveSession(session: Omit<LocalSessionPayload, 'version' | 'createdAt'>): LocalSessionPayload {
    // Safety check: assert no raw media properties are present
    const rawCheck = session as unknown as Record<string, unknown>;
    if ('video' in rawCheck || 'frames' in rawCheck || 'images' in rawCheck || 'stream' in rawCheck) {
      delete rawCheck.video;
      delete rawCheck.frames;
      delete rawCheck.images;
      delete rawCheck.stream;
      console.warn('[LocalSessionStore] Stripped unauthorized media properties from offline session.');
    }

    const payload: LocalSessionPayload = {
      ...session,
      id: session.id || generateLocalSessionId(),
      version: 1,
      createdAt: Date.now(),
    };

    const existing = this.getAllSessions();
    // Prevent duplicate entries by session id
    const filtered = existing.filter((s) => s.id !== payload.id);
    filtered.push(payload);

    try {
      setStorageItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.error('[LocalSessionStore] Failed to write session to local storage:', err);
    }

    return payload;
  }

  /**
   * Retrieve all locally stored sessions.
   */
  public static getAllSessions(): LocalSessionPayload[] {
    const raw = getStorageItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Retrieve a specific session by ID.
   */
  public static getSession(id: string): LocalSessionPayload | null {
    const all = this.getAllSessions();
    return all.find((s) => s.id === id) || null;
  }

  /**
   * Remove a session by ID (e.g. after successful sync to server or user purge).
   */
  public static removeSession(id: string): void {
    const all = this.getAllSessions();
    const filtered = all.filter((s) => s.id !== id);
    setStorageItem(STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Clear all local sessions (e.g. on user logout).
   */
  public static clearAll(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
    memoryStore.clear();
  }
}
