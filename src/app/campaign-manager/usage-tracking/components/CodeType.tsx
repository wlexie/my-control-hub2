"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "One-time Use", value: 600, color: "#6366F1" }, // Indigo
  { name: "Total campaign", value: 300, color: "#22C55E" }, // Green
  { name: "No Expiry", value: 100, color: "#F59E0B" }, // Amber
];

export default function CodeType() {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-lg font-bold">
          Redemption Distribution by Code Type
        </h2>
        <button className="px-3 py-1 text-sm rounded-md bg-blue-50 text-blue-600 border">
          Monthly
        </button>
      </div>

      {/* Chart */}
      <div className="flex-1 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="72%"
              outerRadius="85%"
              startAngle={210}
              endAngle={-150}
              paddingAngle={6}
              cornerRadius={50}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>

            {/* Tooltip */}
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} (${Math.round((value / total) * 100)}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Centered Text */}
        <div className="absolute text-center">
          <span className="block text-2xl font-bold">
            {total.toLocaleString()}
          </span>
          <span className="text-gray-500 text-sm">Total Codes</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: d.color }}
            ></span>
            <span className="text-gray-700">{d.name}</span>
            <span className="font-semibold">{d.value}</span>
            <span className="text-gray-500">
              ({Math.round((d.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
