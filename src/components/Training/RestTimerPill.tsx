import {JSX, useEffect, useState} from "react";
import {FiClock} from "react-icons/fi";

interface Props {
  seconds: number;
  at: number;
}

const RestTimerPill = ({seconds, at}: Props): JSX.Element => {
  const [extraSec, setExtraSec] = useState(0);
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    setExtraSec(0);
  }, [at]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalPlannedSec = seconds + extraSec;
  const targetMs = at + totalPlannedSec * 1000;
  const remainingSec = Math.max(0, Math.ceil((targetMs - now) / 1000));
  const passedSec = Math.max(0, Math.floor((now - at) / 1000));

  const handleAdd30 = (): void => setExtraSec((s) => s + 30);

  const shown = remainingSec > 0 ? remainingSec : passedSec;
  const mm = Math.floor(shown / 60).toString();
  const ss = (shown % 60).toString().padStart(2, "0");

  const reached = remainingSec === 0;

  return (
    <button
      className={`px-3 py-2 rounded-full bg-neutral-700 hover:bg-neutral-600 ${reached ? "border-2 border-yellow-400" : ""}`}
      onClick={handleAdd30}
      title="Add +30s"
    >
      <span className="inline-flex items-center gap-2">
        <FiClock aria-hidden={true} className={reached ? "text-yellow-300" : "text-neutral-300"} />
        {mm}:{ss}
      </span>
    </button>
  );
}

export default RestTimerPill;
