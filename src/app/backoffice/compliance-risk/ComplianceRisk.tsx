"use client";

import { useState } from "react";
import Header from "../dashboard/Header";
import ChargebackTrends from "./components/ChargebackTrends";
import FlaggedTransactionsChart from "./components/FlaggedTransactionsChart";
import FraudGraph from "./components/FraudGraph";
import KYCVerificationStats from "./components/KYCVerificationStats";
import PendingVsVerified from "./components/PendingvsVerified";
import RegulatoryTransactionsChart from "./components/RegulatoryTransactionsCharts";
import DateFilter from "@/app/backoffice/components/DateFilter";

export default function ComplianceRisk() {
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

      <div className="px-6 md:px-12 relative z-2">
        <div className="flex flex-col space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch justify-center mt-5">
  <div className="md:col-span-3 bg-white p-4 rounded-2xl">
    <FraudGraph />
  </div>
  <div className="md:col-span-2 bg-white p-4 rounded-2xl">
    <PendingVsVerified />
  </div>
</div>


          <div className="bg-white p-4 rounded-2xl">
            <ChargebackTrends />
          </div>

          <div className="bg-white p-4 rounded-2xl">
            <RegulatoryTransactionsChart />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch justify-center mt-5">
  <div className="md:col-span-3 bg-white p-4 rounded-2xl">
    <FlaggedTransactionsChart />
  </div>
  <div className="md:col-span-2 bg-white p-4 rounded-2xl">
    <KYCVerificationStats/>
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
