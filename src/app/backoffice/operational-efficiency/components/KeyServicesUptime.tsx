"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import React from "react";

const services = [
  {
    name: "Payment Processing",
    percentage: 98,
    change: "+47% Increase",
    ringColor: "#FACC15",
    changeColor: "text-green-600",
    changeBg: "bg-green-100",
    type: "increase",
  },
  {
    name: "FX Rates API",
    percentage: 94,
    change: "+07% Increase",
    ringColor: "#9CA3AF",
    changeColor: "text-green-600",
    changeBg: "bg-green-100",
    type: "increase",
  },
  {
    name: "System Interconnectivity",
    percentage: 93,
    change: "-01% Decrease",
    ringColor: "#22C55E",
    changeColor: "text-red-600",
    changeBg: "bg-red-100",
    type: "decrease",
  },
  {
    name: "Support & Maintenance",
    percentage: 99,
    change: "+02% Increase",
    ringColor: "#3B82F6",
    changeColor: "text-green-600",
    changeBg: "bg-green-100",
    type: "increase",
  },
];

function ProgressRing({
  radius = 24,
  stroke = 6,
  progress = 0,
  color = "#000",
}) {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#E5E7EB"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

export default function KeyServicesUptime() {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#0F172A]">
          Percentage Uptime Of Key Services
        </h3>
        <button className="flex items-center text-sm px-4 py-1.5 bg-[#2563EB] text-white rounded-md font-medium shadow-sm">
          Weekly 
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="flex items-center justify-between sm:justify-start sm:space-x-4"
          >
            <div className="flex flex-col">
              <p className="text-sm font-medium text-[#0F172A]">
                {service.name}
              </p>
              <p className="text-2xl font-bold text-[#0F172A] mt-1">
                {service.percentage}%
              </p>
              <div
                className={`text-xs mt-2 px-2 py-1 rounded-full font-medium flex items-center w-fit ${service.changeColor} ${service.changeBg}`}
              >
                {service.type === "increase" ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                )}
                {service.change}
              </div>
            </div>
            <div className="ml-17">
              <ProgressRing
                radius={28}
                stroke={8}
                progress={service.percentage}
                color={service.ringColor}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
