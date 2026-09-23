// REHAB-AI: Offline-First Synchronization & Resiliency Test Suite
// Verifies:
// 1. Session execution and local storage while offline
// 2. Elimination of raw video/blobs from offline storage
// 3. Unique ID generation
// 4. Automatic synchronization upon reconnection
// 5. Strict idempotency (no duplicate database records)
// 6. Retry behavior on sync failure

import { connectivity } from '../src/lib/offline/connectivity';
import { LocalSessionStore, generateLocalSessionId } from '../src/lib/offline/local-session-store';
import { SyncQueue } from '../src/lib/offline/sync-queue';
import { syncManager, SYNC_MESSAGES } from '../src/lib/offline/sync-manager';
import { inMemoryRehabStore } from '../src/lib/services/rehab-service';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runOfflineSyncTests() {
  console.log('--- RUNNING OFFLINE-FIRST SYNCHRONIZATION TESTS ---');

  // Reset environment
  LocalSessionStore.clearAll();
  SyncQueue.clear();
  inMemoryRehabStore.reset();
  connectivity.setSimulatedOffline(false);

  // Test 1: Unique Session ID generation
  console.log('Test 1: Unique local session ID generation');
  const id1 = generateLocalSessionId();
  const id2 = generateLocalSessionId();
  assert(/^sess_local_\d+_[a-z0-9]+$/.test(id1), 'Session ID follows sess_local_<time>_<rand> format');
  assert(id1 !== id2, 'Session IDs are strictly unique');

  // Test 2: Elimination of raw camera video / blobs
  console.log('Test 2: Raw camera video and image elimination from local storage');
  const maliciousPayload: any = {
    id: generateLocalSessionId(),
    patientId: 'patient-test-1',
    exerciseId: 'elbow-flexion',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    repetitions: 10,
    successfulRepetitions: 8,
    incompleteRepetitions: 2,
    durationSeconds: 45,
    qualityScore: 85,
    trackingQuality: 'high',
    status: 'completed',
    metrics: {
      averageAngle: 95,
      minimumAngle: 30,
      maximumAngle: 140,
      averageRepDuration: 3.5,
      successfulReps: 8,
      incompleteReps: 2,
    },
    // Prohibited media properties
    video: 'blob:http://localhost/raw-video-stream',
    frames: [new Uint8Array([1, 2, 3])],
    stream: {},
  };

  const saved = LocalSessionStore.saveSession(maliciousPayload);
  assert((saved as any).video === undefined, 'Raw video property stripped from saved session');
  assert((saved as any).frames === undefined, 'Raw frames property stripped from saved session');
  assert((saved as any).stream === undefined, 'Stream property stripped from saved session');

  const retrieved = LocalSessionStore.getSession(saved.id);
  assert(retrieved !== null, 'Session successfully retrieved from local store');
  assert((retrieved as any).video === undefined, 'Retrieved session contains no raw video');

  // Test 3: Session Completion while Offline
  console.log('Test 3: Start offline -> complete session -> verify offline queue & UI banner');
  connectivity.setSimulatedOffline(true);
  assert(connectivity.isOnline() === false, 'Connectivity correctly simulated as offline');

  const offlineSessionId = generateLocalSessionId();
  const offlineData = {
    id: offlineSessionId,
    patientId: 'patient-offline-01',
    exerciseId: 'shoulder-raise',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    repetitions: 8,
    successfulRepetitions: 7,
    incompleteRepetitions: 1,
    durationSeconds: 40,
    qualityScore: 88,
    trackingQuality: 'high' as const,
    status: 'completed' as const,
    metrics: {
      averageAngle: 110,
      minimumAngle: 25,
      maximumAngle: 150,
      averageRepDuration: 4.2,
      successfulReps: 7,
      incompleteReps: 1,
    },
    feedback: {
      painLevel: 1,
      fatigueLevel: 3,
      patientComment: 'Smooth session offline',
    },
  };

  const saveResult = await syncManager.saveAndSyncSession(offlineData);
  assert(saveResult.synced === false, 'Offline session not marked as synced to server');
  assert(LocalSessionStore.getSession(offlineSessionId) !== null, 'Session persisted in LocalSessionStore');

  const queueItem = SyncQueue.getItem(offlineSessionId);
  assert(queueItem !== null, 'Session item added to SyncQueue');
  assert(queueItem?.status === 'pending', 'Queue item status is pending');

  const statusInfo = syncManager.getStatusInfo();
  assert(statusInfo.state === 'offline', 'SyncManager state is offline');
  assert(
    statusInfo.message === "You're offline. Your session will sync when you're connected.",
    'Exact required offline banner text displayed'
  );

  // Server store should NOT have received the record yet
  const serverSession = inMemoryRehabStore.sessions.find((s) => s.id === offlineSessionId);
  assert(serverSession === undefined, 'Server has not received record while offline');

  // Test 4: Reconnect -> Automatic Sync -> Zero Duplicate Records
  console.log('Test 4: Reconnect network -> verify sync -> verify zero duplicate records');
  connectivity.setSimulatedOffline(false);
  assert(connectivity.isOnline() === true, 'Connectivity restored to online');

  const syncResult = await syncManager.syncPendingSessions();
  assert(syncResult.succeeded === 1, 'Pending offline session successfully synchronized');
  assert(syncResult.failed === 0, 'Zero sync failures');

  const syncedStatus = syncManager.getStatusInfo();
  assert(syncedStatus.state === 'synced', 'SyncManager state updated to synced');
  assert(syncedStatus.message === 'Session synced.', 'Exact required synced banner text displayed');

  // Verify server database received the session record
  const matchingServerSessions = inMemoryRehabStore.sessions.filter((s) => s.id === offlineSessionId);
  assert(matchingServerSessions.length === 1, 'Exactly one session record exists in server database');
  assert(matchingServerSessions[0].repetitions === 8, 'Session repetitions accurately synchronized');

  // Strict Idempotency Check: call sync again or re-enqueue
  console.log('Test 5: Idempotency guarantee (no duplicate record on repeated sync)');
  const secondSync = await syncManager.syncPendingSessions();
  assert(secondSync.total === 0, 'No re-sync performed for already synced items');

  const verifyNoDuplicates = inMemoryRehabStore.sessions.filter((s) => s.id === offlineSessionId);
  assert(verifyNoDuplicates.length === 1, 'No duplicate records created in server database');

  // Test 6: Sync failure and automatic retry banner
  console.log('Test 6: Sync failure and automatic retry banner verification');
  const errorSessionId = 'error-sim-session';
  SyncQueue.enqueue({
    id: errorSessionId,
    patientId: 'patient-test',
    exerciseId: 'elbow-flexion',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    repetitions: 5,
    successfulRepetitions: 5,
    incompleteRepetitions: 0,
    durationSeconds: 20,
    qualityScore: 90,
    trackingQuality: 'high',
    status: 'completed',
    metrics: {
      averageAngle: 90,
      minimumAngle: 40,
      maximumAngle: 120,
      averageRepDuration: 3.0,
      successfulReps: 5,
      incompleteReps: 0,
    },
    createdAt: Date.now(),
    version: 1,
  });

  SyncQueue.markFailed(errorSessionId, 'Network Timeout 504 Gateway Error');
  const failedItem = SyncQueue.getItem(errorSessionId);
  assert(failedItem?.status === 'failed', 'Queue item marked as failed');
  assert(failedItem?.retryCount === 1, 'Retry count incremented to 1');
  assert(
    SYNC_MESSAGES.failed === "Session saved. We'll retry automatically.",
    'Exact required retry banner text configured'
  );

  console.log('All offline synchronization tests PASSED successfully!\n');
}

runOfflineSyncTests().catch((err) => {
  console.error('Offline sync tests failed:', err);
  process.exit(1);
});
