"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  formatCurrency,
  formatCurrencyCompact,
  maskCurrency,
  type Currency,
} from "@/lib/format";

const defaultData = [
  { month: "Sep", saved: 820 },
  { month: "Oct", saved: 1280 },
  { month: "Nov", saved: 1640 },
  { month: "Dec", saved: 2350 },
  { month: "Jan", saved: 3280 },
  { month: "Feb", saved: 4250 },
];

type GrowthChartProps = {
  currency: Currency;
  rate: number;
  masked?: boolean;
  data?: { month: string; saved: number }[];
};

export function GrowthChart({
  currency,
  rate,
  masked,
  data = defaultData,
}: GrowthChartProps) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="4 6" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            tickFormatter={(value) =>
              masked
                ? maskCurrency(currency)
                : formatCurrencyCompact(value, currency, rate)
            }
          />
          <Tooltip
            cursor={{ stroke: "hsl(var(--border))", strokeDasharray: "4 6" }}
            contentStyle={{
              borderRadius: 12,
              borderColor: "hsl(var(--border))",
              backgroundColor: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              fontSize: 12,
            }}
            formatter={(value) => [
              masked
                ? maskCurrency(currency)
                : formatCurrency(Number(value), currency, rate),
              "Total Saved",
            ]}
          />
          <Line
            type="monotone"
            dataKey="saved"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
