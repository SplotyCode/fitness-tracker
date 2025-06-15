import React from "react";
import {getColorHex, getCurrentLevel, Level} from "../utils/nutrition";

export interface ProgressBarProps {
    current: number | null;
    levels: Level[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({
                                                     current,
                                                     levels,
                                                 }) => {
    if (levels.length === 0) return;
    const min = levels[0].value;
    const max = levels[levels.length - 1].value;
    const spanTotal = max - min || 1;

    const level = getCurrentLevel(current, levels)?.color;
    const frameColor = level ? getColorHex(level) : '#FFFFFF';

    const segments = levels.map(({value, color}, i) => {
        const start = value;
        const end = levels[i + 1]?.value ?? max;
        const widthPct = ((end - start) / spanTotal) * 100;

        return (
            <div
                key={i}
                style={{width: `${widthPct}%`, backgroundColor: getColorHex(color)}}
                className="h-full"
            />
        );
    });

    const indicatorPct = current == null ? 0 : Math.min(Math.max((current - min) / spanTotal, 0), 1) * 100;
    return (
        <div
            className="relative"
            style={{
                border: `2px solid ${frameColor}`,
                borderRadius: 4,
                padding: 1,
                boxSizing: "border-box",
            }}
        >
            <div
                className="relative flex w-full overflow-hidden rounded-sm"
                style={{height: 8}}
            >
                {segments}

                {current != null && (
                    <div
                        className="absolute w-[3px] rounded bg-white shadow"
                        style={{
                            left: `calc(${indicatorPct}% - 1.5px)`,
                            top: -2,
                            bottom: -2,
                            zIndex: 10,
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ProgressBar;
