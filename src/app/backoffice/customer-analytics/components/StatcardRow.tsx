import { TrendingUp, TrendingDown } from "lucide-react";

import {
  FaBuilding,
  FaDollarSign,
  FaPhone,
  // FaReceipt,
  FaWallet,
} from "react-icons/fa";
const cards = [
  {
    label: "Total Customers",
    amount: "70,523",
    change: "+13%",
    positive: true,
    icon: (
      <span className="bg-blue-100 rounded-lg p-3 mb-2 ">
        <FaWallet className="text-blue-700 text-xl" />
      </span>
    ),
  },
  {
    label: "Active Customers",
    amount: "20,500",
    change: "-24%",
    positive: false,
    icon: (
      <span className="bg-orange-100 rounded-lg p-3 mb-2">
        <FaDollarSign className="text-orange-700 text-xl" />
      </span>
    ),
  },
  {
    label: "Inactive Customers",
    amount: "10,023",
    change: "+17%",
    positive: true,
    icon: (
      <span className="bg-green-100 rounded-lg p-3 mb-2">
        <FaBuilding className="text-green-700 text-xl" />
      </span>
    ),
  },
  {
    label: "Churned Customers",
    amount: "17,009",
    change: "-09%",
    positive: false,
    icon: (
      <span className="bg-purple-100 rounded-lg p-3 mb-2">
        <FaPhone className="text-purple-700 text-xl" />
      </span>
    ),
  },
];

export default function StatCardsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 ">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white p-10 rounded-xl shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-4">
              {card.icon}
            </div>
            <span className="text-gray-700 text-lg font-medium">
              {card.label}
            </span>
          </div>

          <div className="text-2xl font-semibold text-gray-800">
            {card.amount}
          </div>
          <div className="mt-2 text-md flex items-center space-x-2">
            <div
              className={`rounded-full p-1 ${
                card.positive ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {card.positive ? (
                <TrendingUp size={14} className="text-green-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
            </div>
            <span
              className={`${card.positive ? "text-green-500" : "text-red-500"}`}
            >
              {card.change}
            </span>
            <span className="text-gray-400">vs Last Week</span>
          </div>
        </div>
      ))}
    </div>
  );
}
