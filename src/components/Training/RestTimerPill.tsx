import { JSX, useEffect, useState } from "react";

export default function RestTimerPill({ seconds }: { seconds: number }): JSX.Element {
    const [remaining, setRemaining] = useState(seconds);

    useEffect(() => {
        const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, []);

    const handleAdd30 = () => setRemaining((s) => s + 30);

    const mm = Math.floor(remaining / 60).toString();
    const ss = (remaining % 60).toString().padStart(2, "0");

    return (
        <button className="px-3 py-2 rounded-full bg-neutral-700 hover:bg-neutral-600"
                onClick={handleAdd30}
                title="Add +30s">
            Rest {mm}:{ss}
        </button>
    );
}
