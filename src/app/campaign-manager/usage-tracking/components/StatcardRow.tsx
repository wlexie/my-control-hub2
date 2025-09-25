import { TrendingUp, TrendingDown } from "lucide-react";

import { FaTags } from "react-icons/fa";
import { RiPassExpiredFill } from "react-icons/ri";
import { GrSync } from "react-icons/gr";
import { FaCrown } from "react-icons/fa";
import { PiTrayArrowDownFill } from "react-icons/pi";
const cards = [
  {
    label: "Active Codes",
    amount: "2,523",
    change: "+13%",
    positive: true,
    icon: (
      <span className="bg-blue-100 rounded-lg p-3 mb-2 ">
        <FaTags className="text-blue-700 text-xl" />
      </span>
    ),
  },
  {
    label: "Expired Codes",
    amount: "20,500",
    change: "-24%",
    positive: false,
    icon: (
      <span className="bg-orange-100 rounded-lg p-3 mb-2">
        <RiPassExpiredFill className="text-orange-400 text-xl" />
      </span>
    ),
  },
  {
    label: "Total Redemptions",
    amount: "1,023",
    change: "+17%",
    positive: true,
    icon: (
      <span className="bg-green-100 rounded-lg p-3 mb-2">
        <GrSync className="text-green-700 text-xl font-extrabold" />
      </span>
    ),
  },
  {
    label: "Total Influencers",
    amount: "123",
    change: "-09%",
    positive: false,
    icon: (
      <span className="bg-purple-100 rounded-lg p-3 mb-2">
        <FaCrown className="text-purple-700 text-xl" />
      </span>
    ),
  },
  {
    label: "Total Payouts",
    amount: "£1,760",
    change: "+15%",
    positive: true,
    icon: (
      <span className="bg-blue-100 rounded-lg p-3 mb-2">
        <PiTrayArrowDownFill className="text-blue-400 text-xl" />
      </span>
    ),
  },
];

export default function StatCardsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 ">
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
