import {SyncStatus} from "../storage/useSyncStatus";

const SyncBadge = ({ state }: { state: SyncStatus }) => {
    if (state === 'synced') {
        return null;
    }
    const mapping = {
        pending: ['⟳',  'Saving…'],
        offline: ['⚠️', 'Offline – changes queued'],
    } as const;
    const [icon, tooltip] = mapping[state];
    return (
        <span title={tooltip} className="ml-2 text-sm">
      {icon}
    </span>
    );
}

export default SyncBadge;