import {JSX, useEffect, useState} from "react";
import {FiClock} from "react-icons/fi";

interface Props {
  seconds: number;
  at: number;
}

const RestTimerPill = ({seconds, at}: Props): JSX.Element => {
  const [extraSec, setExtraSec] = useState(0);
  const [now, setNow] = useState<number>(Date.now());
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    setExtraSec(0);
    setNotified(false);
  }, [at]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalPlannedSec = seconds + extraSec;
  const targetMs = at + totalPlannedSec * 1000;
  const remainingSec = Math.max(0, Math.ceil((targetMs - now) / 1000));
  const passedSec = Math.max(0, Math.floor((now - at) / 1000));

  const handleAdd30 = (): void => {
    setExtraSec((s) => s + 30);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      try {
        void Notification.requestPermission();
      } catch (e) {
        console.warn("Notification request failed: ", e);
      }
    }
  };

  const shown = remainingSec > 0 ? remainingSec : passedSec;
  const mm = Math.floor(shown / 60).toString();
  const ss = (shown % 60).toString().padStart(2, "0");

  const reached = remainingSec === 0;

  useEffect(() => {
    if (!reached || notified) return;

    const sendNotification = async (): Promise<void> => {
      console.log("Sending notification");
      const title = "Rest complete";
      const body = "Time to start your next set";

      if (typeof Notification !== "undefined") {
        try {
          let permission = Notification.permission;
          if (permission === "default") {
            permission = await Notification.requestPermission();
          }
          if (permission === "granted") {
            new Notification(title, {body});
          }
        } catch (e) {
          console.warn("Notification failed: ", e);
        }
      }

      try {
        if (navigator.vibrate) navigator.vibrate([250, 125, 250]);
      } catch (e) {
        console.warn("Vibration failed: ", e);
      }
    };

    void sendNotification();
    setNotified(true);
  }, [reached, notified]);

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
