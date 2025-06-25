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
import { TrendingDown } from "lucide-react";

const data = [
  { date: "1 Oct", cases: 10 },
  { date: "3 Oct", cases: 28 },
  { date: "7 Oct", cases: 30 },
  { date: "10 Oct", cases: 18 },
  { date: "14 Oct", cases: 55 },
  { date: "20 Oct", cases: 75 },
  { date: "23 Oct", cases: 58 },
  { date: "27 Oct", cases: 70 },
  { date: "30 Oct", cases: 42 },
];

export default function FraudGraph() {
  return (
    <div className="w-full h-[420px] overflow-x-auto md:overflow-visible">
      <div className="flex justify-between items-center mb-2 px-2 md:px-0">
        <div>
          <h2 className="text-black font-semibold text-xl md:text-2xl">
            Reported Fraud Cases
          </h2>
          <p className="text-black text-sm mt-1">October</p>
        </div>
        <button className="bg-blue-500 text-white px-3 md:px-4 py-1 rounded-lg text-sm">
          Monthly
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 px-2 md:px-0">
        <p className="text-sm text-gray-600 whitespace-nowrap">Total No. of Reported Cases:</p>
        <p className="font-bold text-sm text-black">180</p>
        <span className="flex items-center gap-1 text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
          <TrendingDown className="w-3 h-3" />
          0.4%
        </span>
        <p className="text-gray-400 text-sm whitespace-nowrap">vs Last Month</p>
      </div>

      <div className="min-w-[600px] md:min-w-0 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              stroke="#666"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              stroke="#666"
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-red-600 text-white text-xs px-3 py-1 rounded-md">
                      <p>{label}</p>
                      <p className="font-semibold">{payload[0].value} Cases</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="cases"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{
                r: 5,
                stroke: "#fff",
                strokeWidth: 2,
                fill: "#ef4444",
              }}
              activeDot={{
                r: 6,
                fill: "#ef4444",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
