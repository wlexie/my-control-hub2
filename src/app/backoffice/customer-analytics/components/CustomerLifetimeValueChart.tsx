"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TooltipProps } from "recharts";

const data = [
  { date: "1 Oct", value: 1700 },
  { date: "3 Oct", value: 2500 },
  { date: "7 Oct", value: 1900 },
  { date: "10 Oct", value: 2600 },
  { date: "14 Oct", value: 3900 },
  { date: "20 Oct", value: 1800 },
  { date: "23 Oct", value: 800 },
  { date: "27 Oct", value: 1600 },
  { date: "30 Oct", value: 3700 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md">
        <p>{label}</p>
        <p className="font-semibold">£{payload[0].value}</p>
      </div>
    );
  }

  return null;
};

export default function CustomerLifetimeValueChart() {
  return (
    <div className="w-full px-4 py-6 bg-white rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-xl md:text-2xl text-black font-semibold">
            Average Customer Lifetime Value (CLV)
          </h2>
          <p className="text-sm md:text-md text-gray-500 mt-1">
            All Customers:{" "}
            <span className="text-[#1E5EFF] font-semibold">75,523</span>{" "}
            <span className="text-green-500 ml-1">▲ 27%</span>{" "}
            <span className="text-gray-400">vs Last Month</span>
          </p>
        </div>
        <button className="bg-[#1E5EFF] text-white px-4 py-1 text-sm rounded-md">
          Monthly ▾
        </button>
      </div>

      {/* Scrollable Chart Area */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px] h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#eee" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1E5EFF"
                strokeWidth={2}
                dot={{
                  stroke: "#1E5EFF",
                  strokeWidth: 2,
                  r: 4,
                  fill: "#fff",
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
