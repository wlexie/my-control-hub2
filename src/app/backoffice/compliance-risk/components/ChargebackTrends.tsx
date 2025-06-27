"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const barData = {
  labels: [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ],
  datasets: [
    {
      label: "Chargebacks",
      data: [850, 2700, 2100, 2800, 3400, 2000, 2700, 3900, 1200, 1600, 2700, 1900],
      backgroundColor: "#FDB515",
      borderRadius: 6,
      barThickness: 24,
    },
  ],
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
      align: "end" as const,
      labels: {
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        pointStyle: "circle",
        padding: 20,
        color: "#111",
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          return `Value: £${context.raw}`;
        },
      },
    },
  },
  scales: {
    y: {
      ticks: {
        callback: function (value: any) {
          return value >= 1000 ? `${value / 1000}k` : value;
        },
        font: {
          size: 12,
        },
      },
      grid: {
        drawBorder: false,
        color: "#eee",
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 12,
        },
      },
    },
  },
};

export default function ChargebackTrends() {
  const [filter] = useState("Yearly");

  return (
    <div className="w-full p-4 rounded-lg bg-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800">
            Chargeback Trends
          </h3>
          <p className="text-sm font-medium text-gray-600">2024</p>
        </div>
        <button className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-md">
          {filter} 
        </button>
      </div>

      {/* KPIs */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm font-medium text-gray-700 mb-4">
        <div className="flex items-center gap-2">
          <span>Total Value of Chargebacks:</span>
          <span className="text-[#1D8F6E] font-semibold">£1,680.35</span>
          <span className="flex items-center gap-1 bg-[#E6F4EF] text-[#1D8F6E] text-xs font-semibold px-2 py-0.5 rounded-full">
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#D1FADF]">
              <TrendingUp size={12} />
            </span>
            84% VS Last Year
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span>Total No. of Chargebacks:</span>
          <span className="text-[#F04438] font-semibold">20</span>
          <span className="flex items-center gap-1 bg-[#FEE4E2] text-[#F04438] text-xs font-semibold px-2 py-0.5 rounded-full">
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#FECDCA]">
              <TrendingDown size={12} />
            </span>
            04% VS Last Year
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <div className="h-72 min-w-[640px] md:min-w-0 w-full">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
