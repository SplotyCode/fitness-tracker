import { JSX, useEffect, useState } from "react";

export default function RestTimerPill({ seconds }: { seconds: number }): JSX.Element {
    const [target, setTarget] = useState(seconds);
    const [passed, setPassed] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setPassed((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, []);

    const remaining = Math.max(0, target - passed);
    const handleAdd30 = () => setTarget((t) => t + 30);

    const shown = remaining > 0 ? remaining : passed;
    const mm = Math.floor(shown / 60).toString();
    const ss = (shown % 60).toString().padStart(2, "0");

    const reached = remaining === 0;

    return (
        <button
            className={`px-3 py-2 rounded-full bg-neutral-700 hover:bg-neutral-600 ${reached ? "border-2 border-yellow-400" : ""}`}
            onClick={handleAdd30}
            title="Add +30s"
        >
            Rest {mm}:{ss}
        </button>
    );
}
