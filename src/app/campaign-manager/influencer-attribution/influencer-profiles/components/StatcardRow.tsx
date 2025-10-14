import { TrendingUp, TrendingDown } from "lucide-react";
import {
  BsFillPersonCheckFill,
  BsPersonHearts,
  BsPersonFillX,
} from "react-icons/bs";
import { IoRocketSharp } from "react-icons/io5";
const cards = [
  {
    label: "Active Influencers",
    amount: "27",
    change: "+13%",
    positive: true,
    icon: <BsFillPersonCheckFill className="text-blue-700 text-xl" />,
    iconBg: "bg-blue-100",
  },
  {
    label: "Inactive Influencers",
    amount: "15",
    change: "-24%",
    positive: false,
    icon: <BsPersonFillX className="text-red-600 text-xl" />,
    iconBg: "bg-red-100",
  },
  {
    label: "Total Influencers",
    amount: "58",
    change: "+10%",
    positive: true,
    icon: <BsPersonHearts className="text-purple-700 text-xl" />,
    iconBg: "bg-purple-100",
  },
  {
    label: "Total Campaigns",
    amount: "12",
    change: "-09%",
    positive: false,
    icon: <IoRocketSharp className="text-green-700 text-xl" />,
    iconBg: "bg-green-100",
  },
];

export default function StatCardsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4  gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4 transition-all hover:shadow-md"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${card.iconBg}`}>{card.icon}</div>
            <span className="text-gray-700 text-xl font-medium">
              {card.label}
            </span>
          </div>

          {/* Amount */}
          <div className="text-3xl font-semibold text-gray-800">
            {card.amount}
          </div>

          {/* Change indicator */}
          <div className="flex items-center gap-2 text-md">
            <div
              className={`rounded-full p-1.5 ${
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
              className={`font-medium ${
                card.positive ? "text-green-500" : "text-red-500"
              }`}
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
