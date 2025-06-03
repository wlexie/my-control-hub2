"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Image from "next/image";

const data = [
  {
    name: "MPesa",
    seconds: 8,
    color: "#8e44ad",
    icon: "/backoffice/icons/sim.svg",
  },
  {
    name: "Bank",
    seconds: 17,
    color: "#f78da7",
    icon: "/backoffice/icons/bank.svg",
  },
  {
    name: "Card",
    seconds: 13,
    color: "#2ecc71",
    icon: "/backoffice/icons/card.svg",
  },
  {
    name: "Till",
    seconds: 4,
    color: "#3498db",
    icon: "/backoffice/icons/till.svg",
  },
  {
    name: "Paybill",
    seconds: 2,
    color: "#f39c12",
    icon: "/backoffice/icons/bill.svg",
  },
];

export default function AverageTimeChart() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-none flex flex-col space-y-6">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold">
          Average Time To Complete Transactions
        </h2>
        <button className="bg-[#eef2ff] text-[#4f46e5] px-4 py-1 text-sm rounded-full">
          Yearly
        </button>
      </div>

      <div className="flex gap-6">
        {/* Line Graph with Dots */}
        <div className="flex-1 relative">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <CartesianGrid
                horizontal={true}
                vertical={false}
                strokeDasharray="3 3"
              />
              <XAxis dataKey="name" hide />
              <YAxis hide domain={[0, 20]} />
              <Tooltip formatter={(value) => `${value} Seconds`} />
              <Line
                type="monotone"
                dataKey="seconds"
                stroke="url(#lineGradient)"
                strokeWidth={2}
                dot={({ cx, cy, payload }) => (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={6}
                      fill={payload.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  </g>
                )}
                activeDot={false}
              />
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  {data.map((point, index) => (
                    <stop
                      key={index}
                      offset={`${(index / (data.length - 1)) * 100}%`}
                      stopColor={point.color}
                      stopOpacity={0.5}
                    />
                  ))}
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>

          {/* Icons under dots */}
          <div className="flex justify-around mt-4 px-2">
            {data.map((item, index) => (
              <Image
                key={index}
                src={item.icon}
                alt={item.name}
                width={28}
                height={28}
              />
            ))}
          </div>
        </div>

        {/* Right side: Transaction Details */}
        <div className="flex-1 space-y-3 ">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image src={item.icon} alt={item.name} width={32} height={32} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {item.name} Transactions
                </p>
                <p className="text-xs text-gray-500">
                  Average time to complete transactions
                </p>
              </div>
              <p className="ml-auto font-semibold text-sm text-gray-800">
                {item.seconds.toString().padStart(2, "0")} Seconds
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
