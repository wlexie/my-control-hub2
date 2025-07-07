"use client";
import React from "react";
import { ChevronDown, TrendingDown } from "lucide-react";

const data = [
  {
    name: "Mpesa",
    amount: 200,
    percent: 16,
    color: "bg-purple-400",
    text: "text-purple-400",
  },
  {
    name: "Bank",
    amount: 638,
    percent: 21,
    color: "bg-pink-500",
    text: "text-pink-500",
  },
  {
    name: "Card",
    amount: 753,
    percent: 37,
    color: "bg-green-500",
    text: "text-green-500",
  },
  {
    name: "Till Number",
    amount: 148,
    percent: 32,
    color: "bg-blue-500",
    text: "text-blue-500",
  },
  {
    name: "Paybill",
    amount: 10,
    percent: 10,
    color: "bg-yellow-400",
    text: "text-yellow-400",
  },
];

export default function AverageTransactionSize() {
  return (
    <div className="w-full bg-white p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Average Transaction Size by Channel
        </h2>
        <button className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-md">
          January <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="space-y-13">
        {data.map((item, index) => (
          <div key={item.name} className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-medium">{`0${index + 1}.`}</span>
                <span className="text-gray-700 font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-semibold">
                  £{item.amount}
                </span>
                <span
                  className={`text-xs font-semibold ${item.text} bg-gray-100 px-2 py-0.5 rounded-full`}
                >
                  {item.percent}%
                </span>
              </div>
            </div>
            <div className="relative h-2.5 bg-gray-100 rounded-full">
              <div
                className={`absolute top-0 left-0 h-full rounded-full ${item.color}`}
                style={{ width: `${item.percent}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Section */}
      <div className="mt-8 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-1">
          Total Transaction Size All Channels
        </p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">£1,749</span>
          <div className="flex items-center text-xs text-red-500 font-medium bg-red-100 px-1.5 py-0.5 rounded-full">
            <TrendingDown className="w-3 h-3 mr-1" />
            7.6%
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Compared to Last Month</p>
      </div>
    </div>
  );
}
