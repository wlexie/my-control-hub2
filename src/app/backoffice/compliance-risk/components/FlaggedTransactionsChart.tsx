"use client";

import { TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "JAN", volume: 38 },
  { month: "FEB", volume: 5 },
  { month: "MAR", volume: 20 },
  { month: "APR", volume: 34 },
  { month: "MAY", volume: 45 },
  { month: "JUN", volume: 36 },
  { month: "JUL", volume: 26 },
  { month: "AUG", volume: 14 },
  { month: "SEP", volume: 22 },
  { month: "OCT", volume: 30 },
  { month: "NOV", volume: 41 },
  { month: "DEC", volume: 12 },
];

export default function FlaggedTransactionsChart() {
  return (
    <div className="bg-white p-6 rounded-xl border-0 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div>
          <h2 className="font-semibold text-xl sm:text-2xl text-gray-800 mb-1">
            Flagged Transactions For AML Review.
          </h2>
          <p className="text-sm text-gray-500">
            Total No. of Flagged Transactions:{" "}
            <span className="text-indigo-600 font-medium">873</span>{" "}
            <span className="inline-flex items-center gap-1 text-green-500 font-semibold text-xs">
              <TrendingUp size={14} /> 84% Vs Last Year
            </span>
          </p>
        </div>
        <button className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-md w-max">
          Yearly 
        </button>
      </div>

      {/* Scrollable chart on mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px] md:min-w-0 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="volume" fill="#9B2EFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
