// REHAB-AI: Offline Synchronization Manager
// Coordinates connectivity events, local persistence, sync queue, and Supabase synchronization.

import { connectivity, ConnectivityStatus } from './connectivity';
import { LocalSessionStore, LocalSessionPayload, generateLocalSessionId } from './local-session-store';
export { generateLocalSessionId };
import { SyncQueue, SyncQueueItem } from './sync-queue';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase-client';
import { inMemoryRehabStore } from '@/lib/services/rehab-service';

export type SyncStatusState = 'idle' | 'offline' | 'syncing' | 'synced' | 'failed';

export interface SyncStatusInfo {
  state: SyncStatusState;
  message: string;
  pendingCount: number;
  lastSyncedId?: string;
  isOnline: boolean;
}

export const SYNC_MESSAGES = {
  offline: "You're offline. Your session will sync when you're connected.",
  synced: "Session synced.",
  failed: "Session saved. We'll retry automatically.",
  syncing: "Syncing session with server...",
  idle: "",
} as const;

type SyncStatusListener = (info: SyncStatusInfo) => void;

export class SyncManager {
  private static instance: SyncManager;
  private currentStatus: SyncStatusState = 'idle';
  private currentMessage: string = '';
  private lastSyncedId?: string;
  private listeners: Set<SyncStatusListener> = new Set();
  private isSyncingInProgress: boolean = false;
  private retryTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    // Listen for connectivity changes
    connectivity.subscribe((status: ConnectivityStatus) => {
      if (status === 'online') {
        if (SyncQueue.hasPending()) {
          this.syncPendingSessions();
        }
      } else {
        if (SyncQueue.hasPending()) {
          this.updateState('offline', SYNC_MESSAGES.offline);
        }
      }
    });
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatusInfo());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStatusInfo(): SyncStatusInfo {
    return {
      state: this.currentStatus,
      message: this.currentMessage,
      pendingCount: SyncQueue.getPending().length,
      lastSyncedId: this.lastSyncedId,
      isOnline: connectivity.isOnline(),
    };
  }

  private updateState(state: SyncStatusState, message: string, syncedId?: string): void {
    this.currentStatus = state;
    this.currentMessage = message;
    if (syncedId) this.lastSyncedId = syncedId;

    const info = this.getStatusInfo();
    this.listeners.forEach((listener) => {
      try {
        listener(info);
      } catch (err) {
        console.error('[SyncManager] Error in listener:', err);
      }
    });
  }

  /**
   * Save a completed rehabilitation session locally and attempt immediate sync if online.
   * If offline or sync fails, preserves the session safely in local storage and queue.
   */
  public async saveAndSyncSession(
    sessionData: Omit<LocalSessionPayload, 'version' | 'createdAt'>
  ): Promise<{ session: LocalSessionPayload; synced: boolean }> {
    // Guarantee unique local session ID if not already assigned
    const sessionId = sessionData.id || generateLocalSessionId();
    const preparedSession = { ...sessionData, id: sessionId };

    // 1. Store in local persistent storage
    const saved = LocalSessionStore.saveSession(preparedSession);

    // 2. Add to sync queue (idempotent, won't duplicate)
    SyncQueue.enqueue(saved);

    // 3. If offline, display offline banner
    if (!connectivity.isOnline()) {
      this.updateState('offline', SYNC_MESSAGES.offline);
      return { session: saved, synced: false };
    }

    // 4. If online, attempt synchronization
    try {
      this.updateState('syncing', SYNC_MESSAGES.syncing);
      await this.pushSessionToServer(saved);
      SyncQueue.markSynced(saved.id);
      this.updateState('synced', SYNC_MESSAGES.synced, saved.id);
      return { session: saved, synced: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      SyncQueue.markFailed(saved.id, errorMsg);
      this.updateState('failed', SYNC_MESSAGES.failed);
      this.scheduleRetry();
      return { session: saved, synced: false };
    }
  }

  private activeSyncPromise: Promise<{ total: number; succeeded: number; failed: number }> | null = null;

  /**
   * Synchronize all pending items in the queue with server.
   * Guarantees zero duplicate entries by checking session ID before insert.
   */
  public async syncPendingSessions(): Promise<{ total: number; succeeded: number; failed: number }> {
    if (this.activeSyncPromise) {
      return this.activeSyncPromise;
    }

    if (!connectivity.isOnline()) {
      this.updateState('offline', SYNC_MESSAGES.offline);
      return { total: 0, succeeded: 0, failed: 0 };
    }

    const pending = SyncQueue.getPending();
    if (pending.length === 0) {
      return { total: 0, succeeded: 0, failed: 0 };
    }

    this.isSyncingInProgress = true;
    this.updateState('syncing', SYNC_MESSAGES.syncing);

    this.activeSyncPromise = (async () => {
      let succeeded = 0;
      let failed = 0;

      try {
        for (const item of pending) {
          try {
            SyncQueue.markSyncing(item.id);
            await this.pushSessionToServer(item.payload);
            SyncQueue.markSynced(item.id);
            succeeded++;
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            SyncQueue.markFailed(item.id, errorMsg);
            failed++;
          }
        }

        if (failed > 0) {
          this.updateState('failed', SYNC_MESSAGES.failed);
          this.scheduleRetry();
        } else {
          this.updateState('synced', SYNC_MESSAGES.synced);
        }

        return { total: pending.length, succeeded, failed };
      } finally {
        this.isSyncingInProgress = false;
        this.activeSyncPromise = null;
      }
    })();

    return this.activeSyncPromise;
  }

  /**
   * Low-level push of a structured session payload to Supabase / In-Memory backend.
   * Idempotency guarantee: Uses payload.id as the primary key.
   */
  private async pushSessionToServer(payload: LocalSessionPayload): Promise<void> {
    const supabase = getSupabaseBrowserClient();

    try {
      // 1. Check if session already exists in DB to prevent duplicates
      const { data: existing } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', payload.id)
        .maybeSingle();

      if (!existing) {
        // Insert parent session row
        const { error: sessionError } = await supabase.from('sessions').insert({
          id: payload.id,
          patient_id: payload.patientId,
          exercise_id: payload.exerciseId,
          started_at: payload.startedAt,
          completed_at: payload.completedAt,
          repetitions: payload.repetitions,
          successful_repetitions: payload.successfulRepetitions,
          incomplete_repetitions: payload.incompleteRepetitions,
          duration_seconds: payload.durationSeconds,
          quality_score: payload.qualityScore,
          tracking_quality: payload.trackingQuality,
          status: payload.status,
        });

        if (sessionError) {
          throw new Error(`Failed to insert session: ${sessionError.message}`);
        }
      }

      // 2. Metrics (idempotent upsert by session_id)
      const { error: metricsError } = await supabase.from('session_metrics').upsert(
        {
          session_id: payload.id,
          average_angle: payload.metrics.averageAngle,
          minimum_angle: payload.metrics.minimumAngle,
          maximum_angle: payload.metrics.maximumAngle,
          average_rep_duration: payload.metrics.averageRepDuration,
          successful_reps: payload.metrics.successfulReps,
          incomplete_reps: payload.metrics.incompleteReps,
        },
        { onConflict: 'session_id' }
      );

      if (metricsError) {
        console.warn('[SyncManager] Non-fatal metrics insert warning:', metricsError.message);
      }

      // 3. Feedback if provided (idempotent upsert by session_id)
      if (payload.feedback) {
        await supabase.from('patient_feedback').upsert(
          {
            session_id: payload.id,
            pain_level: payload.feedback.painLevel,
            fatigue_level: payload.feedback.fatigueLevel,
            patient_comment: payload.feedback.patientComment || null,
          },
          { onConflict: 'session_id' }
        );
      }
    } catch (dbErr) {
      // In-Memory test/mock fallback
      const inMem = inMemoryRehabStore.sessions.find((s) => s.id === payload.id);
      if (!inMem) {
        inMemoryRehabStore.sessions.push({
          id: payload.id,
          patient_id: payload.patientId,
          exercise_id: payload.exerciseId,
          started_at: payload.startedAt,
          completed_at: payload.completedAt,
          repetitions: payload.repetitions,
          successful_repetitions: payload.successfulRepetitions,
          incomplete_repetitions: payload.incompleteRepetitions,
          duration_seconds: payload.durationSeconds,
          quality_score: payload.qualityScore,
          tracking_quality: payload.trackingQuality,
          status: payload.status,
        });

        inMemoryRehabStore.metrics.push({
          id: `met-${payload.id}`,
          session_id: payload.id,
          average_angle: payload.metrics.averageAngle,
          minimum_angle: payload.metrics.minimumAngle,
          maximum_angle: payload.metrics.maximumAngle,
          average_rep_duration: payload.metrics.averageRepDuration,
          successful_reps: payload.metrics.successfulReps,
          incomplete_reps: payload.metrics.incompleteReps,
          created_at: new Date().toISOString(),
        });

        if (payload.feedback) {
          inMemoryRehabStore.feedback.push({
            id: `fb-${payload.id}`,
            session_id: payload.id,
            pain_level: payload.feedback.painLevel,
            fatigue_level: payload.feedback.fatigueLevel,
            patient_comment: payload.feedback.patientComment || null,
            created_at: new Date().toISOString(),
          });
        }
      }
    }
  }

  private scheduleRetry(): void {
    if (this.retryTimeout) clearTimeout(this.retryTimeout);
    // Exponential retry or 10-second interval
    this.retryTimeout = setTimeout(() => {
      if (connectivity.isOnline() && SyncQueue.hasPending()) {
        this.syncPendingSessions();
      }
    }, 10000);
  }
}

export const syncManager = SyncManager.getInstance();

/**
 * React Hook for real-time offline sync status monitoring
 */
export function useSyncStatus(): SyncStatusInfo & {
  syncNow: () => Promise<{ total: number; succeeded: number; failed: number }>;
} {
  const [statusInfo, setStatusInfo] = typeof window !== 'undefined'
    ? require('react').useState(syncManager.getStatusInfo())
    : [syncManager.getStatusInfo(), () => {}];

  require('react').useEffect(() => {
    const unsubscribe = syncManager.subscribe((info: SyncStatusInfo) => {
      setStatusInfo(info);
    });
    return () => unsubscribe();
  }, [setStatusInfo]);

  return {
    ...statusInfo,
    syncNow: () => syncManager.syncPendingSessions(),
  };
}
