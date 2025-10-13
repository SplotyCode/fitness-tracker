import React from "react";
import {FaDumbbell, FaHeartbeat} from "react-icons/fa";

interface Props {
  onClose: () => void;
  onSelectStrength: () => void;
  onSelectCardio: () => void;
}

const AddTrainingMenuModal: React.FC<Props> = ({onClose, onSelectStrength, onSelectCardio}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-xl border border-white/10 text-white">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add training</h3>
          <button onClick={onClose} className="rounded-full p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-white">✕</button>
        </header>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { onClose(); onSelectStrength(); }}
            className="flex items-center gap-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-3"
          >
            <FaDumbbell />
            <span className="font-medium">Strength training</span>
          </button>
          <button
            onClick={() => { onClose(); onSelectCardio(); }}
            className="flex items-center gap-3 rounded-xl bg-pink-600 hover:bg-pink-700 px-4 py-3"
          >
            <FaHeartbeat />
            <span className="font-medium">Cardio training</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTrainingMenuModal;
