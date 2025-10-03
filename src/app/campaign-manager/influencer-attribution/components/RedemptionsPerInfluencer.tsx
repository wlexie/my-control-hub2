"use client";

import { useState } from "react";
import { FaCrown } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { MdKeyboardArrowDown } from "react-icons/md";

const data = [
  { month: "JAN", value: 22 },
  { month: "FEB", value: 35 },
  { month: "MAR", value: 30 },
  { month: "APR", value: 38 },
  { month: "MAY", value: 45 },
  { month: "JUN", value: 28 },
  { month: "JUL", value: 34 },
  { month: "AUG", value: 49 },
  { month: "SEP", value: 15 },
  { month: "OCT", value: 22 },
  { month: "NOV", value: 33 },
  { month: "DEC", value: 26 },
];

export default function RedemptionsPerInfluencer() {
  const [influencer, setInfluencer] = useState("Azziad Nasenya");

  return (
    <div className="p-4 bg-white rounded-2xl w-full">
      <h2 className="text-xl font-bold mb-2">Redemptions per Influencer</h2>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        {/* Left: Dropdown + Stats */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Influencer Dropdown */}
          <div className="relative">
            <select
              value={influencer}
              onChange={(e) => setInfluencer(e.target.value)}
              className="h-12 w-56 pl-9 pr-8 text-md border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="Azziad Nasenya">Azziad Nasenya</option>
              <option value="Khaligraph Jones">Khaligraph Jones</option>
              <option value="Kabi wa Jesus">Kabi wa Jesus</option>
            </select>
            <FaCrown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
          </div>

          {/* Stats aligned after dropdown */}
          <div className="flex items-center gap-3 text-md text-gray-700 font-normal">
            <span className="text-gray-600">Total No. of Redemptions</span>
            <span className="font-bold">120</span>
            <span className="flex items-center bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-medium gap-1">
              <TrendingUp className="w-3 h-3" />
              56%
            </span>
            <span className="text-gray-400 text-sm">Compared to Last Year</span>
          </div>
        </div>

        {/* Right: Yearly Button */}
        <button className="px-3 py-1 text-md rounded-md bg-blue-50 text-blue-600 border flex items-center gap-1">
          Yearly <MdKeyboardArrowDown className="w-4 h-4" />
        </button>
      </div>

      {/* Chart */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[700px] h-90">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eee"
              />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#666" }} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "16px",
                }}
                formatter={(value) => [`${value} Redemptions`, ""]}
              />
              <Bar
                dataKey="value"
                fill="#800080" // Purple
                radius={[6, 6, 0, 0]}
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
