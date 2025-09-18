"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../../../utils/apiService";
import Image from "next/image";
import Update from "./Update";
import CreatePairModal from "./CreatePairModal";
import { ChevronDown, Check, Search } from "lucide-react"; // Import Search icon

// --- A. Definitions and Custom Hook ---
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
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreatePairModalOpen, setIsCreatePairModalOpen] = useState(false);
  const [rates, setRates] = useState({
    paybill: null,
    mpesa: null,
    bank: null,
    card: null,
  });
  const [lastUpdated, setLastUpdated] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [availableCurrencyPairs, setAvailableCurrencyPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  // --- New: Fetch available currency pairs ---
  const fetchCurrencyPairs = useCallback(async () => {
    try {
      const response = await api.get("/treasury/get-currency-pairs");
      const pairs = response.data.map((pair) => ({
        base: pair.baseCurrency,
        target: pair.targetCurrency,
      }));
      setAvailableCurrencyPairs(pairs);
      // Set the first fetched pair as selected if available and no pair is selected yet
      if (pairs.length > 0 && !selectedPair) {
        setSelectedPair(pairs[0]);
      }
    } catch (error) {
      console.error("Error fetching currency pairs:", error);
      setAvailableCurrencyPairs([]); // Ensure it's an empty array on error
    }
  }, [selectedPair]);

  useEffect(() => {
    fetchCurrencyPairs();
  }, [fetchCurrencyPairs]);

  // --- C. API and Data Handling (modified to use selectedPair) ---
  const fetchRates = useCallback(
    async (base, target) => {
      if (!base || !target) {
        // Don't fetch if base or target are not defined (e.g., initial render before pairs are loaded)
        return;
      }
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
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          });
          const formattedTime = updatedDate
            .toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace(/\./g, "");

          setLastUpdated(`Updated on ${formattedDate}, ${formattedTime}`);
        }
      } catch (error) {
        console.error("Error fetching rates:", error);
        // Optionally reset rates or show an error message
        setRates({ paybill: null, mpesa: null, bank: null, card: null });
        setLastUpdated("Failed to load rates.");
      }
    },
    []
  );

  useEffect(() => {
    if (selectedPair) {
      // Only fetch rates if a pair is selected
      fetchRates(selectedPair.base, selectedPair.target);
    }
  }, [selectedPair, fetchRates]);

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
    setIsDropdownOpen(false);
    setSearchTerm(""); // Clear search term on selection
  };

  // Filtered pairs based on search term
  const filteredPairs = availableCurrencyPairs.filter(
    (pair) =>
      `${pair.base} → ${pair.target}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      pair.base.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pair.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- D. Render Logic ---
  return (
    <section className="p-6 bg-white rounded-xl font-poppins">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex flex-col mb-4 md:mb-0">
          <h2 className="text-[21px] font-bold text-gray-800 mb-4">
            Tuma App Rates
          </h2>
          <p className="text-gray-400">
            {lastUpdated || "Loading update time..."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div ref={dropdownRef} className="relative flex items-center gap-3">
            {/*<div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
              {/* Dynamically load flag based on selectedPair's target currency using flagcdn.com 
              {selectedPair && (
                <Image
                  src={`https://flagcdn.com/w20/${selectedPair.target.toLowerCase()}.png`} // Using flagcdn with country codes (lowercase)
                  alt={`${selectedPair.target} Flag`}
                  width={24}
                  height={24}
                />
              )}
            </div>*/}
            <div>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center text-[15px] font-semibold justify-between w-full min-w-[150px] px-4 py-2 text-left bg-white border
                     border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>
                  {selectedPair ? (
                    <>
                   
                      {selectedPair.base} →{" "}
                 
                      {selectedPair.target}
                    </>
                  ) : (
                    "Select Pair"
                  )}
                </span>
                <ChevronDown
                  className={`w-5 h-5 ml-2 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-10 w-fit mt-2 bg-white border border-gray-200 rounded-lg shadow-xl text-[14px]">
                  <div className="relative px-4 py-2">
                    <Search className="absolute w-4 h-4 text-gray-400 left-6 top-4" />
                    <input
                      type="text"
                      placeholder="Search pair..."
                      className="w-full pl-8 pr-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <ul className="py-1 max-h-60 overflow-y-auto">
                    {" "}
                    {/* Added max-h-60 and overflow-y-auto */}
                    {filteredPairs.length > 0 ? (
                      filteredPairs.map((pair) => (
                        <li
                          key={`${pair.base}-${pair.target}`}
                          onClick={() => handlePairSelect(pair)}
                          className="flex items-center px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100"
                        >
                          {selectedPair &&
                          selectedPair.base === pair.base &&
                          selectedPair.target === pair.target ? (
                            <Check className="w-4 h-4 mr-2 text-blue-600" />
                          ) : (
                            <div className="w-4 h-4 mr-2" />
                          )}
                          
                          <span>{pair.base}</span>
                          <span className="mx-1">→</span>
                        
                          <span>{pair.target}</span>
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-gray-500">
                        No matching currency pairs.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsCreatePairModalOpen(true)}
            className="md:px-6 px-2 py-1 md:py-2 h-fit bg-white font-medium text-blue-600 border-2 border-blue-600 rounded-lg text-[14px] md:text-base 
             hover:bg-blue-700 hover:text-white transition"
          >
            Create Pair
          </button>

          <button
            onClick={() => setIsUpdateModalOpen(true)}
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
    <Image
      src={icon}
      alt={label}
      className={`md:mr-4 mr-2 rounded-full ${
        label === "MPESA" ? "px-3 py-4" : "p-3"
      } bg-[#F3F5F8]`}
      width={50}
      height={50}
    />
    <span className="flex flex-col">
      <h1 className="font-semibold md:text-base text-[12px] text-[#101820]">
        {rate != null ? `KES ${Number(rate).toFixed(2)}` : "Loading..."}
      </h1>
      <p
        className="mt-1 text-xs w-fit px-2 rounded-md font-medium"
        style={{ color: color, backgroundColor: `${color}1A` }}
      >
        {label}
      </p>
    </span>
  </div>
);

export default Section;