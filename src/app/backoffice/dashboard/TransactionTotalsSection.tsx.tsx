"use client";

import { useEffect, useState } from "react";
import { Separator } from "../../../components/ui/separator";
import { FaWallet } from "react-icons/fa6";
import { BsCalendar2DateFill, BsFillBarChartLineFill } from "react-icons/bs";
import { TrendingUp } from "lucide-react";
import { CountryTransactions } from "./CountryTransactions";

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

function TransactionTotalsSection({ currency, startDate, endDate }: Props) {
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
    const fetchTransactionData = async () => {
      setLoading(true);
      try {
        setData(null);

        const res = await fetch(
          `https://api.tuma-app.com/api/analytics/transaction-type-summary?currency=GBP&startDate=${formattedStart}&endDate=${formattedEnd}`
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const json: ApiResponse = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching totals:", err);
        setError("Failed to fetch transaction totals.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [formattedStart, formattedEnd]); // Using formatted dates as dependencies

  const getTotalAmount = () => {
    if (!data || !data.analyticsByTransactionType) return 0;

    if (currency === "GBP") {
      // Sum up totalSenderAmount from all transaction types for GBP
      return data.analyticsByTransactionType.reduce(
        (sum, item) => sum + (item.totalSenderAmount || 0),
        0
      );
    } else {
      // For KES, sum up receiverBreakdown values
      return data.analyticsByTransactionType.reduce((sum, item) => {
        const receiverAmount = item.receiverBreakdown[currency];
        return sum + (receiverAmount || 0);
      }, 0);
    }
  };

  const formatAmount = (amount: number) => {
    const symbol = currency === "GBP" ? "£" : "KES ";
    return `${symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Calculating percentage change only if available
  const getPercentageChange = () => {
    if (!data || !data.analyticsByTransactionType.length) return null;

    // Finding the first transaction type with a percentage change
    const itemWithChange = data.analyticsByTransactionType.find(
      (item) => item.percentageChange !== undefined
    );

    return itemWithChange?.percentageChange || null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const transactionsCount = data?.transactionsCount || 0;
  const percentageChange = getPercentageChange();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between px-4 gap-8 lg:gap-16 w-full">
      {/* Left Section */}
      <div className="space-y-6 w-full lg:w-auto">
        <div className="flex items-center gap-4">
          <span className="bg-blue-100 rounded-lg p-3">
            <FaWallet className="text-blue-700 text-xl" />
          </span>
          <h1 className="text-black font-semibold text-lg lg:text-xl">
            Total Transactions
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-black whitespace-nowrap">
            {formatAmount(totalAmount)}
          </h1>
          {percentageChange !== null && (
            <span
              className={`flex ${
                percentageChange >= 0
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              } text-sm rounded-full px-2 py-1 items-center gap-1`}
            >
              <TrendingUp
                className={`text-sm ${
                  percentageChange < 0 ? "transform rotate-180" : ""
                }`}
              />
              {Math.abs(percentageChange).toFixed(2)}%
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6 mt-10">
          {/* Date Period */}
          <div className="flex items-center gap-3">
            <span className="bg-yellow-100 rounded-lg p-2">
              <BsCalendar2DateFill className="text-yellow-500 text-lg" />
            </span>
            <div className="flex flex-col">
              <p className="text-gray-400 font-normal text-xs">
                For the period
              </p>
              <p className="text-gray-800 font-medium text-xs">
                {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}
              </p>
            </div>
          </div>

          {/* Transaction Count */}
          <div className="flex items-center gap-3">
            <span className="bg-purple-100 rounded-lg p-2">
              <BsFillBarChartLineFill className="text-purple-800 text-lg" />
            </span>
            <div className="flex flex-col">
              <p className="text-gray-400 font-normal text-xs">
                No. of Transactions
              </p>
              <p className="text-gray-800 font-medium text-xs">
                {transactionsCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Divider */}
      <Separator
        orientation="vertical"
        className="hidden lg:block h-64 w-[2px] bg-gray-300"
      />

      {/* Right Section - Graph */}
      <div className="flex justify-center lg:justify-start w-full lg:w-auto">
        <CountryTransactions />
      </div>
    </div>
  );
}

export default TransactionTotalsSection;
