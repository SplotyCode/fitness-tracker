import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { WeekData } from "./types";

interface ChartPoint {
  name: string;
  weight: number | null;
  average?: number;
  date: string;
}

interface Props {
  weeks: WeekData[];
}

const WeightChart: React.FC<Props> = ({ weeks }) => {
  const flatData: ChartPoint[] = weeks.flatMap((week) =>
      week.days.map((day, i) => ({
        name: `W${week.weekNum}-D${i + 1}`,
        weight: day.weight,
        date: day.date,
      }))
  );

  const dataWithAvg: ChartPoint[] = flatData.map((p, i, arr) => {
    if (p.weight === null) return { ...p };
    const slice = arr.slice(Math.max(0, i - 6), i + 1);
    const weights = slice.map(d => d.weight).filter(w => w !== null) as number[];
    const avg = weights.length ? +(weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : undefined;
    return { ...p, average: avg };
  });

  const weights = flatData.map(d => d.weight).filter(w => w !== null) as number[];
  const minY = weights.length ? Math.floor(Math.min(...weights) - 2) : 80;
  const maxY = weights.length ? Math.ceil(Math.max(...weights) + 2) : 120;

  return (
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dataWithAvg} margin={{ top: 5, right: 20, left: -25}}>
            <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#a1a1aa" }}
                dy={10}
                tickFormatter={(dateStr) =>
                    new Date(dateStr).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                    })
                }
            />
            <YAxis
                domain={[minY, maxY]}
                tick={{ fontSize: 12, fill: "#a1a1aa" }}
                dx={-5}
                width={75}
                tickFormatter={(v) => `${v}kg`}
            />
            <Tooltip
                contentStyle={{ backgroundColor: "#2a2a2a", borderRadius: "8px" }}
                labelStyle={{ color: "#f4f4f5", fontWeight: "bold" }}
                itemStyle={{ color: "#e4e4e7" }}
                formatter={(value: number, name: string, entry: any) => {
                  if (name === "weight" && entry.payload.weight === null) return ["No data", "Weight"];
                  const label = name === "average" ? "7-Day Avg." : "Weight";
                  return [`${value} kg`, label];
                }}
                labelFormatter={(label: string, payload: any[]) => {
                  const date = payload?.[0]?.payload?.date;
                  return date ? new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : label;
                }}
            />
            <Line
                dataKey="weight"
                stroke="#38bdf8"
                strokeWidth={0}
                dot={({ cx, cy, payload }) =>
                    payload.weight !== null ? <Dot cx={cx} cy={cy} r={4} fill="#38bdf8" /> : <g />
                }
                connectNulls={false}
            />
            <Line
                dataKey="average"
                stroke="#1a7f37"
                strokeWidth={2}
                dot={false}
                connectNulls
                strokeDasharray="4 4"
                activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
};

export default WeightChart;
