"use client";

import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts";

const defaultData = [
  { name: "Savings", value: 70, color: "#f97316" },
  { name: "Category A", value: 15, color: "#fdba74" },
  { name: "Category B", value: 15, color: "#cbd5f5" },
];

type AllocationChartProps = {
  data?: { name: string; value: number; color: string }[];
};

export function AllocationChart({ data = defaultData }: AllocationChartProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={78}
            paddingAngle={4}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
