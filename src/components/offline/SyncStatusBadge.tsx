'use client';

import React from 'react';
import { WifiOff, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useSyncStatus } from '@/lib/offline/sync-manager';

export function SyncStatusBadge() {
  const { state, message, pendingCount, isOnline, syncNow } = useSyncStatus();

  if (state === 'idle' && isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Offline and Synchronization Status"
      className="transition-all duration-300 ease-in-out"
    >
      {!isOnline || state === 'offline' ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm"
        >
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>
            {message || "You're offline. Your session will sync when you're connected."}
          </span>
          {pendingCount > 0 && (
            <span className="ml-1 bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded text-xs">
              {pendingCount} saved locally
            </span>
          )}
        </div>
      ) : state === 'syncing' ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm animate-pulse"
        >
          <RefreshCw className="w-4 h-4 text-blue-400 shrink-0 animate-spin" aria-hidden="true" />
          <span>Syncing session with server...</span>
        </div>
      ) : state === 'synced' ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          <span>{message || "Session synced."}</span>
        </div>
      ) : state === 'failed' ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" aria-hidden="true" />
          <span>{message || "Session saved. We'll retry automatically."}</span>
          <button
            onClick={() => syncNow()}
            className="ml-1 underline hover:text-white text-xs"
            title="Retry synchronization now"
          >
            Retry
          </button>
        </div>
      ) : null}
    </aside>
  );
}
