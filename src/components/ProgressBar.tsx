import React from "react";

import { ProgressBarProps } from "./types";

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  reached,
}) => {
  const percentage = current == null ? 0 : Math.min((current / target) * 100, 100);

  return (
    <div className="overflow-hidden h-1 rounded-sm bg-white bg-opacity-10">
      <div
        className="h-full rounded-sm"
        style={{
          width: `${percentage}%`,
          backgroundColor: reached ? "rgb(63, 185, 80)" : "rgb(248, 81, 73)",
        }}
      />
    </div>
  );
};

export default ProgressBar;
