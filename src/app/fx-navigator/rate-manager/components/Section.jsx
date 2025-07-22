// ... (imports and other code remain the same)
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../../../utils/apiService";
import Image from "next/image";
import Update from "./Update";
import CreatePairModal from "./CreatePairModal"; // 1. Import the new modal
import { ChevronDown, Check } from "lucide-react";

// --- A. Definitions and Custom Hook ---
const CURRENCY_PAIRS = [
  { base: "GBP", target: "KES" },
  { base: "USD", target: "KES" },
  { base: "EUR", target: "KES" },
  { base: "ZAR", target: "KES" },
];

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
};

// --- B. Main Section Component ---
const Section = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // Renamed for clarity
  const [isCreatePairModalOpen, setIsCreatePairModalOpen] = useState(false); // 2. State for the new modal
  const [rates, setRates] = useState({
    paybill: null, mpesa: null, bank: null, card: null,
  });
  const [lastUpdated, setLastUpdated] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState(CURRENCY_PAIRS[0]);
  const dropdownRef = useRef(null);
  
  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  // --- C. API and Data Handling (remains unchanged) ---
  const fetchRates = useCallback(async (base, target) => {
    try {
      const response = await api.get(
        `/treasury/latest-exchange-rate?baseCurrency=${base}&targetCurrency=${target}`
      );
      
      console.log(`[${base}/${target}] Fetched Rates Data:`, response.data);

      const responseData = response.data;
      
      setRates({
        paybill: responseData.paybillRate,
        mpesa: responseData.mpesaRate,
        bank: responseData.bankRate,
        card: responseData.currentRate,
      });
  
      if (responseData.updatedAt) {
        const updatedDate = new Date(responseData.updatedAt);
        updatedDate.setHours(updatedDate.getHours() + 3);

        const formattedDate = updatedDate.toLocaleDateString("en-GB", {
          day: "2-digit", month: "2-digit", year: "2-digit",
        });
        const formattedTime = updatedDate.toLocaleTimeString("en-GB", {
          hour: "2-digit", minute: "2-digit", hour12: false,
        }).replace(/\./g, "");
  
        setLastUpdated(`Updated on ${formattedDate}, ${formattedTime}`);
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    }
  }, );

  useEffect(() => {
    fetchRates(selectedPair.base, selectedPair.target);
  }, [selectedPair, fetchRates]);
  
  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
    setIsDropdownOpen(false);
  };

  // --- D. Render Logic ---
  return (
    <section className="p-6 bg-white rounded-xl font-poppins">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex flex-col mb-4 md:mb-0">
          <h2 className="text-[21px] font-bold text-gray-800 mb-4">Tuma App Rates</h2>
          <p className="text-gray-400">{lastUpdated || "Loading update time..."}</p>
        </div>

        <div className="flex items-center gap-4">
          <div ref={dropdownRef} className="relative flex items-center gap-3">
             <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                <Image src="/fx/flags/kenya.png" alt="Kenyan Flag" width={24} height={24} />
             </div>
             <div>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center text-[15px] font-semibold justify-between w-full min-w-[150px] px-4 py-2 text-left bg-white border
                     border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <span>{selectedPair.base} → {selectedPair.target}</span>
                    <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl text-[14px]">
                        <ul className="py-1">
                            {CURRENCY_PAIRS.map((pair) => (
                                <li key={`${pair.base}-${pair.target}`} onClick={() => handlePairSelect(pair)}
                                    className="flex items-center px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100">
                                    {selectedPair.base === pair.base && selectedPair.target === pair.target ? (
                                        <Check className="w-4 h-4 mr-2 text-blue-600" />
                                    ) : (
                                        <div className="w-4 h-4 mr-2" />
                                    )}
                                    <span>{pair.base} → {pair.target}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
             </div>
          </div>
           <button
            onClick={() => setIsCreatePairModalOpen(true)} // 3. This button now opens the new modal
            className="md:px-6 px-2 py-1 md:py-2 h-fit bg-white font-medium text-blue-600 border-2 border-blue-600 rounded-lg text-[14px] md:text-base 
             hover:bg-blue-700 hover:text-white transition"
          >
            Create Pair 
          </button>
          
          <button
            onClick={() => setIsUpdateModalOpen(true)} // This button opens the original "Update" modal
            className="md:px-6 px-2 py-1 md:py-2 h-fit bg-[#276EF1] font-semibold text-white rounded-lg text-[14px] md:text-base 
             hover:bg-blue-700 transition"
          >
            Update Rate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <RateCard icon="/fx/svgs/paybill.svg" label="Paybill" rate={rates.paybill} color="#27AAE1" />
        <RateCard icon="/fx/svgs/mpesa.svg" label="MPESA" rate={rates.mpesa} color="#3CA8A4" />
        <RateCard icon="/fx/svgs/Bank.svg" label="Bank" rate={rates.bank} color="#276EF1" />
        <RateCard icon="/fx/svgs/card.svg" label="Card" rate={rates.card} color="#F9CB38" />
      </div>

      {/* 4. Render the Modals */}
      <Update isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} />
      <CreatePairModal isOpen={isCreatePairModalOpen} onClose={() => setIsCreatePairModalOpen(false)} />

    </section>
  );
};

// --- E. RateCard Component (remains unchanged) ---
const RateCard = ({ icon, label, rate, color }) => (
    <div className="flex items-center md:p-3 p-1 bg-white border border-gray-200 rounded-xl">
        <Image src={icon} alt={label} className={`md:mr-4 mr-2 rounded-full ${label === "MPESA" ? "px-3 py-4" : "p-3"} bg-[#F3F5F8]`} width={50} height={50} />
        <span className="flex flex-col">
            <h1 className="font-semibold md:text-base text-[12px] text-[#101820]">
                {rate != null ? `KES ${Number(rate).toFixed(2)}` : "Loading..."}
            </h1>
            <p className="mt-1 text-xs w-fit px-2 rounded-md font-medium" style={{ color: color, backgroundColor: `${color}1A` }}>
                {label}
            </p>
        </span>
    </div>
);

export default Section;