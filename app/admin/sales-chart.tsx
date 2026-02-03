/*"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type SalesPoint = {
  month: string;
  totalSales: number;
};

export default function SalesChart({ data }: { data: SalesPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-xl border bg-background text-sm text-muted-foreground">
        No sales data yet.
      </div>
    );
  }

  return (
    <div className="h-[260px] w-full rounded-xl border bg-background p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickMargin={8} />
          <YAxis tickMargin={8} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="totalSales"
            strokeWidth={2}
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
*/
