"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { date: "08/04/25", "£5,000": 18, "£13,000": 9, "£18,000": 7, "£25,000": 5 },
  { date: "09/04/25", "£5,000": 15, "£13,000": 8, "£18,000": 5, "£25,000": 3 },
  { date: "10/04/25", "£5,000": 17, "£13,000": 8, "£18,000": 6, "£25,000": 4 },
  { date: "11/04/25", "£5,000": 19, "£13,000": 10, "£18,000": 7, "£25,000": 4 },
  { date: "12/04/25", "£5,000": 20, "£13,000": 9, "£18,000": 8, "£25,000": 5 },
  { date: "13/04/25", "£5,000": 17, "£13,000": 8, "£18,000": 6, "£25,000": 4 },
  { date: "14/04/25", "£5,000": 16, "£13,000": 8, "£18,000": 6, "£25,000": 3 },
];

export default function RegulatoryTransactionsChart() {
  return (
    <div className="bg-white p-6 rounded-xl border-0 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h2 className="font-semibold text-xl sm:text-2xl text-gray-800">
          Transactions Above Regulatory Limits.
        </h2>
        <button className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-md w-max">
          Weekly 
        </button>
      </div>

      {/* Scrollable Chart on Mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px] md:min-w-0 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} stackOffset="sign">
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="£5,000" stackId="a" fill="#2970FF" />
              <Bar dataKey="£13,000" stackId="a" fill="#5393FF" />
              <Bar dataKey="£18,000" stackId="a" fill="#7DB1FF" />
              <Bar dataKey="£25,000" stackId="a" fill="#AACDFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
