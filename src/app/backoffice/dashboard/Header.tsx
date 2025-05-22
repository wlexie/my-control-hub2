"use client";

import { ChevronDown } from "lucide-react";
import HeroSection from "./HeroSection";
import TopNav from "./TopNav";
import { usePathname } from "next/navigation";
import { sidebarMenuItems } from "../constants/sidebarMenuItems";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

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
}

export default function Header({
  currency,
  onCurrencyChange,
  startDate,
  endDate,
  onDateFilterOpen,
}: HeaderProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/backoffice/dashboard";
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user ? `${user.firstName} ${user.lastName}` : null;

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

  const words = userName ? userName.split(" ") : [];
  const half = Math.ceil(words.length / 2);
  const firstHalf = words.slice(0, half).join(" ");
  const secondHalf = words.slice(half).join(" ");

  return (
    <div className="relative bg-gradient-to-br to-[#15449d] from-[#0162ff] text-white pb-8 ">
      <TopNav />
      <HeroSection currency={currency} onCurrencyChange={onCurrencyChange} />

      <div className="absolute -bottom-4 left-4 z-50" ref={dropdownRef}>
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
            {sidebarMenuItems.map((item: SidebarMenuItem) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 md:px-12 mt-6">
        <h2 className="text-2xl md:text-3xl font-light leading-snug">
          {isDashboard ? (
            <>
              Welcome back,{" "}
              <span className="text-white font-bold">
                {userName || "User"}.
              </span>
            </>
          ) : (
            <>
              {userName ? (
                <>
                  <span className="font-light">{firstHalf} </span>
                  <br className="block md:hidden" />
                  <span className="font-semibold">{secondHalf}</span>
                </>
              ) : (
                <span className="font-semibold">Page</span>
              )}
            </>
          )}
        </h2>
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
            Weekly <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
