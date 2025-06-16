import {useCallback, useEffect, useMemo, useState} from 'react';

export type SyncStatus = 'synced' | 'pending' | 'offline';

export default function useSyncStatus(): {
    registerPendingWrites: (key: string, hasPending: boolean) => void;
    syncStatus: SyncStatus;
    clearPendingWrites: () => void
    } {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingWrites, setPendingWrites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  console.log(pendingWrites)

  const registerPendingWrites = useCallback((key: string, hasPending: boolean) => {
    setPendingWrites(prev => ({ ...prev, [key]: hasPending }));
  }, []);
  const clearPendingWrites = useCallback(() => {
    setPendingWrites({});
  }, []);

  const syncStatus: SyncStatus = useMemo(() => {
    if (!isOnline) return 'offline';
    if (Object.values(pendingWrites).some(status => status)) return 'pending';
    return 'synced';
  }, [isOnline, pendingWrites]);

  return { syncStatus, registerPendingWrites, clearPendingWrites };
}
