"use client";

import { ChevronDown } from "lucide-react";
import HeroSection from "./HeroSection";
import TopNav from "./TopNav";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";

interface HeaderProps {
  currency: string;
  onCurrencyChange: (code: string) => void;
  startDate: Date;
  endDate: Date;
  onDateFilterOpen: () => void;
  dateLabel: string;
}

export default function Header({
  currency,
  onCurrencyChange,
  startDate,
  endDate,
  onDateFilterOpen,
  dateLabel,
}: HeaderProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="relative bg-gradient-to-br to-[#163F8B] from-[#276EF1] text-white pb-8 ">
      <TopNav user={user} />
      <HeroSection currency={currency} onCurrencyChange={onCurrencyChange} />

      <div className="px-4 md:px-12 mt-6">
        {(() => {
          return (
            <h2 className="text-2xl md:text-3xl leading-snug">
              <span className="font-light text-white">Welcome back, </span>
              <span className="font-semibold text-white">
                {user ? `${user.firstName} ${user.lastName}` : "User"}
              </span>
            </h2>
          );
        })()}
      </div>

      <div className="flex flex-col md:items-end md:px-12 px-4 mt-4 space-y-2 md:space-y-1">
        <p className="text-sm text-white/70">
          {startDate.toLocaleDateString("en-GB")} -{" "}
          {endDate.toLocaleDateString("en-GB")}
        </p>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-white/80">Showing</div>
          <button
            onClick={onDateFilterOpen}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md border border-white/20 text-sm text-white"
          >
            {dateLabel} <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
