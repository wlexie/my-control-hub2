"use client";

import { useState } from "react";
import Header from "./components/Header";
import DateFilter from "@/app/backoffice/components/DateFilter";
import StatCardsRow from "./components/StatcardRow";
import TableGraph from "./components/TableGraph";
import ROTs from "./components/ROTs";
import TopInfluencers from "./components/TopInfluencers";
import CodeType from "./components/CodeType";

export default function Dashboard() {
  const [currency, setCurrency] = useState("GBP");
  const [startDate, setStartDate] = useState<Date>(new Date(2024, 10, 20));
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
    const allTimeStart = new Date(2024, 10, 20);
    const today = new Date();
    setStartDate(allTimeStart);
    setEndDate(today);
    setDateLabel("All Time");
  };

  return (
    <main className="bg-[#F5F7FA] dark:bg-gray-900 font-poppins min-h-screen overflow-x-hidden overflow-y-auto text-gray-900 dark:text-gray-100">
      {/* Header */}
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        startDate={startDate}
        endDate={endDate}
        onDateFilterOpen={() => setIsDateFilterOpen(true)}
        dateLabel={dateLabel}
      />

      <div className="px-4 sm:px-6 md:px-12 relative z-10 space-y-8">
        <div className="mt-3">
          <StatCardsRow />
        </div>
        <div className="flex flex-col space-y-8">
          <div className="bg-white p-4 rounded-2xl ">
            <TableGraph />
          </div>

          <ROTs />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
            <div className="md:col-span-3 bg-white dark:bg-gray-800 p-4 rounded-2xl">
              <TopInfluencers />
            </div>
            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-4 rounded-2xl ">
              <CodeType />
            </div>
          </div>
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
