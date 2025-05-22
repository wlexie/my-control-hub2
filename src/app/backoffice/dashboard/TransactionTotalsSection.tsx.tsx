"use client";

import { useEffect, useState } from "react";
import { Separator } from "../../../components/ui/separator";
import { FaWallet } from "react-icons/fa6";
import { BsCalendar2DateFill, BsFillBarChartLineFill } from "react-icons/bs";
import { TrendingUp } from "lucide-react";
<<<<<<< HEAD
import { CountryTransactions } from "./CountryTransactions";
=======
import { CountryTransactions } from "./CountryTransactions"; 
import useApi from '../../../hooks/useApi'; 
>>>>>>> 09ac05369e9cbbcb07bb8c8528d18818fa2e3c52

interface Props {
  currency: string;
  startDate: Date;
  endDate: Date;
}

<<<<<<< HEAD
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

function TransactionTotalsSection({ currency, startDate, endDate }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formattedStart = startDate.toISOString().split("T")[0];
  const formattedEnd = endDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchTransactionData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.tuma-app.com/api/analytics/transaction-type-summary?currency=${currency}&startDate=${formattedStart}&endDate=${formattedEnd}`
        );
        const json: ApiResponse = await res.json();
        setData(json);
=======
function TransactionTotalsSection() {
  const { get } = useApi(); // Destructure the 'get' method from our hook
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Optional: for error display

  useEffect(() => {
    const fetchTotals = async () => {
      setLoading(true);
      setError(null); // Reset error state
      try {
        // so you only need the endpoint path.
        const responseData = await get<TransactionData>("/analytics/totals");
        setData(responseData);
>>>>>>> 09ac05369e9cbbcb07bb8c8528d18818fa2e3c52
      } catch (err) {
        console.error("Error fetching totals:", err);
        setError("Failed to fetch transaction totals."); // Set an error message
        // You could also check 
      } finally {
        setLoading(false);
      }
    };

<<<<<<< HEAD
    fetchTransactionData();
  }, [currency, formattedStart, formattedEnd]);

  const getTotalAmount = () => {
    if (!data) return 0;

    if (currency === "GBP") {
      return data.analyticsByTransactionType.reduce(
        (sum, item) => sum + item.totalSenderAmount,
        0
      );
    } else {
      return data.analyticsByTransactionType.reduce((sum, item) => {
        const received = item.receiverBreakdown[currency];
        return sum + (received ?? 0);
      }, 0);
    }
  };
=======
    fetchTotals();
  }, [] ); 
>>>>>>> 09ac05369e9cbbcb07bb8c8528d18818fa2e3c52

  const formatAmount = (amount: number) =>
    `${currency === "GBP" ? "£" : "KES"} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

<<<<<<< HEAD
  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

=======
>>>>>>> 09ac05369e9cbbcb07bb8c8528d18818fa2e3c52
  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  const totalAmount = getTotalAmount();

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

        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-black whitespace-nowrap">
<<<<<<< HEAD
            {formatAmount(totalAmount)}
=======
            {loading ? "Loading..." : data ? formatAmount(data.totalAmountTransacted) : "N/A"}
>>>>>>> 09ac05369e9cbbcb07bb8c8528d18818fa2e3c52
          </h1>
          {/* Kept the static growth percentage for now, you might want to fetch this too */}
          {!loading && data && (
             <span className="flex bg-green-100 text-green-600 text-sm rounded-full px-2 py-1 items-center gap-1">
                <TrendingUp className="text-green-600 text-sm" />
                13% {/* This is static, consider making it dynamic if needed */}
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
<<<<<<< HEAD
=======
              {/* This period is static, consider making it dynamic if needed */}
>>>>>>> 09ac05369e9cbbcb07bb8c8528d18818fa2e3c52
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
                {loading ? "Loading..." : data ? data.transactionsCount.toLocaleString() : "N/A"}
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

      {/* Right Section - Placeholder or Graph */}
      <div className="flex justify-center lg:justify-start w-full lg:w-auto">
        <CountryTransactions />
      </div>
    </div>
  );
}

export default TransactionTotalsSection;
