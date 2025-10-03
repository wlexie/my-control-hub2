"use client";

import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "1 Oct", value: 10 },
  { date: "3 Oct", value: 25 },
  { date: "7 Oct", value: 30 },
  { date: "10 Oct", value: 18 },
  { date: "14 Oct", value: 55 },
  { date: "20 Oct", value: 70 },
  { date: "23 Oct", value: 60 },
  { date: "27 Oct", value: 68 },
  { date: "30 Oct", value: 45 },
];

export default function RedemptionsChart() {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
        <div>
          <h2 className="text-xl font-bold">Redemptions Over Time (R.O.Ts)</h2>
          <p className="text-gray-500 text-lg font-semibold">October</p>
          <div className="flex items-center gap-3 mt-1 text-md text-gray-700 font-semibold">
            <span className="text-gray-600">
              Total No. of Redemptions Over Time:
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            <span className="font-semibold text-blue-600">180</span>
            <span className="flex items-center bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-md font-medium gap-1">
              <TrendingUp className="w-3 h-3" />
              56%
            </span>
            <span className="text-gray-400 text-sm">Compared to Last Year</span>
          </div>
        </div>
        <button className="px-3 py-1 text-md rounded-md bg-blue-50 text-blue-600 border">
          Monthly
        </button>
      </div>

      {/* Chart - Scrollable on Mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px] h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eee"
              />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#666" }} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "16px",
                }}
                formatter={(value) => [`${value} R.O.Ts`, ""]}
                labelFormatter={(label) => `${label}`}
              />
              <Line
                type="linear"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 5, fill: "#22c55e" }}
                activeDot={{ r: 7, fill: "#16a34a" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
