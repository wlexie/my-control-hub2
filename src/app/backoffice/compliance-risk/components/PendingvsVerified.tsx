"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Verified", "Pending"],
  datasets: [
    {
      data: [378, 171],
      backgroundColor: ["#463DE8", "#FDB515"], // Purple, Yellow
      borderWidth: 0,
      cutout: "80%",
    },
  ],
};

const options = {
  cutout: "80%",
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  maintainAspectRatio: false,
};

export default function PendingVsVerified() {
  const [filter] = useState("Monthly");

  return (
    <div className="w-full max-w-xs mx-auto p-4">
      {/* Title & Filter Button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-gray-800">
          Pending vs. Verified
        </h3>
        <button className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-md">
          {filter} 
        </button>
      </div>

      {/* Donut Chart */}
      <div className="relative h-64 w-64 mx-auto">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xl font-bold">549</p>
          <p className="text-xs text-gray-500">Total Customers</p>
        </div>
      </div>

      {/* Legends */}
      <div className="flex justify-center mt-4 text-xs font-medium gap-6">
        <div className="flex items-center gap-2 text-[#463DE8]">
          <span className="w-2 h-2 rounded-full bg-[#463DE8] inline-block"></span>
          Verified <span className="font-semibold ml-1 text-black">378</span> ·
          69%
        </div>
        <div className="flex items-center gap-2 text-[#FDB515]">
          <span className="w-2 h-2 rounded-full bg-[#FDB515] inline-block"></span>
          Pending <span className="font-semibold ml-1 text-black">171</span> ·
          41%
        </div>
      </div>
    </div>
  );
}
