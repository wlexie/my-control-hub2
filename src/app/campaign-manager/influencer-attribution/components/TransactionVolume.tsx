"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaCrown } from "react-icons/fa";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TrendingUp } from "lucide-react";
import { TooltipProps } from "recharts";

// Sample Data
const data = [
  { date: "1 Oct", value: 800 },
  { date: "3 Oct", value: 2600 },
  { date: "7 Oct", value: 3125 },
  { date: "10 Oct", value: 1700 },
  { date: "14 Oct", value: 5500 },
  { date: "20 Oct", value: 7500 },
  { date: "23 Oct", value: 5900 },
  { date: "27 Oct", value: 7100 },
  { date: "30 Oct", value: 4200 },
];

//  Custom Tooltip Component
const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#f59e0b] text-white px-3 py-2 rounded-lg text-center shadow-md">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-md font-bold">
          {payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function TransactionVolumeChart() {
  const [selectedInfluencer, setSelectedInfluencer] = useState("Rue Baby");

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl w-full">
      {/* Header Section */}
      <h2 className="text-lg font-bold mb-2">Redemptions per Influencer</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Influencer Dropdown */}
          <div className="relative">
            <select
              value={selectedInfluencer}
              onChange={(e) => setSelectedInfluencer(e.target.value)}
              className="h-12 w-56 pl-9 pr-8 text-sm border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="Rue Baby">Rue Baby</option>
              <option value="Azziad Nasenya">Azziad Nasenya</option>
              <option value="Khaligraph Jones">Khaligraph Jones</option>
              <option value="Kabi wa Jesus">Kabi wa Jesus</option>
            </select>
            <FaCrown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
          </div>

          {/* Stats aligned after dropdown */}
          <div className="flex items-center gap-3 text-sm text-gray-700 font-normal">
            <span className="text-gray-600">Total No. of Redemptions</span>
            <span className="font-bold">120</span>
            <span className="flex items-center bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-medium gap-1">
              <TrendingUp className="w-3 h-3" />
              56%
            </span>
            <span className="text-gray-400 text-xs">Compared to Last Year</span>
          </div>
        </div>

        {/* Right: Yearly Button */}
        <button className="px-3 py-1 text-sm rounded-md bg-blue-50 text-blue-600 border flex items-center gap-1">
          Yearly <MdKeyboardArrowDown className="w-4 h-4" />
        </button>
      </div>

      {/* Chart Section */}
      <div className="w-full h-80 overflow-x-auto">
        <div className="min-w-[700px] h-full">
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
              <YAxis
                tick={{ fontSize: 12, fill: "#666" }}
                tickFormatter={(val) => `${val / 1000}k`}
              />

              <Tooltip content={<CustomTooltip />} />

              <Line
                type="linear"
                dataKey="value"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 8, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{
                  r: 7,
                  fill: "#f59e0b",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
