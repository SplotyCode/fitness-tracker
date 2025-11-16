import {Timestamp} from "firebase/firestore";
import {JSX, useMemo, useState} from "react";
import {Training} from "../../domain/training";
import {deleteSession} from "../../usecases/training/training_session";
import {newTrainingId, saveTraining} from "../../repositories/trainings";
import {FaTrashAlt, FaTimes, FaSave} from "react-icons/fa";

interface Props {
  userId: string;
  training: { id: string; data: Training } | null;
  onClose: () => void;
}

const minutesFromMs = (ms: number): number => Math.max(0, Math.round(ms / 60000));

const CardioModal = ({userId, training, onClose}: Props): JSX.Element => {
  const {id: trainingId, data} = training ?? {id: null, data: null};
  const isNew = trainingId === null;

  const initialDurationMin = useMemo(() => {
    if (data?.endedAt) {
      return minutesFromMs(data.endedAt.toMillis() - data.startedAt.toMillis());
    }
    return 0;
  }, [data?.startedAt, data?.endedAt]);

  const [kcal, setKcal] = useState(data?.kcalBurnt ?? 250);
  const [durationMin, setDurationMin] = useState(initialDurationMin || 40);
  const [note, setNote] = useState<string>(data?.note ?? "");

  const handleSave = async (): Promise<void> => {
    const endAt = data?.endedAt ?? Timestamp.now();
    const startMs = endAt.toMillis() - durationMin * 60000;
    const payload: Partial<Training> = {
      day: data?.day ?? endAt.toDate().toISOString().split("T")[0],
      type: "cardio",
      kcalBurnt: kcal,
      startedAt: Timestamp.fromMillis(startMs),
      endedAt: endAt,
      note: note?.trim() ? note.trim() : null,
    } as Partial<Training>;

    if (isNew) {
      const id = newTrainingId(userId);
      await saveTraining(userId, id, payload);
    } else {
      await saveTraining(userId, trainingId, payload);
    }
    onClose();
  };

  const handleDelete = async (trainingId: string): Promise<void> => {
    await deleteSession({userId, trainingId});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-neutral-800 text-white border border-white/10">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Cardio</h3>
          <button className="px-3 py-2 rounded-xl bg-neutral-700 hover:bg-neutral-600 flex items-center justify-center" onClick={onClose} aria-label="Close" title="Close">
            <FaTimes />
          </button>
        </header>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Duration (minutes)</label>
            <input
              type="number"
              min={1}
              className="w-full bg-neutral-700 rounded-xl p-3"
              placeholder="e.g. 30"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-1">Calories burnt (kcal)</label>
            <input
              type="number"
              className="w-full bg-neutral-700 rounded-xl p-3"
              placeholder="e.g. 300"
              value={kcal}
              onChange={(e) => setKcal(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-1">Note</label>
            <textarea
              className="w-full bg-neutral-700 rounded-xl p-3"
              placeholder="Optional notes (e.g., treadmill incline, pace, how you felt)"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <footer className="mt-6 flex items-center justify-end gap-3">
          {!isNew && (
            <button className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-500 flex items-center justify-center" onClick={() => handleDelete(trainingId)} aria-label="Delete session" title="Delete session">
              <FaTrashAlt />
            </button>
          )}
          <button className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500" onClick={handleSave}>
            <FaSave />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default CardioModal;
