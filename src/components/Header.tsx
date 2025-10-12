import {SyncStatus} from "../hooks/useSyncStatus";
import {User} from "firebase/auth";
import SyncBadge from "./SyncBadge";
import {FaBullseye, FaPlus, FaSignOutAlt} from "react-icons/fa";
import React from "react";
import useIsMobile from "../hooks/useIsMobile";

interface WeightTrackerHeaderProps {
  user: User;
  syncStatus: SyncStatus;
  onShowGoals: () => void;
  onAddTraining: () => void;
  onSignOut: () => void;
}

const baseBtn =
  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2";
const emeraldBtn = `${baseBtn} bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500`;
const indigoBtn = `${baseBtn} bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500`;
const redBtn = `${baseBtn} bg-red-600 hover:bg-red-700 focus:ring-red-500`;

const Header: React.FC<WeightTrackerHeaderProps> = ({
  user,
  syncStatus,
  onShowGoals,
  onAddTraining,
  onSignOut,
}) => {
  const isMobile = useIsMobile();
  return (
    <header className="flex justify-between items-center mb-6">
      {isMobile ? (
        <div className="flex items-center gap-4">
          <button onClick={onAddTraining} className={emeraldBtn}>
            <FaPlus />
          </button>
          <h2 className="text-xl font-semibold">Fitniss tracker</h2>
          <SyncBadge state={syncStatus} />
          <button onClick={onShowGoals} className={indigoBtn}>
            <FaBullseye />
          </button>
          <button onClick={onSignOut} className={redBtn}>
            <FaSignOutAlt />
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-semibold">Weight Progress</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user.displayName ?? user.email}</span>
            <SyncBadge state={syncStatus} />
            <button onClick={onAddTraining} className={emeraldBtn}>
              <FaPlus />
              New Training
            </button>
            <button onClick={onShowGoals} className={indigoBtn}>
              <FaBullseye />
              Goals
            </button>
            <button onClick={onSignOut} className={redBtn}>
              <FaSignOutAlt />
              Sign Out
            </button>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
