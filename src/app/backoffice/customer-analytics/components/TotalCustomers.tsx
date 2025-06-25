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
import { TrendingUp, TrendingDown } from "lucide-react";

const data = [
  { date: "04/04/25", registered: 44128, active: 30120 },
  { date: "05/04/25", registered: 23412, active: 32560 },
  { date: "06/04/25", registered: 44200, active: 21560 },
  { date: "07/04/25", registered: 8300, active: 19500 },
  { date: "08/04/25", registered: 23400, active: 11000 },
  { date: "09/04/25", registered: 44200, active: 18000 },
  { date: "10/04/25", registered: 20000, active: 41000 },
];

export default function RegisteredVsActiveChart() {
  return (
    <div className="w-full h-auto px-4 py-6 bg-white rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-2 md:px-0">
        <h2 className="font-semibold text-xl md:text-2xl text-black">
          Total Registered vs Active Customers
        </h2>
        <button className="bg-blue-500 text-white px-4 py-1 rounded-lg text-sm">
          Weekly
        </button>
      </div>

      {/* Scrollable Legend + Chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Legend and Stats */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 mb-6 px-2 md:px-0">
            {/* Registered */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="w-4 h-2 bg-blue-500 rounded-sm"></span>
              <p className="text-sm text-gray-500">Registered</p>
              <p className="font-bold text-black text-sm">44,128</p>
              <span className="flex items-center text-red-500 text-xs bg-red-100 px-2 py-0.5 rounded-full gap-1">
                <TrendingDown className="w-3 h-3" />
                12%
              </span>
              <p className="text-gray-400 text-sm whitespace-nowrap">
                Compared to Last Week
              </p>
            </div>

            {/* Active */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="w-4 h-2 bg-purple-700 rounded-sm"></span>
              <p className="text-sm text-gray-500">Active</p>
              <p className="font-bold text-black text-sm">32,560</p>
              <span className="flex items-center text-green-500 text-xs bg-green-100 px-2 py-0.5 rounded-full gap-1">
                <TrendingUp className="w-3 h-3" />
                5.2%
              </span>
              <p className="text-gray-400 text-sm whitespace-nowrap">
                Compared to Last Week
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[280px] px-2 md:px-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => value.toLocaleString()}
                />
                <Bar dataKey="registered" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="active" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
