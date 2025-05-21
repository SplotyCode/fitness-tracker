import React from "react";

const WeightChart: React.FC = () => {
  return (
    <div className="relative border-b border-solid border-b-white border-b-opacity-10 h-[300px]">
      <figure
        role="img"
        aria-label="Weight progress chart showing trend"
        className="relative size-full"
      >
        <div className="flex absolute inset-y-0 -left-5 flex-col justify-between text-xs text-zinc-400">
          <span>110kg</span>
          <span>100kg</span>
          <span>90kg</span>
        </div>
        <div className="absolute left-0 w-full h-0.5 bg-sky-300 origin-left bottom-[20%] rotate-[-15deg]" />
        <div className="absolute left-0 bottom-1/4 w-full h-0.5 origin-left -rotate-12 bg-sky-300 bg-opacity-30" />
      </figure>
    </div>
  );
};

export default WeightChart;
