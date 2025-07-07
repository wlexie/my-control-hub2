"use client";
import React from "react";
import { ChevronDown } from "lucide-react";

const data = [
  {
    from: "UK",
    to: "Kenya",
    amount: 200,
    percent: 11,
    volume: 500_000,
    transactions: 2500,
    flag: "/backoffice/kenya.png",
  },
  {
    from: "UK",
    to: "S. Africa",
    amount: 180,
    percent: 2,
    volume: 280_100,
    transactions: 1200,
    flag: "/backoffice/sa.png",
  },
  {
    from: "UK",
    to: "Tanzania",
    amount: 200,
    percent: 6,
    volume: 500_000,
    transactions: 2500,
    flag: "/backoffice/tz.png",
  },
  {
    from: "UK",
    to: "Ethiopia",
    amount: 200,
    percent: 8,
    volume: 500_000,
    transactions: 2500,
    flag: "/backoffice/ethiopia.png",
  },
  {
    from: "UK",
    to: "Ghana",
    amount: 1000,
    percent: 3,
    volume: 250_000,
    transactions: 2500,
    flag: "/backoffice/ghana.png",
  },
  {
    from: "UK",
    to: "Malawi",
    amount: 200,
    percent: 12,
    volume: 500_000,
    transactions: 2500,
    flag: "/backoffice/malawi.png",
  },
  {
    from: "UK",
    to: "S. Sudan",
    amount: 300,
    percent: 3,
    volume: 300_000,
    transactions: 1000,
    flag: "/backoffice/ss.png",
  },
  {
    from: "UK",
    to: "Rwanda",
    amount: 250,
    percent: 7,
    volume: 500_000,
    transactions: 2000,
    flag: "/backoffice/rwanda.png",
  },
  {
    from: "UK",
    to: "DRC",
    amount: 200,
    percent: 3,
    volume: 500_000,
    transactions: 2500,
    flag: "/backoffice/drc.png",
  },
  {
    from: "UK",
    to: "Burundi",
    amount: 200,
    percent: 3,
    volume: 500_000,
    transactions: 2500,
    flag: "/backoffice/burundi.png",
  },
];

export default function AverageTransactionByCorridor() {
  return (
    <div className="bg-white p-6 rounded-xl w-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Average Transaction Size by Country
        </h2>
        <button className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-md">
          March <ChevronDown className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Country</th>
              <th className="px-4 py-3 font-medium">Transaction Size</th>
              <th className="px-4 py-3 font-medium">Transaction Volume</th>
              <th className="px-4 py-3 font-medium">No. of Transactions</th>
              <th className="px-4 py-3 font-medium">Percentage</th>
            </tr>
          </thead>
          <tbody className="text-gray-800">
            {data.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3 whitespace-nowrap flex items-center gap-2">
                  <img
                    src={item.flag}
                    alt={item.to}
                    className="w-5 h-4 rounded-sm"
                  />
                  <span className="font-medium">
                    {item.from} to {item.to}
                  </span>
                </td>
                <td className="px-4 py-3">£{item.amount.toLocaleString()}</td>
                <td className="px-4 py-3">£{item.volume.toLocaleString()}</td>
                <td className="px-4 py-3">
                  {item.transactions.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {item.percent.toString().padStart(2, "0")}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-1">
          Total Transaction Size All Countries
        </p>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">£2,850</span>
          <div className="flex items-center text-xs text-red-500 font-semibold bg-red-100 px-2 py-0.5 rounded-full">
            🔻16%
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1">Compared to Last Month</p>
      </div>
    </div>
  );
}
