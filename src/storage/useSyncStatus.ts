import { useEffect, useState } from 'react';
import { onSnapshot, waitForPendingWrites, Firestore, DocumentReference } from 'firebase/firestore';

export type SyncStatus = 'synced' | 'pending' | 'offline';

export default function useSyncStatus<T>(
    ref: DocumentReference<T> | null,
    db: Firestore
): SyncStatus {
    const [status, setStatus] = useState<SyncStatus>('synced');
    useEffect(() => {
        if (!ref) return;
        // Live listener (data AND metadata)
        const unsub = onSnapshot(
            ref,
            { includeMetadataChanges: true },
            (snap) => {
                if (!navigator.onLine || snap.metadata.fromCache) {
                    setStatus('offline');
                } else if (snap.metadata.hasPendingWrites) {
                    setStatus('pending');
                } else {
                    setStatus('synced');
                }
            }
        );
        const flushListener = () => {
            waitForPendingWrites(db).then(() => setStatus((s) =>
                s !== 'offline' ? 'synced' : s
            ));
        };
        window.addEventListener('online', flushListener);
        return () => {
            unsub();
            window.removeEventListener('online', flushListener);
        };
    }, [ref, db]);
    return status;
}
