import {SyncStatus} from "../hooks/useSyncStatus";
import {User} from "firebase/auth";
import SyncBadge from "./SyncBadge";
import {FaBullseye, FaSignOutAlt} from "react-icons/fa";
import React from "react";

interface WeightTrackerHeaderProps {
    user: User;
    syncStatus: SyncStatus;
    onShowGoals: () => void;
    onSignOut: () => void;
}

const Header: React.FC<WeightTrackerHeaderProps> = ({
  user,
  syncStatus,
  onShowGoals,
  onSignOut,
}) => {
  return (
    <header className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Weight Progress</h2>
      <div className="flex items-center gap-4">
        <span className="text-sm">
            Welcome, {user.displayName ?? user.email}
        </span>
        <SyncBadge state={syncStatus} />
        <button
          onClick={onShowGoals}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <FaBullseye />
          Goals
        </button>
        <button
          onClick={onSignOut}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2"
        >
          <FaSignOutAlt />
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
