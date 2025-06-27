"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CardContent } from "../../../../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../../components/ui/chart";
import { TrendingDown, TrendingUp } from "lucide-react";

const chartData = [
  { month: "04/04/25", resolved: 45000, open: 33000 },
  { month: "05/04/25", resolved: 27000, open: 39000 },
  { month: "06/04/25", resolved: 47000, open: 23000 },
  { month: "07/04/25", resolved: 19000, open: 36000 },
  { month: "08/04/25", resolved: 22000, open: 46000 },
];

const chartConfig = {
  resolved: {
    label: "resolved",
    color: "hsl(var(--chart-1))",
  },
  open: {
    label: "open",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function OpenvsResolved() {
  return (
    <div className="w-full h-fit">
      <div className="flex justify-between items-center gap-12 mb-4">
        <h1 className="text-black font-semibold text-lg">
          Open vs. Resolved Tickets
        </h1>
        <button className="rounded-lg px-4 py-1 bg-blue-500 text-white text-sm">
          Weekly
        </button>
      </div>

      {/* Indicators */}
      <div className="flex flex-wrap gap-6 items-start mb-4">
        {/* Resolved */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            <h1 className="text-black font-light text-sm">Resolved Tickets</h1>
          </div>
          <h1 className="text-md font-bold text-black">2,128</h1>
          <span className="flex bg-red-100 text-red-600 text-xs rounded-full px-2 py-0.5 items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            16%
          </span>
          <p className="text-gray-400 text-sm">Compared to Last Week</p>
        </div>

        {/* Open */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            <h1 className="text-black font-light text-sm">Open Tickets</h1>
          </div>
          <h1 className="text-md font-bold text-black">19</h1>
          <span className="flex bg-green-100 text-green-600 text-xs rounded-full px-2 py-0.5 items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            56%
          </span>
          <p className="text-gray-400 text-sm">Compared to Last Week</p>
        </div>
      </div>

      {/* Scrollable Chart */}
      <CardContent className="pb-0">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <ChartContainer config={chartConfig} className="h-[340px] w-full">
              <BarChart width={600} height={340} data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="resolved" fill="#3b82f6" radius={4} barSize={20} />
                <Bar dataKey="open" fill="#facc15" radius={4} barSize={20} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
