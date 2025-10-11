import {JSX} from "react";


const QuickInputs = ({ v, onChange }: { v: number; onChange: (n: number) => void }): JSX.Element => {
  const inc = (): void => onChange(Number((v + 1).toFixed(1)));
  const dec = (): void => onChange(Math.max(0, Number((v - 1).toFixed(1))));
  return (
    <div className="inline-flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
      <button className="px-2 py-1 rounded bg-neutral-700" onClick={dec} type="button">−</button>
      <div className="w-10 text-center tabular-nums">{v}</div>
      <button className="px-2 py-1 rounded bg-neutral-700" onClick={inc} type="button">+</button>
    </div>
  );
}


export default QuickInputs;
