"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Transfer Error", value: 200, time: 5.6, color: "#7b2ff7" },
  { name: "High-Value Transfer Flagged", value: 61, time: 3.0, color: "#9ca3af" },
  { name: "Delayed Settlement", value: 25, time: 2.0, color: "#9ca3af" },
  { name: "Unusual Activity Detected", value: 51, time: 1.5, color: "#9ca3af" },
];

export default function DowntimeIncidentsChart() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-none w-full max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 leading-snug">
          Downtime Incidents And Resolution Time
        </h2>
        <button className="bg-[#eef2ff] text-[#4f46e5] px-4 py-1 text-sm rounded-full flex items-center gap-1">
          Yearly
          <svg
            className="w-4 h-4 text-[#4f46e5]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable Chart Wrapper */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[520px] relative h-60 pr-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
            >
              <XAxis
                type="number"
                domain={[0, 6]}
                ticks={[0, 2, 4, 6]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                stroke="#e5e7eb"
              />
              <YAxis
                type="category"
                dataKey="name"
                width={190}
                tick={{ fontSize: 13, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Bar dataKey="time" radius={[0, 20, 20, 0]} barSize={14}>
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Tooltip bubble for Transfer Error */}
          <div className="absolute top-[8px] left-[calc(5.6*60px)]">
            <div className="relative">
              <div className="bg-[#7b2ff7] text-white text-xs px-2 py-[2px] rounded-md absolute -top-6">
                5.6 Sec
                <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-[#7b2ff7] transform rotate-45 -translate-x-1/2"></div>
              </div>
            </div>
          </div>

          {/* Time labels */}
          <div className="absolute top-[36px] left-[190px] flex flex-col gap-[33px]">
            {data.map((item, index) =>
              index === 0 ? null : (
                <span
                  key={index}
                  className="text-sm font-semibold text-[#7b7e97]"
                  style={{ transform: `translateX(${item.time * 60}px)` }}
                >
                  {item.time} Sec
                </span>
              )
            )}
          </div>

          {/* Incident counts */}
          <div className="absolute top-[10px] right-2 flex flex-col gap-[34px] text-sm font-semibold text-[#7b7e97] text-right">
            {data.map((item) => (
              <span key={item.name}>{item.value}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
