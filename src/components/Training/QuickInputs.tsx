import React, { JSX, useCallback } from "react";

const QuickInputs = ({ value, onChange }: { value: number; onChange: (n: number) => void }): JSX.Element => {
  const inc = (): void => onChange(Number((value + 1).toFixed(1)));
  const dec = (): void => onChange(Math.max(0, Number((value - 1).toFixed(1))));
  const onInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((e) => {
    const raw = e.target.value;
    onChange(Number(raw));
  }, [onChange]);

  return (
    <div className="inline-flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
      <button className="px-2 py-1 rounded bg-neutral-700" onClick={dec} type="button">−</button>
      <input
        type="number"
        className="w-12 text-center tabular-nums bg-transparent outline-none"
        value={value}
        min={0}
        step="any"
        inputMode="decimal"
        onChange={onInputChange}
      />
      <button className="px-2 py-1 rounded bg-neutral-700" onClick={inc} type="button">+</button>
    </div>
  );
}


export default QuickInputs;
