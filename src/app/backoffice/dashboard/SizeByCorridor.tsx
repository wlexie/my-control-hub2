"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const data = [
  {
    from: "UK",
    to: "Kenya",
    amount: 200,
    percent: 51,
    color: "bg-green-700",
    pillColor: "bg-green-100 text-green-700",
    flag: "/backoffice/kenya.png",
  },
  {
    from: "UK",
    to: "Uganda",
    amount: 51,
    percent: 5,
    color: "bg-yellow-400",
    pillColor: "bg-yellow-100 text-yellow-600",
    flag: "/backoffice/uganda.png",
  },
  {
    from: "UK",
    to: "Tanzania",
    amount: 69,
    percent: 11,
    color: "bg-sky-500",
    pillColor: "bg-sky-100 text-sky-600",
    flag: "/backoffice/tz.png",
  },
  {
    from: "UK",
    to: "Burundi",
    amount: 72,
    percent: 13,
    color: "bg-red-700",
    pillColor: "bg-red-100 text-red-600",
    flag: "/backoffice/burundi.png",
  },
  {
    from: "UK",
    to: "DRC",
    amount: 102,
    percent: 14,
    color: "bg-cyan-500",
    pillColor: "bg-cyan-100 text-cyan-600",
    flag: "/backoffice/drc.png",
  },
  {
    from: "UK",
    to: "Ethiopia",
    amount: 26,
    percent: 21,
    color: "bg-blue-700",
    pillColor: "bg-blue-100 text-blue-600",
    flag: "/backoffice/ethiopia.png",
  },
  {
    from: "UK",
    to: "Ghana",
    amount: 20,
    percent: 18,
    color: "bg-red-500",
    pillColor: "bg-red-100 text-red-500",
    flag: "/backoffice/ghana.png",
  },
  {
    from: "UK",
    to: "Malawi",
    amount: 98,
    percent: 28,
    color: "bg-green-600",
    pillColor: "bg-green-100 text-green-700",
    flag: "/backoffice/malawi.png",
  },
  {
    from: "UK",
    to: "Mozambique",
    amount: 200,
    percent: 13,
    color: "bg-black",
    pillColor: "bg-gray-100 text-gray-700",
    flag: "/backoffice/mozambique.png",
  },
  {
    from: "UK",
    to: "Rwanda",
    amount: 70,
    percent: 16,
    color: "bg-yellow-300",
    pillColor: "bg-yellow-100 text-yellow-700",
    flag: "/backoffice/rwanda.png",
  },
  {
    from: "UK",
    to: "South Africa",
    amount: 100,
    percent: 9,
    color: "bg-green-500",
    pillColor: "bg-green-100 text-green-700",
    flag: "/backoffice/sa.png",
  },
  {
    from: "UK",
    to: "South Sudan",
    amount: 85,
    percent: 7,
    color: "bg-sky-300",
    pillColor: "bg-sky-100 text-sky-700",
    flag: "/backoffice/ss.png",
  },
];

export default function AverageTransactionByCorridor() {
  const [animatedWidths, setAnimatedWidths] = useState<number[]>([]);

  useEffect(() => {
    // Animate bars after mount
    const timeouts = data.map((_, i) =>
      setTimeout(() => {
        setAnimatedWidths((prev) => {
          const next = [...prev];
          next[i] = data[i].percent;
          return next;
        });
      }, i * 80)
    );
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl  max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Average Transaction Size by Corridor
        </h2>
        <button className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-md">
          March <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((item, index) => (
          <div
            key={index}
            className="space-y-2 p-3 rounded-md hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100"
          >
            <div className="flex items-center gap-2 text-sm">
              <img
                src={item.flag}
                alt={item.to}
                className="w-5 h-4 rounded-sm"
              />
              <span className="text-gray-800 font-medium">
                {item.from} to {item.to}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-semibold text-sm">
                £{item.amount}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.pillColor}`}
              >
                {item.percent}%
              </span>
            </div>

            <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full ${item.color} transition-all duration-700 ease-out`}
                style={{ width: `${animatedWidths[index] || 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total Section */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-1">
          Total Transaction Size All Corridors
        </p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">£1,269</span>
          <div className="flex items-center text-xs text-red-500 font-semibold bg-red-100 px-2 py-0.5 rounded-full">
            🔻16%
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Compared to Last Month</p>
      </div>
    </div>
  );
}
