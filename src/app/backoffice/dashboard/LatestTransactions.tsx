"use client";

import { useEffect, useState } from "react";
import { Transaction } from "../types/transactions";
import { format } from "date-fns";
import Link from "next/link";
import useApi from "../../../hooks/useApi";

// Utility: Random pastel background
const pastelColors = [
  "bg-pink-200",
  "bg-purple-200",
  "bg-blue-200",
  "bg-green-200",
  "bg-yellow-200",
  "bg-orange-200",
  "bg-teal-200",
  "bg-indigo-200",
  "bg-rose-200",
  "bg-lime-200",
];

const getRandomPastel = (name: string) => {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    pastelColors.length;
  return pastelColors[index];
};

export default function LatestTransactions() {
  const api = useApi();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getStatusStyle = (status: string) => {
    const normalizedStatus = status === "ERROR" ? "FAILED" : status;
    const styles: Record<string, string> = {
      SUCCESS: "text-green-700 bg-green-100",
      PENDING: "text-yellow-800 bg-yellow-100",
      FAILED: "text-red-700 bg-red-100",
      CREATED: "text-orange-700 bg-orange-100",
      REFUNDED: "text-purple-700 bg-purple-100",
      "Under Review": "text-blue-700 bg-blue-100",
      REJECTED: "text-red-700 bg-red-100",
      ESCALATED: "text-amber-800 bg-amber-100",
    };
    return styles[normalizedStatus] || "text-gray-700 bg-gray-100";
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await api.get<Transaction[]>(
          "/transfer/all-transactions",
          {
            params: {
              page: 1,
              size: 5,
            },
          }
        );

        if (Array.isArray(data)) {
          const sorted = data.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setTransactions(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch latest transactions:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch transactions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-4">
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Latest Transactions</h2>
        <Link href="/backoffice/transactions">
          <button className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            View all
          </button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="px-6 py-3">Sender</th>
              <th className="px-6 py-3">Sender Amount</th>
              <th className="px-6 py-3">Sender Currency</th>
              <th className="px-6 py-3">Recipient</th>
              <th className="px-6 py-3">Recipient Amount</th>
              <th className="px-6 py-3">Destination Currency</th>
              <th className="px-6 py-3">Transaction Type</th>
              <th className="px-6 py-3">Time (GMT)</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr
                  key={tx.transactionId}
                  className="border-b last:border-none text-gray-700"
                >
                  <td className="flex items-center gap-2 py-3 px-6">
                    <div
                      className={`text-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-medium ${getRandomPastel(
                        tx.senderName
                      )}`}
                    >
                      {getInitials(tx.senderName)}
                    </div>
                    <span>{tx.senderName || "N/A"}</span>
                  </td>
                  <td className="px-6 py-4">{tx.senderAmount || "N/A"}</td>
                  <td className="px-6 py-4">{tx.currencyIso3a || "N/A"}</td>
                  <td className="flex items-center gap-2 py-3 px-6">
                    <div
                      className={`text-gray-800 w-8 h-8 rounded-full flex items-center justify-center font-medium ${getRandomPastel(
                        tx.receiverName ?? ""
                      )}`}
                    >
                      {getInitials(tx.receiverName ?? "")}
                    </div>
                    <span>{tx.receiverName || "N/A"}</span>
                  </td>
                  <td className="px-6 py-4">{tx.recipientAmount || "N/A"}</td>
                  <td className="px-6 py-4">
                    {tx.receiverCurrencyIso3a || "N/A"}
                  </td>
                  <td className="px-6 py-4">{tx.transactionType || "N/A"}</td>
                  <td className="px-6 py-4">
                    {format(new Date(tx.date), "dd MMM yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-lg ${getStatusStyle(
                        tx.status
                      )}`}
                    >
                      {tx.status === "ERROR" ? "FAILED" : tx.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
