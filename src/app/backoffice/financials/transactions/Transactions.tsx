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

const transactionsPerPage = 10;

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

const FinancialTransactionsPage = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const [allTransactions, setAllTransactions] = useState<
    FinancialTransaction[]
  >([]);
  const [displayedTransactions, setDisplayedTransactions] = useState<
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
  const dateFilterRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [currencyFilter, setCurrencyFilter] = useState<string | null>(null);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<
    string | null
  >(null);
  const [clientIdFilter, setClientIdFilter] = useState<string>("");

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Get unique currencies from transactions
  const availableCurrencies = useMemo(() => {
    const currencies = new Set<string>();
    allTransactions.forEach((tx) => {
      currencies.add(tx.currencyIso3a);
      currencies.add(tx.receiverCurrencyIso3a);
    });
    return Array.from(currencies).sort();
  }, [allTransactions]);

  // Load all transactions (similar to UserAccounts logic)
  const fetchAllTransactions = async () => {
    setLoading(true);
    setError("");
    const pageSize = 100; // Request 100 per page
    const batchSize = 10; // Load 10 pages at a time
    let currentPageNum = 1;
    let allResults: FinancialTransaction[] = [];

    const fetchPage = async (page: number): Promise<FinancialTransaction[]> => {
      try {
        const res = await api.get("/finance/transactions", {
          params: {
            page: page,
            size: pageSize,
          },
        });

        const data = res.data;
        const transactions = Array.isArray(data) ? data : [];

        return transactions;
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        return [];
      }
    };

    const fetchInBatches = async () => {
      while (true) {
        const pages = Array.from(
          { length: batchSize },
          (_, i) => currentPageNum + i
        );
        const results = await Promise.all(pages.map(fetchPage));
        const combined = results.flat();

        if (combined.length === 0) break;

        allResults = [...allResults, ...combined];
        currentPageNum += batchSize;

        // Small delay to avoid overwhelming the API
        await new Promise((res) => setTimeout(res, 100));
      }
    };

    try {
      await fetchInBatches();
      setAllTransactions(allResults);
      setFilteredTransactions(allResults);
      setCurrentPage(1);
      setDisplayedTransactions(allResults.slice(0, transactionsPerPage));

      if (allResults.length === 0) {
        toast.error("No transactions found");
      } else {
        toast.success(`Loaded ${allResults.length} transactions`);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setError("Failed to fetch financial transactions");
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchAllTransactions();
  }, []);

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

  // Apply filters/search -> update filteredTransactions and reset to page 1
  useEffect(() => {
    const rawQuery = searchQuery.trim();
    const tokens = rawQuery.toLowerCase().split(/\s+/).filter(Boolean);

    const filtered = allTransactions.filter((transaction) => {
      // Currency filter
      const matchesCurrency =
        !currencyFilter ||
        transaction.currencyIso3a === currencyFilter ||
        transaction.receiverCurrencyIso3a === currencyFilter;

      // Transaction type filter
      const matchesType =
        !transactionTypeFilter ||
        transaction.transactionType === transactionTypeFilter;

      // Client ID filter
      const matchesClientId =
        !clientIdFilter.trim() ||
        transaction.clientId.toString().includes(clientIdFilter);

      // Text search
      const fields = [
        transaction.transactionId.toString().toLowerCase(),
        transaction.clientId.toString().toLowerCase(),
        transaction.transactionType.toLowerCase(),
        transaction.currencyIso3a.toLowerCase(),
        transaction.receiverCurrencyIso3a.toLowerCase(),
        transaction.revenue.toString().toLowerCase(),
      ];

      // Date filter
      const date = new Date(transaction.date).getTime();
      const inDateRange =
        !dateRange.startDate ||
        !dateRange.endDate ||
        (date >= dateRange.startDate.getTime() &&
          date <= dateRange.endDate.getTime());

      const matchesAllTokens =
        tokens.length === 0 ||
        tokens.every((token) => fields.some((field) => field.includes(token)));

      return (
        matchesCurrency &&
        matchesType &&
        matchesClientId &&
        inDateRange &&
        matchesAllTokens
      );
    });

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [
    searchQuery,
    dateRange,
    allTransactions,
    currencyFilter,
    transactionTypeFilter,
    clientIdFilter,
  ]);

  // Update displayedTransactions whenever filteredTransactions or currentPage changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    setDisplayedTransactions(filteredTransactions.slice(startIndex, endIndex));
  }, [filteredTransactions, currentPage]);

  // Calculate total pages
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / transactionsPerPage)
  );

  // Pagination navigation
  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
    // Scroll to top of table
    const container = document.querySelector("[data-transactions-table-top]");
    if (container) {
      (container as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Format date time
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Export logic
  const generateExportFileName = () => {
    let fileName = "transactions_revenue";
    if (searchQuery.trim()) {
      const safeQuery = searchQuery.trim().replace(/\s+/g, "_");
      fileName += `_search_${safeQuery}`;
    }
    if (currencyFilter) fileName += `_currency_${currencyFilter}`;
    if (transactionTypeFilter) fileName += `_type_${transactionTypeFilter}`;
    if (filteredTransactions.length !== allTransactions.length)
      fileName += "_filtered";
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

  // Render pagination numbers (similar to UserAccounts)
  const renderPageNumbers = () => {
    const pages = [];
    const maxButtons = 7;
    let start = 1;
    let end = totalPages;

    if (totalPages > maxButtons) {
      const sideButtons = Math.floor((maxButtons - 1) / 2);
      start = Math.max(1, currentPage - sideButtons);
      end = Math.min(totalPages, currentPage + sideButtons);

      if (currentPage <= sideButtons) {
        start = 1;
        end = maxButtons;
      } else if (currentPage + sideButtons >= totalPages) {
        start = totalPages - (maxButtons - 1);
        end = totalPages;
      }
    }

    for (let p = start; p <= end; p++) {
      pages.push(
        <button
          key={p}
          onClick={() => goToPage(p)}
          className={`px-3 py-1 rounded-md ${
            p === currentPage
              ? "bg-blue-600 text-white"
              : "bg-white border text-gray-700"
          }`}
        >
          {p}
        </button>
      );
    }

    if (start > 1) {
      return (
        <>
          <button
            onClick={() => goToPage(1)}
            className="px-3 py-1 rounded-md bg-white border text-gray-700"
          >
            1
          </button>
          <span className="px-2">…</span>
          {pages}
        </>
      );
    }

    if (end < totalPages) {
      return (
        <>
          {pages}
          <span className="px-2">…</span>
          <button
            onClick={() => goToPage(totalPages)}
            className="px-3 py-1 rounded-md bg-white border text-gray-700"
          >
            {totalPages}
          </button>
        </>
      );
    }

    return pages;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 md:ml-80 h-full overflow-y-auto bg-white">
        <div className="p-4 md:p-6">
          {/* Header Section */}
          <div
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
            data-transactions-table-top
          >
            <h2 className="text-xl md:text-2xl font-semibold text-black md:flex-shrink-0">
              Transactions Revenue
            </h2>

            <div className="flex flex-col md:flex-row w-full md:w-auto gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-[450px]">
                <input
                  type="text"
                  placeholder={
                    isMobile
                      ? "Search transactions..."
                      : "Search by Transaction ID, User ID, or Currency"
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border rounded-md shadow-sm focus:ring focus:ring-gray-100 text-sm md:text-base"
                  disabled={loading}
                />
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  strokeWidth={2.5}
                />
              </div>

              <div className="flex gap-2 md:gap-4">
                {/* Date Filter */}
                <div className="relative" ref={dateFilterRef}>
                  <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white border rounded-md shadow-sm text-sm md:text-md w-full"
                    disabled={loading}
                  >
                    <FaCalendarAlt className="text-sm" />
                    {isMobile ? (
                      <span>Date</span>
                    ) : dateRange.startDate && dateRange.endDate ? (
                      <span className="text-sm">
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
                          setShowDateFilter(false);
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

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100 w-full md:w-auto text-sm md:text-base"
                  disabled={loading || filteredTransactions.length === 0}
                >
                  <FaFileExport /> {isMobile ? "" : "Export"}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile: Simple Filters */}
          {isMobile && (
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={currencyFilter || ""}
                  onChange={(e) => setCurrencyFilter(e.target.value || null)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  disabled={loading}
                >
                  <option value="">All Currencies</option>
                  {availableCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>

                <select
                  value={transactionTypeFilter || ""}
                  onChange={(e) =>
                    setTransactionTypeFilter(e.target.value || null)
                  }
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  disabled={loading}
                >
                  <option value="">All Types</option>
                  {TRANSACTION_TYPE_OPTIONS.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Client ID"
                  value={clientIdFilter}
                  onChange={(e) => setClientIdFilter(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm"
                  disabled={loading}
                />
                {(currencyFilter ||
                  transactionTypeFilter ||
                  clientIdFilter) && (
                  <button
                    onClick={() => {
                      setCurrencyFilter(null);
                      setTransactionTypeFilter(null);
                      setClientIdFilter("");
                    }}
                    className="px-3 py-2 bg-gray-100 border rounded-md text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Desktop: Advanced Filters Dropdown */}
          {!isMobile && (
            <>
              {/* Active Filters Display */}
              {(currencyFilter || transactionTypeFilter || clientIdFilter) && (
                <div className="flex flex-wrap gap-2 mb-4">
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
              )}

              {/* Date filter active indicator */}
              {dateRange.startDate && (
                <div className="text-sm text-gray-500 mb-2">
                  Showing transactions from{" "}
                  {dateRange.startDate.toLocaleDateString()} to{" "}
                  {dateRange.endDate?.toLocaleDateString()}
                </div>
              )}
            </>
          )}

          {/* Results count */}
          <div className="text-sm text-gray-600 mb-4">
            {loading ? (
              <span className="animate-pulse">Loading transactions...</span>
            ) : (
              `Showing ${displayedTransactions.length} of ${filteredTransactions.length} transactions`
            )}
            {filteredTransactions.length !== allTransactions.length && (
              <span className="text-blue-600 ml-2">
                (filtered from {allTransactions.length} total)
              </span>
            )}
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto mb-4">
            {/* MOBILE: Horizontally scrollable table */}
            {isMobile ? (
              <div className="overflow-x-auto w-full">
                <div style={{ minWidth: "1200px" }}>
                  {" "}
                  {/* Force horizontal scroll */}
                  <table className="min-w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-sm">
                        <th className="px-3 py-2">Transaction ID</th>
                        <th className="px-3 py-2">User ID</th>
                        <th className="px-3 py-2">Sender</th>
                        <th className="px-3 py-2">Recipient</th>
                        <th className="px-3 py-2">Ex Rate</th>
                        <th className="px-3 py-2">IB Rate</th>
                        <th className="px-3 py-2">Rate Diff</th>
                        <th className="px-3 py-2">Revenue</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Currency</th>
                        <th className="px-3 py-2">Dest Curr</th>
                        <th className="px-3 py-2">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        // Loading skeleton for mobile
                        Array.from({ length: transactionsPerPage }).map(
                          (_, i) => (
                            <tr key={i} className="animate-pulse border-b">
                              {Array.from({ length: 12 }).map((_, j) => (
                                <td key={j} className="px-3 py-3">
                                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                                </td>
                              ))}
                            </tr>
                          )
                        )
                      ) : displayedTransactions.length > 0 ? (
                        // Actual data for mobile
                        displayedTransactions.map((transaction) => (
                          <tr
                            key={transaction.transactionId}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-3 py-3 font-medium text-xs">
                              {transaction.transactionId}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              {transaction.clientId}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              {transaction.senderAmount.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              {transaction.recipientAmount.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              {transaction.exchangeRate.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              {transaction.interbankRate.toFixed(2)}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              <span
                                className={`${transaction.rateDifference > 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {transaction.rateDifference > 0 ? "+" : ""}
                                {transaction.rateDifference.toFixed(4)}
                              </span>
                            </td>
                            <td className="px-3 py-3 font-bold text-green-700 text-xs">
                              {transaction.revenue.toFixed(4)}
                            </td>
                            <td className="px-3 py-3 text-xs whitespace-nowrap">
                              {formatDateTime(transaction.date)}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              {transaction.currencyIso3a}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              {transaction.receiverCurrencyIso3a}
                            </td>
                            <td className="px-3 py-3 text-xs">
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                {formatTransactionType(
                                  transaction.transactionType
                                )}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        // No results for mobile
                        <tr>
                          <td
                            colSpan={12}
                            className="px-3 py-4 text-center text-gray-500 text-sm"
                          >
                            No financial transactions found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // DESKTOP: Normal responsive table
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
                    <th className="px-6 py-3 hidden lg:table-cell">Currency</th>
                    <th className="px-6 py-3 hidden lg:table-cell">
                      Dest. Currency
                    </th>
                    <th className="px-6 py-3 hidden lg:table-cell">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Loading skeleton for desktop
                    Array.from({ length: transactionsPerPage }).map((_, i) => (
                      <tr key={i} className="animate-pulse border-b">
                        {Array.from({ length: 12 }).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : displayedTransactions.length > 0 ? (
                    // Actual data for desktop
                    displayedTransactions.map((transaction) => (
                      <tr
                        key={transaction.transactionId}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium">
                          {transaction.transactionId}
                        </td>
                        <td className="px-6 py-4">{transaction.clientId}</td>
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
                            {formatTransactionType(transaction.transactionType)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // No results for desktop
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
            )}
          </div>

          {/* Pagination Controls - Similar to UserAccounts */}
          {!loading && filteredTransactions.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 py-3 border-t">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(1)}
                  className="px-3 py-1 rounded-md bg-white border text-gray-700 disabled:opacity-50 text-sm"
                  disabled={currentPage === 1}
                >
                  {"<<"}
                </button>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  className="px-3 py-1 rounded-md bg-white border text-gray-700 disabled:opacity-50 text-sm"
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {renderPageNumbers()}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  className="px-3 py-1 rounded-md bg-white border text-gray-700 disabled:opacity-50 text-sm"
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
                <button
                  onClick={() => goToPage(totalPages)}
                  className="px-3 py-1 rounded-md bg-white border text-gray-700 disabled:opacity-50 text-sm"
                  disabled={currentPage === totalPages}
                >
                  {">>"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialTransactionsPage;
