"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";

const data = [
  { name: "Jan", Mpesa: 1000, Till: 3000, Paybill: 2500, Bank: 1500, Card: 4000 },
  { name: "Feb", Mpesa: 2000, Till: 1800, Paybill: 2700, Bank: 2200, Card: 1000 },
  { name: "Mar", Mpesa: 3000, Till: 3500, Paybill: 2000, Bank: 4000, Card: 2500 },
  { name: "Apr", Mpesa: 1000, Till: 2500, Paybill: 3000, Bank: 2900, Card: 800 },
  { name: "May", Mpesa: 3500, Till: 1500, Paybill: 2000, Bank: 3700, Card: 1200 },
  { name: "Jun", Mpesa: 1800, Till: 3000, Paybill: 2800, Bank: 2200, Card: 5000 },
  { name: "Jul", Mpesa: 2400, Till: 1600, Paybill: 2100, Bank: 1800, Card: 3100 },
  { name: "Aug", Mpesa: 2000, Till: 1000, Paybill: 2200, Bank: 1600, Card: 2500 },
  { name: "Sep", Mpesa: 2200, Till: 1800, Paybill: 2900, Bank: 1700, Card: 2200 },
  { name: "Oct", Mpesa: 1300, Till: 1500, Paybill: 1800, Bank: 2000, Card: 1900 },
  { name: "Nov", Mpesa: 2500, Till: 1900, Paybill: 2100, Bank: 2400, Card: 2700 },
  { name: "Dec", Mpesa: 2800, Till: 2300, Paybill: 2600, Bank: 3000, Card: 3500 },
];

const COLORS = {
  Mpesa: "#689DFF",
  Till: "#c084fc",
  Paybill: "#60a5fa",
  Bank: "#9333ea",
  Card: "#E0C6FD",
};

export function Breakout() {
  return (
    <div className="w-full bg-white rounded-xl p-4 border-0">
      {/* Header */}
      <div className="flex flex-col gap-6 px-4 md:px-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">
          Breakdown By Payout Method
        </h1>

        {/* Empty metric rows */}
        <div className="hidden md:grid md:grid-cols-4 gap-6 text-sm text-gray-700">
  {[1, 2, 3, 4].map((_, i) => (
    <div key={i} className="h-8"></div>
  ))}
</div>

        

        {/* Legend and Dropdown */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4 text-xs">
            {Object.entries(COLORS).map(([key, color]) => (
              <div key={key} className="flex items-center gap-2 font-medium">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                ></span>
                {key}
              </div>
            ))}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg">
                Yearly <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40">Monthly</PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Chart Section */}
      <CardContent className="mt-4 h-[360px] px-4 md:px-8">
        {/* Only scrollable on small screens */}
        <div className="block md:hidden overflow-x-auto">
          <div className="min-w-[768px]">
            <BarChart width={768} height={360} data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value}k`}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "8px",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
              {Object.entries(COLORS).map(([key, color]) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  barSize={10}
                />
              ))}
            </BarChart>
          </div>
        </div>

        {/* Normal desktop layout with full responsiveness */}
        <div className="hidden md:block w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value}k`}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "8px",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
              {Object.entries(COLORS).map(([key, color]) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                  barSize={10}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </div>
  );
}
