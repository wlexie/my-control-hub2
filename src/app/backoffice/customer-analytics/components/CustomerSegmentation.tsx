"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Button } from "../../../../components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import { CardContent } from "../../../../components/ui/card";

const data = [
  { name: "Jan", Active: 5000, Inactive: 3000, Dormant: 2000, High: 4500 },
  { name: "Feb", Active: 5200, Inactive: 2800, Dormant: 1600, High: 4000 },
  { name: "Mar", Active: 4700, Inactive: 2500, Dormant: 1800, High: 4600 },
  { name: "Apr", Active: 4900, Inactive: 2400, Dormant: 1500, High: 3500 },
  { name: "May", Active: 5300, Inactive: 2700, Dormant: 1900, High: 3000 },
  { name: "Jun", Active: 4100, Inactive: 3100, Dormant: 1700, High: 5100 },
  { name: "Jul", Active: 4800, Inactive: 2600, Dormant: 1000, High: 5300 },
  { name: "Aug", Active: 300, Inactive: 2200, Dormant: 3200, High: 4100 },
  { name: "Sep", Active: 3500, Inactive: 2700, Dormant: 2000, High: 4900 },
  { name: "Oct", Active: 3300, Inactive: 2500, Dormant: 2100, High: 4200 },
  { name: "Nov", Active: 4200, Inactive: 2700, Dormant: 2600, High: 3900 },
  { name: "Dec", Active: 5000, Inactive: 2900, Dormant: 2400, High: 4600 },
];

const COLORS = {
  Active: "#9333ea", // purple
  Inactive: "#f43f5e", // red
  Dormant: "#facc15", // yellow
  High: "#0ea5e9", // cyan
};

export function CustomerSegmentationChart() {
  return (
    <div className="w-full bg-white rounded-xl p-4 border-0">
      {/* Title & Filter */}
      <div className="flex justify-between items-center px-4 md:px-8 mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-black">
          Customer Segmentation
        </h1>

        <Popover>
          <PopoverTrigger asChild>
            <Button className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg">
              Yearly <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 text-sm">Monthly</PopoverContent>
        </Popover>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs font-medium text-gray-700 px-4 md:px-8 mb-2">
        {Object.entries(COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            ></span>
            {key}
          </div>
        ))}
      </div>

      {/* Chart */}
     <CardContent className="mt-2 h-[360px] px-4 md:px-8 overflow-x-auto">
  <div className="min-w-[620px] md:min-w-0 h-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `${value / 1000}k`}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "8px",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string) => [
            `${value.toLocaleString()}`,
            name,
          ]}
        />
        <Bar
          dataKey="Active"
          fill={COLORS.Active}
          radius={[4, 4, 0, 0]}
          barSize={12}
        />
        <Bar
          dataKey="Inactive"
          fill={COLORS.Inactive}
          radius={[4, 4, 0, 0]}
          barSize={12}
        />
        <Bar
          dataKey="Dormant"
          fill={COLORS.Dormant}
          radius={[4, 4, 0, 0]}
          barSize={12}
        />
        <Bar
          dataKey="High"
          fill={COLORS.High}
          radius={[4, 4, 0, 0]}
          barSize={12}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</CardContent>

    </div>
  );
}
