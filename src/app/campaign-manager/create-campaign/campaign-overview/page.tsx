"use client";

import { useEffect, useState } from "react";
import CampaignOverview from "./CampaignOverview";
import Header from "@/app/campaign-manager/usage-tracking/components/Header";
import DateFilter from "@/app/backoffice/components/DateFilter";

export interface CampaignData {
  campaignName: string;
  objective: string;
  targetAudience: string;
  budget: number;
  startDate: string;
  endDate: string;
  description: string;
}

export default function CampaignOverviewPage() {
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [currency, setCurrency] = useState("GBP");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateLabel, setDateLabel] = useState("All Time");

  useEffect(() => {
    const storedData = sessionStorage.getItem("campaignData");
    if (storedData) setCampaignData(JSON.parse(storedData));
  }, []);

  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setDateLabel("Custom");
  };

  if (!campaignData)
    return (
      <main className="min-h-screen flex justify-center items-center text-gray-500">
        Loading campaign details...
      </main>
    );

  return (
    <main className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <Header
        currency={currency}
        onCurrencyChange={setCurrency}
        startDate={startDate}
        endDate={endDate}
        onDateFilterOpen={() => setIsDateFilterOpen(true)}
        dateLabel={dateLabel}
      />

      <div className="px-4 sm:px-6 md:px-12 py-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow">
          <CampaignOverview />
        </div>
      </div>

      {isDateFilterOpen && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-center items-start pt-10">
          <DateFilter
            isOpen={isDateFilterOpen}
            onClose={() => setIsDateFilterOpen(false)}
            onChange={handleDateChange}
            initialStartDate={startDate}
            initialEndDate={endDate}
          />
        </div>
      )}
    </main>
  );
}
