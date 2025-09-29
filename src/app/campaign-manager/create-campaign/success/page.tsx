"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../../usage-tracking/components/Header";
import DateFilter from "@/app/backoffice/components/DateFilter";

export default function CampaignSuccess() {
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

      <div className="px-4 sm:px-6 md:px-12 relative z-10 flex justify-center mt-10">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/campaigns/success.png"
              alt="Campaign Success"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🎉 Campaign Launched Successfully
          </h1>

          <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-8">
            Your campaign is now active and assigned to the selected
            influencer(s). You can track performance and redemptions in the
            Campaign Dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <button className="px-6 py-3 rounded-lg bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 transition w-full sm:w-auto">
                Back to Dashboard
              </button>
            </Link>
            <Link href="/campaign-manager/create-campaign">
              <button className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition w-full sm:w-auto">
                Launch Another Campaign
              </button>
            </Link>
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
