"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { FaCalendarAlt, FaFileExport } from "react-icons/fa";
import { Search } from "lucide-react";
import DateFilter from "../../components/DateFilter";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import * as XLSX from "xlsx";
import api from "../../../../utils/apiService";
import { useMediaQuery } from "react-responsive";
import toast from "react-hot-toast";
import { IoIosArrowDropdownCircle } from "react-icons/io";

interface FinancialTransaction {
  transactionId: number;
  clientId: number;
  senderAmount: number;
  recipientAmount: number;
  exchangeRate: number;
  interbankRate: number;
  rateDifference: number;
  revenue: number;
  date: string;
  currencyIso3a: string;
  receiverCurrencyIso3a: string;
  transactionType: string;
}

interface ExportFinancialTransaction {
  "Transaction ID": number;
  "Client ID": number;
  "Sender Amount": number;
  "Recipient Amount": number;
  "Exchange Rate": number;
  "Interbank Rate": number;
  "Rate Difference": number;
  Revenue: number;
  "Date & Time": string;
  "Sender Currency": string;
  "Recipient Currency": string;
  "Transaction Type": string;
}

const rowsPerPage = 10;

const FinancialTransactionsPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [allTransactions, setAllTransactions] = useState<
    FinancialTransaction[]
  >([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    FinancialTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState(new Set([1]));
  const dateFilterRef = useRef<HTMLDivElement>(null);

  // New state for filter dropdown
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [currencyFilter, setCurrencyFilter] = useState<string | null>(null);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<
    string | null
  >(null);
  const [clientIdFilter, setClientIdFilter] = useState<string>("");

  const TRANSACTION_TYPE_OPTIONS = [
    { label: "Card to Mpesa", value: "CARD_TO_MPESA" },
    { label: "Card to Bank", value: "CARD_TO_BANK" },
    { label: "Card to Paybill", value: "CARD_TO_PAYBILL" },
    { label: "Card to Network", value: "CARD_TO_NETWORK" },
    { label: "Card to Card", value: "CARD_TO_CARD" },
    { label: "Open Banking to Bank", value: "OPEN_BANKING_TO_BANK" },
    { label: "Open Banking to Card", value: "OPEN_BANKING_TO_CARD" },
    { label: "Open Banking to Mpesa", value: "OPEN_BANKING_TO_MPESA" },
    { label: "Open Banking to Paybill", value: "OPEN_BANKING_TO_PAYBILL" },
  ];

  const availableCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    allTransactions.forEach((tx) => {
      currencies.add(tx.currencyIso3a);
      currencies.add(tx.receiverCurrencyIso3a);
    });
    return Array.from(currencies).sort();
  }, [allTransactions]);

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
      }
      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(event.target as Node)
      ) {
        setShowDateFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load initial page
  useEffect(() => {
    const fetchInitialPage = async () => {
      try {
        setLoading(true);
        const response = await api.get("/finance/transactions", {
          params: {
            page: 1,
            size: rowsPerPage,
          },
        });

        setAllTransactions(response.data);
        setFilteredTransactions(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch financial transactions");
        toast.error("Failed to load financial transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPage();
  }, []);

  // Load all pages in batches (50 pages at a time)
  useEffect(() => {
    const fetchAllPagesRecursively = async () => {
      const batchSize = 50;
      let currentBatch = 2;

      const fetchPage = async (page: number) => {
        if (loadedPages.has(page)) return null;

        try {
          const response = await api.get("/finance/transactions", {
            params: {
              page: page,
              size: rowsPerPage,
            },
          });
          setLoadedPages((prev) => new Set(prev).add(page));
          return response.data.length > 0 ? response.data : null;
        } catch (err) {
          console.error(`Failed to load page ${page}:`, err);
          return null;
        }
      };

      const fetchInBatches = async () => {
        const batchPages = Array.from(
          { length: batchSize },
          (_, i) => currentBatch + i
        );
        const results = await Promise.all(batchPages.map(fetchPage));

        const validResults = results.filter(
          Boolean
        ) as FinancialTransaction[][];
        const flattened = validResults.flat();

        setAllTransactions((prev) => {
          const seen = new Set(prev.map((tx) => tx.transactionId));
          const uniqueNew = flattened.filter(
            (tx) => !seen.has(tx.transactionId)
          );
          return [...prev, ...uniqueNew];
        });

        currentBatch += batchSize;

        if (validResults.length > 0) {
          await new Promise((res) => setTimeout(res, 100));
          await fetchInBatches();
        }
      };

      fetchInBatches();
    };

    fetchAllPagesRecursively();
  }, [loadedPages]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allTransactions];

    if (currencyFilter) {
      filtered = filtered.filter(
        (t) =>
          t.currencyIso3a === currencyFilter ||
          t.receiverCurrencyIso3a === currencyFilter
      );
    }

    if (transactionTypeFilter) {
      filtered = filtered.filter(
        (t) => t.transactionType === transactionTypeFilter
      );
    }

    if (clientIdFilter.trim()) {
      const clientId = parseInt(clientIdFilter);
      if (!isNaN(clientId)) {
        filtered = filtered.filter((t) => t.clientId === clientId);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.transactionId.toString().includes(query) ||
          t.clientId.toString().includes(query) ||
          t.transactionType.toLowerCase().includes(query) ||
          t.currencyIso3a.toLowerCase().includes(query) ||
          t.receiverCurrencyIso3a.toLowerCase().includes(query)
      );
    }

    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((t) => {
        const txDate = new Date(t.date).getTime();
        return (
          txDate >= dateRange.startDate!.getTime() &&
          txDate <= dateRange.endDate!.getTime()
        );
      });
    }

    setFilteredTransactions(filtered);
  }, [
    searchQuery,
    dateRange,
    allTransactions,
    currencyFilter,
    transactionTypeFilter,
    clientIdFilter,
  ]);

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const generateExportFileName = () => {
    let fileName = "transactions_revenue";
    if (searchQuery.trim())
      fileName += `_search_${searchQuery.trim().replace(/ /g, "_")}`;
    if (currencyFilter) fileName += `_currency_${currencyFilter}`;
    if (transactionTypeFilter) fileName += `_type_${transactionTypeFilter}`;
    if (filteredTransactions !== allTransactions) fileName += "_filtered";
    if (dateRange.startDate && dateRange.endDate) {
      const start = dateRange.startDate.toISOString().split("T")[0];
      const end = dateRange.endDate.toISOString().split("T")[0];
      fileName += `_from_${start}_to_${end}`;
    }
    return fileName;
  };

  const handleExport = async () => {
    const toastId = toast.loading("Preparing export...");

    try {
      const fileName = generateExportFileName();

      const exportData: ExportFinancialTransaction[] = filteredTransactions.map(
        (tx) => ({
          "Transaction ID": tx.transactionId,
          "Client ID": tx.clientId,
          "Sender Amount": tx.senderAmount,
          "Recipient Amount": tx.recipientAmount,
          "Exchange Rate": tx.exchangeRate,
          "Interbank Rate": tx.interbankRate,
          "Rate Difference": tx.rateDifference,
          Revenue: tx.revenue,
          "Date & Time": formatDateTime(tx.date),
          "Sender Currency": tx.currencyIso3a,
          "Recipient Currency": tx.receiverCurrencyIso3a,
          "Transaction Type": tx.transactionType,
        })
      );

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Financial Transactions"
      );
      XLSX.writeFile(workbook, `${fileName}.xlsx`);

      toast.success(
        `Exported ${exportData.length} financial transactions successfully!`,
        {
          id: toastId,
        }
      );
    } catch (error) {
      toast.error("Export failed", { id: toastId });
      console.error("Export error:", error);
    }
  };

  const formatTransactionType = (type: string) => {
    return (
      TRANSACTION_TYPE_OPTIONS.find((t) => t.value === type)?.label ||
      type ||
      "N/A"
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 md:ml-80 h-full overflow-y-auto bg-white">
        <div className="p-6">
          {/* Header Section - Same layout as original Transactions.tsx */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-2xl font-semibold text-black md:flex-shrink-0">
              Transactions Revenue
            </h2>

            {/* Search Bar - Centered in Desktop */}
            <div className="relative w-full md:w-[450px] md:mx-auto order-3 md:order-none">
              <input
                type="text"
                placeholder="Search by Transaction ID, User ID, or Currency"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-2 border rounded-md shadow-sm focus:ring focus:ring-gray-100"
              />
              <Search
                className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                strokeWidth={2.5}
              />
            </div>
            <div className="relative" ref={dateFilterRef}>
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm text-md w-full md:w-auto"
              >
                <FaCalendarAlt className="text-md" />
                {isMobile ? (
                  <span>Date</span>
                ) : dateRange.startDate && dateRange.endDate ? (
                  <span className="text-md">
                    {dateRange.startDate.toLocaleDateString("en-GB")} -{" "}
                    {dateRange.endDate.toLocaleDateString("en-GB")}
                  </span>
                ) : (
                  "Filter by date"
                )}
              </button>
              {showDateFilter && (
                <div
                  className={`absolute z-50 ${isMobile ? "left-0" : "right-0"} top-12`}
                >
                  <DateFilter
                    onChange={(start, end) => {
                      setDateRange({ startDate: start, endDate: end });
                    }}
                    onClear={() =>
                      setDateRange({ startDate: null, endDate: null })
                    }
                    isOpen={showDateFilter}
                    onClose={() => setShowDateFilter(false)}
                  />
                </div>
              )}
            </div>

            {/* Export and Filters - Right side on desktop */}
            <div className="flex gap-2 w-full md:w-auto order-2 md:order-none">
              <div className="relative" ref={filterDropdownRef}>
                {/* <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100 w-full md:w-auto"
                >
                  <FaFilter />
                  Filters
                </button> */}

                {showFilterDropdown && (
                  <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-56 bg-white border rounded-md shadow-lg z-50">
                    {/* Client ID Filter */}
                    <div className="p-3 border-b">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client ID
                      </label>
                      <input
                        type="number"
                        placeholder="Enter Client ID"
                        value={clientIdFilter}
                        onChange={(e) => setClientIdFilter(e.target.value)}
                        className="w-full px-3 py-1 border rounded-md text-sm"
                      />
                    </div>

                    {/* Currency Filter */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveFilter(
                            activeFilter === "currency" ? null : "currency"
                          )
                        }
                        className="w-full text-left px-4 py-2 hover:bg-gray-200 flex justify-between items-center"
                      >
                        Currency
                        <span>
                          <IoIosArrowDropdownCircle />
                        </span>
                      </button>
                      {activeFilter === "currency" && (
                        <div className="absolute left-full top-0 ml-1 w-32 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                          {availableCurrencies.map((currency) => (
                            <div
                              key={currency}
                              onClick={() => {
                                setCurrencyFilter(currency);
                                setActiveFilter(null);
                              }}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              {currency}
                            </div>
                          ))}
                          <div
                            onClick={() => {
                              setCurrencyFilter(null);
                              setActiveFilter(null);
                            }}
                            className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer border-t"
                          >
                            Reset filter
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Transaction Type Filter */}
                    <div className="relative border-t">
                      <button
                        onClick={() =>
                          setActiveFilter(
                            activeFilter === "type" ? null : "type"
                          )
                        }
                        className="w-full text-left px-4 py-2 hover:bg-gray-200 flex justify-between items-center"
                      >
                        Transaction Type
                        <IoIosArrowDropdownCircle />
                      </button>

                      {activeFilter === "type" && (
                        <div className="absolute left-full top-0 ml-1 w-56 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                          {TRANSACTION_TYPE_OPTIONS.map((type) => (
                            <div
                              key={type.value}
                              onClick={() => {
                                setTransactionTypeFilter(type.value);
                                setActiveFilter(null);
                              }}
                              className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
                                transactionTypeFilter === type.value
                                  ? "bg-blue-200"
                                  : ""
                              }`}
                            >
                              {type.label}
                            </div>
                          ))}
                          <div
                            onClick={() => {
                              setTransactionTypeFilter(null);
                              setActiveFilter(null);
                            }}
                            className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer border-t"
                          >
                            Reset filter
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Clear All Filters */}
                    <div
                      className="border-t px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setCurrencyFilter(null);
                        setTransactionTypeFilter(null);
                        setClientIdFilter("");
                        setActiveFilter(null);
                      }}
                    >
                      Clear all filters
                    </div>
                  </div>
                )}
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100 w-full md:w-auto"
              >
                <FaFileExport /> Export
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {/* <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              {currencyFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Currency: {currencyFilter}
                  <button
                    onClick={() => setCurrencyFilter(null)}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {transactionTypeFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                  Type: {formatTransactionType(transactionTypeFilter)}
                  <button
                    onClick={() => setTransactionTypeFilter(null)}
                    className="ml-1 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {clientIdFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Client ID: {clientIdFilter}
                  <button
                    onClick={() => setClientIdFilter("")}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div> */}

          {/* Date filter active indicator */}
          {dateRange.startDate && (
            <div className="text-sm text-gray-500 mb-2">
              Showing transactions from{" "}
              {dateRange.startDate.toLocaleDateString()} to{" "}
              {dateRange.endDate?.toLocaleDateString()}
            </div>
          )}

          {/* Transactions Table */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm">
                      <th className="px-6 py-3">Transaction ID</th>
                      <th className="px-6 py-3">User ID</th>
                      <th className="px-6 py-3 hidden sm:table-cell">
                        Sender Amount
                      </th>
                      <th className="px-6 py-3 hidden sm:table-cell">
                        Recipient Amount
                      </th>
                      <th className="px-6 py-3 hidden md:table-cell">
                        Exchange Rate
                      </th>
                      <th className="px-6 py-3 hidden md:table-cell">
                        Interbank Rate
                      </th>
                      <th className="px-6 py-3 hidden md:table-cell">
                        Rate Difference
                      </th>
                      <th className="px-6 py-3">Revenue</th>
                      <th className="px-6 py-3 hidden lg:table-cell">Date</th>
                      <th className="px-6 py-3 hidden lg:table-cell">
                        Currency
                      </th>
                      <th className="px-6 py-3 hidden lg:table-cell">
                        Dest. Currency
                      </th>
                      <th className="px-6 py-3 hidden lg:table-cell">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: rowsPerPage }).map((_, i) => (
                      <tr key={i} className="animate-pulse border-b">
                        {Array.from({ length: 12 }).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-sm">
                        <th className="px-6 py-3">Transaction ID</th>
                        <th className="px-6 py-3">User ID</th>
                        <th className="px-6 py-3 hidden sm:table-cell">
                          Sender Amount
                        </th>
                        <th className="px-6 py-3 hidden sm:table-cell">
                          Recipient Amount
                        </th>
                        <th className="px-6 py-3 hidden md:table-cell">
                          Exchange Rate
                        </th>
                        <th className="px-6 py-3 hidden md:table-cell">
                          Interbank Rate
                        </th>
                        <th className="px-6 py-3 hidden md:table-cell">
                          Rate Difference
                        </th>
                        <th className="px-6 py-3">Revenue</th>
                        <th className="px-6 py-3 hidden lg:table-cell">Date</th>
                        <th className="px-6 py-3 hidden lg:table-cell">
                          Currency
                        </th>
                        <th className="px-6 py-3 hidden lg:table-cell">
                          Dest. Currency
                        </th>
                        <th className="px-6 py-3 hidden lg:table-cell">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions
                          .slice(
                            (currentPage - 1) * rowsPerPage,
                            currentPage * rowsPerPage
                          )
                          .map((transaction) => (
                            <tr
                              key={transaction.transactionId}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 font-medium">
                                {transaction.transactionId}
                              </td>
                              <td className="px-6 py-4">
                                {transaction.clientId}
                              </td>
                              <td className="px-6 py-4 hidden sm:table-cell">
                                {transaction.senderAmount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 hidden sm:table-cell">
                                {transaction.recipientAmount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 hidden md:table-cell">
                                {transaction.exchangeRate.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 hidden md:table-cell">
                                {transaction.interbankRate.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 hidden md:table-cell">
                                <span
                                  className={`${transaction.rateDifference > 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {transaction.rateDifference > 0 ? "+" : ""}
                                  {transaction.rateDifference.toFixed(4)}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-bold text-green-700">
                                {transaction.revenue.toFixed(4)}
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell">
                                {formatDateTime(transaction.date)}
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell">
                                {transaction.currencyIso3a}
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell">
                                {transaction.receiverCurrencyIso3a}
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                  {formatTransactionType(
                                    transaction.transactionType
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={12}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No financial transactions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {filteredTransactions.length > 0 && (
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-md bg-blue-600 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of{" "}
                    {Math.ceil(filteredTransactions.length / rowsPerPage)}
                  </span>
                  <button
                    onClick={() => {
                      const hasMoreData =
                        currentPage * rowsPerPage < filteredTransactions.length;
                      if (hasMoreData) {
                        setCurrentPage((prev) => prev + 1);
                      }
                    }}
                    disabled={
                      currentPage * rowsPerPage >= filteredTransactions.length
                    }
                    className="px-4 py-2 border rounded-md bg-blue-600 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialTransactionsPage;
