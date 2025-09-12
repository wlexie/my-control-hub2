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
  percentageChange?: number;
}

interface ApiResponse {
  transactionsCount: number;
  senderCurrency: string;
  comparisonPeriod: string;
  analyticsByTransactionType: AnalyticsItem[];
}

export default function StatCardsRow({ currency, startDate, endDate }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format dates to YYYY-MM-DD (without time) for API
  const formatDateForAPI = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formattedStart = formatDateForAPI(startDate);
  const formattedEnd = formatDateForAPI(endDate);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Reset data when dates change to avoid showing stale data
        setData(null);

        const res = await fetch(
          `https://api.tuma-app.com/api/analytics/transaction-type-summary?currency=GBP&startDate=${formattedStart}&endDate=${formattedEnd}`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch transaction summary:", err);
        setError("Failed to fetch transaction data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [formattedStart, formattedEnd]);

  const getAmount = (type: string) => {
    if (!data || !data.analyticsByTransactionType) return 0;

    const item = data.analyticsByTransactionType.find(
      (d) => d.transactionType === type
    );
    if (!item) return 0;

    if (currency === "GBP") return item.totalSenderAmount || 0;

    const receiverAmount = item.receiverBreakdown[currency];
    return receiverAmount || 0;
  };

  // Get percentage change from API if available
  const getPercentageChange = (type: string) => {
    if (!data || !data.analyticsByTransactionType) return null;

    const item = data.analyticsByTransactionType.find(
      (d) => d.transactionType === type
    );

    return item?.percentageChange || null;
  };

  const formatAmount = (amount: number) => {
    const symbol = currency === "GBP" ? "£" : "KES ";
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Define card configurations
  const cards = [
    {
      type: "CARD_TO_MPESA",
      label: "Card-to-MPESA",
      icon: (
        <span className="bg-orange-100 rounded-lg p-3 mb-2 flex items-center justify-center">
          <FaSimCard className="text-orange-400 text-xl" />
        </span>
      ),
    },
    {
      type: "CARD_TO_PAYBILL",
      label: "Card-to-Paybill",
      icon: (
        <span className="bg-blue-100 rounded-lg p-3 mb-2">
          <FaReceipt className="text-blue-700 text-xl" />
        </span>
      ),
    },
    {
      type: "CARD_TO_BANK",
      label: "Card-to-Bank",
      icon: (
        <span className="bg-green-100 rounded-lg p-3 mb-2">
          <FaBuildingColumns className="text-green-700 text-xl" />
        </span>
      ),
    },
    {
      type: "CARD_TO_CARD",
      label: "Card-to-Card",
      icon: (
        <span className="bg-blue-100 rounded-lg p-3 mb-2 ">
          <FaWallet className="text-blue-700 text-xl" />
        </span>
      ),
    },
    {
      type: "CARD_TO_NETWORK",
      label: "Card-to-Networks",
      icon: (
        <span className="bg-purple-100 rounded-lg p-3 mb-2">
          <FaPhone className="text-purple-700 text-xl" />
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((_, i) => (
          <div
            key={i}
            className="bg-white p-10 rounded-xl shadow-sm flex flex-col justify-between animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  const getComparisonLabel = (startDate: Date, endDate: Date): string => {
    const isSameDay = startDate.toDateString() === endDate.toDateString();

    if (isSameDay) {
      return "vs Yesterday";
    }

    // Check if the range is selected as weekly
    const diffInDays =
      Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    if (diffInDays === 7) {
      return "vs Last Week";
    }

    // Checking if it is a full month
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    const isFullMonth =
      startDate.getDate() === 1 &&
      new Date(endYear, endMonth + 1, 0).getDate() === endDate.getDate() &&
      startMonth === endMonth &&
      startYear === endYear;

    if (isFullMonth) {
      return "vs Last Month";
    }

    // Checking if it is a full year
    const isFullYear =
      startDate.getMonth() === 0 &&
      startDate.getDate() === 1 &&
      endDate.getMonth() === 11 &&
      endDate.getDate() === 31 &&
      startYear === endYear;

    if (isFullYear) {
      return "vs Last Year";
    }

    return "vs Previous Period";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, i) => {
        const amount = getAmount(card.type);
        const percentageChange = getPercentageChange(card.type);
        const hasChangeData = percentageChange !== null;
        const isPositive = hasChangeData ? percentageChange >= 0 : true;
        const changeText = hasChangeData
          ? `${isPositive ? "+" : ""}${percentageChange.toFixed(0)}%`
          : "N/A";

        return (
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
              {formatAmount(amount)}
            </div>
            <div className="mt-2 text-md flex items-center space-x-2">
              {hasChangeData && (
                <>
                  <div
                    className={`rounded-full p-1 ${
                      isPositive ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp size={14} className="text-green-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                  </div>
                  <span
                    className={isPositive ? "text-green-500" : "text-red-500"}
                  >
                    {changeText}
                  </span>
                </>
              )}
              <span className="text-gray-400 text-sm">
                {hasChangeData
                  ? getComparisonLabel(startDate, endDate)
                  : "No comparison data"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
