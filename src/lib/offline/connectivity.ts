// REHAB-AI: Network Connectivity Monitor & Event Dispatcher
// Manages real-time online/offline network detection and listeners

export type ConnectivityStatus = 'online' | 'offline';

type ConnectivityListener = (status: ConnectivityStatus) => void;

class ConnectivityManager {
  private static instance: ConnectivityManager;
  private listeners: Set<ConnectivityListener> = new Set();
  private simulatedOffline: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  public static getInstance(): ConnectivityManager {
    if (!ConnectivityManager.instance) {
      ConnectivityManager.instance = new ConnectivityManager();
    }
    return ConnectivityManager.instance;
  }

  public isOnline(): boolean {
    if (this.simulatedOffline) return false;
    if (typeof window === 'undefined') return true;
    if (typeof navigator === 'undefined' || typeof navigator.onLine !== 'boolean') return true;
    return navigator.onLine;
  }

  public getStatus(): ConnectivityStatus {
    return this.isOnline() ? 'online' : 'offline';
  }

  public subscribe(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    // Notify immediately with current status
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * For testing & offline simulation
   */
  public setSimulatedOffline(isOffline: boolean): void {
    this.simulatedOffline = isOffline;
    this.notify();
  }

  private handleOnline = (): void => {
    if (!this.simulatedOffline) {
      this.notify();
    }
  };

  private handleOffline = (): void => {
    this.notify();
  };

  private notify(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.error('[ConnectivityManager] Error in listener:', err);
      }
    });
  }
}

export const connectivity = ConnectivityManager.getInstance();

/**
 * React Hook for consuming network connectivity status
 */
export function useNetworkStatus(): {
  isOnline: boolean;
  status: ConnectivityStatus;
  setSimulatedOffline: (offline: boolean) => void;
} {
  // Safe default for SSR
  const [online, setOnline] = typeof window !== 'undefined'
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      require('react').useState(connectivity.isOnline())
    : [true, () => {}];

  // eslint-disable-next-line react-hooks/rules-of-hooks
  require('react').useEffect(() => {
    const unsubscribe = connectivity.subscribe((status: ConnectivityStatus) => {
      setOnline(status === 'online');
    });
    return () => unsubscribe();
  }, [setOnline]);

  return {
    isOnline: online,
    status: online ? 'online' : 'offline',
    setSimulatedOffline: (off: boolean) => connectivity.setSimulatedOffline(off),
  };
}
