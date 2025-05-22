"use client";

import { useState } from "react";
import { CustomerRetention } from "./CustomerRetention";
import CustomerSegmentation from "./CustomerSegmentation";
import Header from "./Header";
import LatestTransactions from "./LatestTransactions";
import StatCardsRow from "./StatCardRow";
import { TransactionStatuses } from "./TransactionStatuses";
import TransactionTotalsSection from "./TransactionTotalsSection.tsx";
import AverageTransactionTime from "./AverageTransactionTime";
import DateFilter from "@/app/backoffice/components/DateFilter";

export default function Dashboard() {
  const [currency, setCurrency] = useState("GBP");

  const [startDate, setStartDate] = useState<Date>(new Date("01-01-2020"));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateLabel, setDateLabel] = useState("All Time");

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);

    const diffInDays =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

    if (diffInDays <= 7) setDateLabel("Weekly");
    else if (diffInDays <= 31) setDateLabel("Monthly");
    else setDateLabel("Custom");
  };

  const handleClearDates = () => {
    const allTimeStart = new Date("2020-01-01");
    const today = new Date();
    setStartDate(allTimeStart);
    setEndDate(today);
    setDateLabel("All Time");
  };

  return (
    <main className="bg-[#F5F7FA] font-poppins min-h-screen overflow-x-hidden overflow-y-auto">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        startDate={startDate}
        endDate={endDate}
        onDateFilterOpen={() => setIsDateFilterOpen(true)}
        dateLabel={dateLabel}
      />

      <div className="px-4 sm:px-6 md:px-12 relative z-10 space-y-8">
        <StatCardsRow
          currency={currency}
          startDate={startDate}
          endDate={endDate}
        />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-5">
          <div className="md:col-span-3 bg-white p-4 rounded-2xl">
            <TransactionTotalsSection
              currency={currency}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
          <div className="md:col-span-2 bg-white p-4 rounded-2xl">
            <AverageTransactionTime />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white p-4 rounded-2xl">
            <TransactionStatuses />
          </div>
          <div className="md:col-span-2 bg-white p-4 rounded-2xl">
            <CustomerSegmentation />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl">
          <CustomerRetention />
        </div>

        <div className="bg-white p-4 rounded-2xl">
          <LatestTransactions />
        </div>
      </div>

      {isDateFilterOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-start pt-10">
          <DateFilter
            isOpen={isDateFilterOpen}
            onClose={() => setIsDateFilterOpen(false)}
            onChange={handleDateChange}
            onClear={handleClearDates}
            initialStartDate={startDate}
            initialEndDate={endDate}
          />
        </div>
      )}
    </main>
  );
}
