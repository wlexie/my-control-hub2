"use client";

import { useState } from "react";
import { FaCrown } from "react-icons/fa";
import { Calendar } from "lucide-react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { LiaTagsSolid } from "react-icons/lia";
import DateFilter from "@/app/backoffice/components/DateFilter";

export default function FiltersBar() {
  const [showFromFilter, setShowFromFilter] = useState(false);
  const [showToFilter, setShowToFilter] = useState(false);

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [influencer, setInfluencer] = useState("");
  const [codeType, setCodeType] = useState("");

  const handleClear = () => {
    setFromDate(null);
    setToDate(null);
    setInfluencer("");
    setCodeType("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl space-y-4">
      <h2 className="text-black font-semibold text-xl">Filters</h2>
      <div className="flex flex-wrap items-center gap-3">
        {/* Influencer Dropdown */}
        <div className="relative flex-1 min-w-[180px]">
          <select
            value={influencer}
            onChange={(e) => setInfluencer(e.target.value)}
            className="w-full h-12 px-3 pl-9 pr-8 text-md border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Influencer Name</option>
            <option value="khaligraph">Khaligraph Jones</option>
            <option value="azziad">Azziad Nasenya</option>
            <option value="kabi">Kabi wa Jesus</option>
          </select>
          <FaCrown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
        </div>

        {/* From Date */}
        <div className="relative flex-1 min-w-[150px]">
          <input
            readOnly
            value={fromDate ? fromDate.toLocaleDateString() : "From"}
            onClick={() => setShowFromFilter(true)}
            className="w-full h-12 px-3 pr-9 text-md border rounded-lg bg-gray-100 cursor-pointer focus:outline-none"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          {showFromFilter && (
            <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/30 overflow-y-auto p-4">
              <div className="p-4 rounded-xl max-w-lg w-full">
                <DateFilter
                  isOpen={showFromFilter}
                  initialStartDate={fromDate || new Date()}
                  initialEndDate={fromDate || new Date()}
                  onClose={() => setShowFromFilter(false)}
                  onChange={(start) => {
                    setFromDate(start);
                    setShowFromFilter(false);
                  }}
                  onClear={() => setFromDate(null)}
                />
              </div>
            </div>
          )}
        </div>

        {/* To Date */}
        <div className="relative flex-1 min-w-[150px]">
          <input
            readOnly
            value={toDate ? toDate.toLocaleDateString() : "To"}
            onClick={() => setShowToFilter(true)}
            className="w-full h-12 px-3 pr-9 text-md border rounded-lg bg-gray-100 cursor-pointer focus:outline-none"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          {showToFilter && (
            <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/30 overflow-y-auto p-4">
              <div className=" p-4 rounded-xl max-w-lg w-full">
                <DateFilter
                  isOpen={showToFilter}
                  initialStartDate={toDate || new Date()}
                  initialEndDate={toDate || new Date()}
                  onClose={() => setShowToFilter(false)}
                  onChange={(_, end) => {
                    setToDate(end);
                    setShowToFilter(false);
                  }}
                  onClear={() => setToDate(null)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Code Type Dropdown */}
        <div className="relative flex-1 min-w-[160px]">
          <select
            value={codeType}
            onChange={(e) => setCodeType(e.target.value)}
            className="w-full h-12 px-3 pl-9 pr-8 text-md border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            <option value="">Code Type</option>
            <option value="one-time">One-time Use</option>
            <option value="no-expiry">No Expiry</option>
          </select>
          <LiaTagsSolid className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="h-12 px-5 text-md rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Apply Filter
          </button>
          <button
            onClick={handleClear}
            className="h-12 px-5 text-md rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  );
}
