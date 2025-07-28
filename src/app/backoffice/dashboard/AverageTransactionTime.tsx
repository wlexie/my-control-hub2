"use client";

import React, { useEffect, useState } from "react";

interface TransactionItem {
  name: string;
  time: string;
  color: string;
}

interface Props {
  startDate: Date;
  endDate: Date;
}

export default function AverageTransactionTime({ startDate, endDate }: Props) {
  const [data, setData] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getLabelFromDateRange = (): string => {
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInDays <= 7) return "Weekly";
    if (diffInDays <= 31) return "Monthly";
    return "Custom Range";
  };

  useEffect(() => {
    const fetchProcessingTime = async () => {
      try {
        setLoading(true);
        const formattedStart = startDate.toISOString().split("T")[0];
        const formattedEnd = endDate.toISOString().split("T")[0];

        const res = await fetch(
          `https://api.tuma-app.com/api/analytics/processing-time?startDate=${formattedStart}&endDate=${formattedEnd}`
        );
        if (!res.ok) throw new Error("Network response was not ok");

        const result = await res.json();
        const processingTime = result.processingTime;

        const mappedData: TransactionItem[] = [
          {
            name: "Card",
            time: `${processingTime.cardProcessingTime}`,
            color: "bg-blue-500",
          },
          {
            name: "MPESA",
            time: `${processingTime.mpesaProcessingTime}`,
            color: "bg-purple-500",
          },
          {
            name: "Bank ",
            time: `${processingTime.bankProcessingTime}`,
            color: "bg-indigo-600",
          },
          {
            name: "Paybill ",
            time: `${processingTime.paybillProcessingTime}`,
            color: "bg-red-500",
          },
          {
            name: "Till Number ",
            time: `${processingTime.tillProcessingTime}` || "N/A",
            color: "bg-red-500",
          },
        ];

        setData(mappedData);
      } catch (error) {
        console.error("Failed to fetch processing time:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProcessingTime();
  }, [startDate, endDate]); // trigger fetch when date changes

  return (
    <div className="w-full max-w-3xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-black">
          Average Time To Complete Transactions (Seconds)
        </h2>
        <button className="bg-blue-500 text-white px-3 py-1 text-sm rounded-md">
          {getLabelFromDateRange()}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`w-1.5 h-8 rounded-sm ${item.color}`}></span>
                <div>
                  <p className="text-sm font-semibold text-black">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500 -mt-1">
                    Average time to complete transactions
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-black">{item.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
