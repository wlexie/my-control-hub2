"use client";

import { useState } from "react";
import Header from "../dashboard/Header";
import { Breakout } from "./components/BreakOut";
import KeyServicesUptime from "./components/KeyServicesUptime";
import { OpenvsResolved } from "./components/OpenvsResolved";
import SupportIssues from "./components/SupportIssues";
import AverageTimeChart from "./components/AverageTimeChart";
import DowntimeIncidentsChart from "./components/DownTime";
import DateFilter from "@/app/backoffice/components/DateFilter";

export default function Operations() {
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
    <main className="bg-[#F5F7FA] font-poppins min-h-screen overflow-x-hidden overflow-y-auto">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        startDate={startDate}
        endDate={endDate}
        onDateFilterOpen={() => setIsDateFilterOpen(true)}
        dateLabel={dateLabel}
      />

      <div className="p-4 border-0 shadow-none">
        <KeyServicesUptime />
      </div>

      <div className="grid grid-cols-5 gap-6 px-4">
        <div className="col-span-3 bg-white p-4 rounded-2xl h-full flex flex-col mt-4">
          <OpenvsResolved />
        </div>
        <div className="col-span-2 bg-white p-4 rounded-2xl h-full flex flex-col mt-4">
          <SupportIssues />
        </div>
      </div>

      <div className="p-4 border-0 shadow-none mt-6">
        <Breakout />
      </div>

      <div className="grid grid-cols-5 gap-6 px-4">
        <div className="col-span-3 bg-white p-4 rounded-2xl h-full flex flex-col mt-4">
          <AverageTimeChart />
        </div>
        <div className="col-span-2 bg-white p-4 rounded-2xl h-full flex flex-col mt-4">
          <DowntimeIncidentsChart />
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
