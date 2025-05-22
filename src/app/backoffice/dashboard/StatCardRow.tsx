// StatCardRow.tsx
"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { FaPhone, FaReceipt, FaSimCard, FaWallet } from "react-icons/fa";
import { FaBuildingColumns } from "react-icons/fa6";

interface Props {
  currency: string;
  startDate: Date;
  endDate: Date;
}

interface ReceiverBreakdown {
  [key: string]: number;
}

interface AnalyticsItem {
  transactionType: string;
  totalSenderAmount: number;
  receiverBreakdown: ReceiverBreakdown;
}

interface ApiResponse {
  transactionsCount: number;
  senderCurrency: string;
  analyticsByTransactionType: AnalyticsItem[];
}

export default function StatCardsRow({ currency }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.tuma-app.com/api/analytics/transaction-type-summary?currency=${currency}`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch transaction summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currency]);

  const getAmount = (type: string) => {
    const item = data?.analyticsByTransactionType.find(
      (d) => d.transactionType === type
    );
    if (!item) return 0;
    if (currency === "GBP") return item.totalSenderAmount;
    const receiverAmount = item.receiverBreakdown[currency];
    return receiverAmount ?? 0;
  };

  const formatAmount = (amount: number) =>
    `${currency === "GBP" ? "£" : "KES"} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  const cards = [
    {
      label: "MPESA",
      amount: formatAmount(getAmount("CARD_TO_MPESA")),
      change: "-24%",
      positive: false,
      icon: (
        <span className="bg-orange-100 rounded-lg p-3 mb-2 flex items-center justify-center">
          <FaSimCard className="text-orange-400 text-xl" />
        </span>
      ),
    },
    {
      label: "Paybill",
      amount: formatAmount(getAmount("CARD_TO_PAYBILL")),
      change: "+27%",
      positive: true,
      icon: (
        <span className="bg-blue-100 rounded-lg p-3 mb-2">
          <FaReceipt className="text-blue-700 text-xl" />
        </span>
      ),
    },
    {
      label: "Bank",
      amount: formatAmount(getAmount("CARD_TO_BANK")),
      change: "+17%",
      positive: true,
      icon: (
        <span className="bg-green-100 rounded-lg p-3 mb-2">
          <FaBuildingColumns className="text-green-700 text-xl" />
        </span>
      ),
    },
    {
      label: "Card",
      amount: formatAmount(getAmount("CARD_TO_CARD")),
      change: "+13%",
      positive: true,
      icon: (
        <span className="bg-blue-100 rounded-lg p-3 mb-2 ">
          <FaWallet className="text-blue-700 text-xl" />
        </span>
      ),
    },
    {
      label: "Till Number",
      amount: formatAmount(0),
      change: "-09%",
      positive: false,
      icon: (
        <span className="bg-purple-100 rounded-lg p-3 mb-2">
          <FaPhone className="text-purple-700 text-xl" />
        </span>
      ),
    },
  ];

  if (loading) {
    return <div className="text-center p-4">Loading statistics...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white p-10 rounded-xl shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center">
              {card.icon}
            </div>
            <div className="text-gray-700 text-base font-medium ml-4">
              {card.label}
            </div>
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
