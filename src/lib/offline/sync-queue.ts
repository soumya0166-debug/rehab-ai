// REHAB-AI: Offline Synchronization Queue
// Manages pending offline session payloads, idempotency keys, and retry attempts.

import { LocalSessionPayload } from './local-session-store';

export type QueueItemStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string; // matches LocalSessionPayload.id for 1:1 idempotency
  payload: LocalSessionPayload;
  status: QueueItemStatus;
  retryCount: number;
  lastAttemptAt?: number;
  lastError?: string;
  enqueuedAt: number;
}

const QUEUE_STORAGE_KEY = 'rehab_ai_sync_queue_v1';
const memoryQueue = new Map<string, string>();

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryQueue.get(key) || null;
    }
  }
  return memoryQueue.get(key) || null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {}
  }
  memoryQueue.set(key, value);
}

export class SyncQueue {
  /**
   * Enqueue a session payload for synchronization.
   * Ensures idempotency: if an item with the same ID already exists, it is updated
   * without duplicating.
   */
  public static enqueue(payload: LocalSessionPayload): SyncQueueItem {
    const items = this.getItems();
    const existingIndex = items.findIndex((item) => item.id === payload.id);

    const now = Date.now();
    let queueItem: SyncQueueItem;

    if (existingIndex >= 0) {
      // If already synced, do not re-enqueue
      if (items[existingIndex].status === 'synced') {
        return items[existingIndex];
      }
      queueItem = {
        ...items[existingIndex],
        payload,
        status: 'pending',
      };
      items[existingIndex] = queueItem;
    } else {
      queueItem = {
        id: payload.id,
        payload,
        status: 'pending',
        retryCount: 0,
        enqueuedAt: now,
      };
      items.push(queueItem);
    }

    this.saveItems(items);
    return queueItem;
  }

  public static getItems(): SyncQueueItem[] {
    const raw = getStorageItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public static getPending(): SyncQueueItem[] {
    return this.getItems().filter(
      (item) => item.status === 'pending' || item.status === 'failed'
    );
  }

  public static hasPending(): boolean {
    return this.getPending().length > 0;
  }

  public static getItem(id: string): SyncQueueItem | null {
    return this.getItems().find((item) => item.id === id) || null;
  }

  public static markSyncing(id: string): void {
    const items = this.getItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      items[idx].status = 'syncing';
      items[idx].lastAttemptAt = Date.now();
      this.saveItems(items);
    }
  }

  public static markSynced(id: string): void {
    const items = this.getItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      items[idx].status = 'synced';
      items[idx].lastAttemptAt = Date.now();
      this.saveItems(items);
    }
  }

  public static markFailed(id: string, errorMessage: string): void {
    const items = this.getItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      items[idx].status = 'failed';
      items[idx].retryCount += 1;
      items[idx].lastAttemptAt = Date.now();
      items[idx].lastError = errorMessage;
      this.saveItems(items);
    }
  }

  public static remove(id: string): void {
    const items = this.getItems().filter((i) => i.id !== id);
    this.saveItems(items);
  }

  public static clear(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(QUEUE_STORAGE_KEY);
      } catch {}
    }
    memoryQueue.clear();
  }

  private static saveItems(items: SyncQueueItem[]): void {
    try {
      setStorageItem(QUEUE_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('[SyncQueue] Failed to write queue to storage:', err);
    }
  }
}
