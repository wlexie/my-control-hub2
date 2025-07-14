"use client";

import { ChevronDown } from "lucide-react";
import HeroSection from "./HeroSection";
import TopNav from "./TopNav";
import { usePathname } from "next/navigation";
import { sidebarMenuItems } from "../constants/sidebarMenuItems"; // Assuming this is the correct path
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store"; // Assuming this is the correct path

interface SidebarMenuItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

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
  const pathname = usePathname();

  const pageTitles: Record<string, string> = {
    "/backoffice/dashboard": "Welcome back",
    "/backoffice/financial-metrics": "Financial Metrics & Revenue Performance",
    "/backoffice/customer-analytics": "Customer Analytics",
    "/backoffice/compliance-risk": "Compliance & Risk Management",
    "/backoffice/operational-efficiency": "Operational Efficiency",
  };

  const currentTitle = pageTitles[pathname] || "Dashboard";

  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user ? `${user.firstName} ${user.lastName}` : null;

  // <-- 1. ADD LOGIC TO FILTER MENU ITEMS -->
  const getVisibleMenuItems = () => {
    // If the user is not logged in, show no menu items.
    if (!user) {
      return [];
    }

    // If user's role is 'BACKOFFICE', only show the 'Transactions' link.
    if (user.roles.includes("BACKOFFICE")) {
      return sidebarMenuItems.filter(
        (item) => item.label === "Transactions"
      );
    }

    // For all other logged-in users, show all menu items.
    return sidebarMenuItems;
  };

  const visibleMenuItems = getVisibleMenuItems();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative bg-gradient-to-br to-[#15449d] from-[#0162ff] text-white pb-8 ">
      <TopNav user={user} />
      <HeroSection currency={currency} onCurrencyChange={onCurrencyChange} />

      <div className="absolute -bottom-4 left-6 z-50" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="bg-white text-blue-600 p-2 rounded-full shadow-md focus:outline-none"
        >
          <img
            src="/backoffice/grid-icon.png"
            alt="Menu Icon"
            className="w-6 h-6"
          />
        </button>

        {menuOpen && (
          <div className="absolute left-6 mt-2 w-64 bg-white shadow-xl rounded-lg py-2 z-50">
            {/* <-- 2. RENDER THE FILTERED LIST --> */}
            {visibleMenuItems.map((item: SidebarMenuItem) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-md text-gray-700 hover:bg-blue-100"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {/* <-- ADDED: Show a message if there are no items to display --> */}
            {visibleMenuItems.length === 0 && (
                <div className="px-4 py-2 text-md text-gray-400">
                    No items available
                </div>
            )}
          </div>
        )}
      </div>

      <div className="px-4 md:px-12 mt-6">
        {(() => {
          const [first, ...rest] =
            pathname === "/backoffice/dashboard"
              ? [`${currentTitle},`, userName || "User."]
              : currentTitle.split(" ");

          return (
            <h2 className="text-2xl md:text-3xl leading-snug">
              <span className="font-light text-white">{first} </span>
              <span className="font-semibold text-white">{rest.join(" ")}</span>
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