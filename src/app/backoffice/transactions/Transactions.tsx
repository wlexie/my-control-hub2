"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { FaCalendarAlt, FaFileExport } from "react-icons/fa";
import { Search } from "lucide-react";
import DateFilter from "../components/DateFilter";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import TransactionModal from "../components/TransactionModal";
import FraudModal from "../compliance-security/components/FraudModal";
import { Transaction } from "../types/transactions";
import * as XLSX from "xlsx";
import useApi from "../../../hooks/useApi"; // Corrected import path for useApi
import { useSearchParams } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ExportTransaction {
  "Transaction ID": number;
  "Transaction Key": string;
  "Transaction Reference": string;
  "User ID": number;
  "Sender Name": string;
  "Sender's Number": string;
  "Sender's Email": string;
  "Recipient Name": string;
  "Recipient's Number": string;
  "Account Number": string;
  "Sender Amount": number;
  "Recipient Amount": number;
  "Sender Currency": string;
  "Destination Currency": string;
  Destination: string;
  "Exchange Rate": number;
  "Transaction Type": string;
  "Payment Description": string;
  "Card Issuer": string;
  "Masked Card Number": string;
  "Settlement Reference": string;
  "MPESA Reference": string;
  "Trust Payment Reference": string;
  "Bank Name": string;
  Status: string;
  "Error Message": string;
  "Date & Time (GMT)": string;
  "Fraud Reference": string;
  "Payment Purpose": string;
  "Source of Funds": string;
}

type RawTransaction = Partial<{
  transactionId: string;
  senderName: string;
  receiverName: string;
  senderAmount: number;
  currencyIso3a: string;
  date: string;
  status: string;
  exchangeRate: number;
  transactionType: string;
  paymentTypeDescription: string;
  issuer: string;
  maskedPan: string;
  receiverPhone: string;
  senderPhone: string;
  transactionKey: string;
  accountNumber: number | string;
  settlementReference: string;
  recipientAmount: number;
  senderEmail: string;
  receiverCurrencyIso3a: string;
  mpesaReference: string;
  tpReference: string;
  errorMessage: string;
  userId: number | string | null;
  bankName: string;
  transactionReference: string;
  receiverAddress: string;
  fraudReference: string;
  paymentPurpose: string;
  fundsSource: string;
}>;

const rowsPerPage = 10;

const TransactionsPage = () => {
  const { get } = useApi();
  const router = useRouter();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const userIdFromQuery = userIdParam ? Number(userIdParam) : null;

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransactionKey, setSelectedTransactionKey] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState(new Set([1])); // Keep track of loaded pages
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const statusOptions = [
    "All",
    "Success",
    "Pending",
    "Failed",
    "Rejected",
    "Reversed",
    "Refunded",
    "Escalated",
    "Under Review",
  ];

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const availableCountries = useMemo(() => {
    return [
      {
        code: "UK",
        label: "United Kingdom",
        flag: "/backoffice/uk-flag.png",
        currency: "GBP",
      },
      {
        code: "KE",
        label: "Kenya",
        flag: "/backoffice/kenya.png",
        currency: "KES",
      },
      {
        code: "MW",
        label: "Malawi",
        flag: "/backoffice/malawi.png",
        currency: "MWK",
      },
      {
        code: "RW",
        label: "Rwanda",
        flag: "/backoffice/rwanda.png",
        currency: "RWF",
      },
      {
        code: "BI",
        label: "Burundi",
        flag: "/backoffice/burundi.png",
        currency: "BIF",
      },
      {
        code: "TZ",
        label: "Tanzania",
        flag: "/backoffice/tz-flag.png",
        currency: "TZS",
      },
      {
        code: "GH",
        label: "Ghana",
        flag: "/backoffice/ghana.png",
        currency: "GHS",
      },
      {
        code: "UG",
        label: "Uganda",
        flag: "/backoffice/uganda.png",
        currency: "UGX",
      },
      {
        code: "CD",
        label: "Congo DRC",
        flag: "/backoffice/drc.png",
        currency: "USD",
      },
      {
        code: "ZA",
        label: "South Africa",
        flag: "/backoffice/sa.png",
        currency: "ZAR",
      },
      {
        code: "SS",
        label: "South Sudan",
        flag: "/backoffice/ss.png",
        currency: "SSP",
      },
      {
        code: "ET",
        label: "Ethiopia",
        flag: "/backoffice/ethiopia.png",
        currency: "ETB",
      },
    ];
  }, []);

  const countryDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const mapApiTransactionToTransaction = useCallback(
    (tx: RawTransaction): Transaction => ({
      transactionId: tx.transactionId || "N/A",
      senderName: tx.senderName || "Unknown Sender",
      receiverName: tx.receiverName || "Unknown Recipient",
      senderAmount: tx.senderAmount || 0,
      currencyIso3a: tx.currencyIso3a || "USD",
      date: tx.date || new Date().toISOString(),
      status: formatTransactionStatus(tx.status),
      exchangeRate: tx.exchangeRate || 1,
      transactionType: tx.transactionType || "Unknown",
      receiverPhone: tx.receiverPhone || "N/A",
      senderPhone: tx.senderPhone || "N/A",
      transactionKey: tx.transactionKey || "N/A",
      accountNumber: Number(tx.accountNumber) || 0,
      settlementReference: tx.settlementReference || "N/A",
      recipientAmount: tx.recipientAmount || 0,
      senderEmail: tx.senderEmail || "N/A",
      receiverCurrencyIso3a: tx.receiverCurrencyIso3a || "",
      mpesaReference: tx.mpesaReference || "N/A",
      tpReference: tx.tpReference || "N/A",
      errorMessage: tx.errorMessage || "N/A",
      userId:
        tx.userId !== undefined &&
        tx.userId !== null &&
        !isNaN(Number(tx.userId))
          ? Number(tx.userId)
          : null,
      bankName: tx.bankName || "N/A",
      transactionReference: tx.transactionReference || "N/A",
      receiverAddress: tx.receiverAddress || "N/A",
      fraudReference: tx.fraudReference || "N/A",
      paymentPurpose: tx.paymentPurpose || "N/A",
      fundsSource: tx.fundsSource || "N/A",
    }),
    []
  ); // Empty dependency array as it only depends on `formatTransactionStatus`

  const formatTransactionStatus = (status: string | undefined): string => {
    if (!status) return "Unknown";
    switch (status.toUpperCase()) {
      case "SUCCESS":
        return "Success";
      case "PENDING":
        return "Pending";
      case "FAILED":
      case "ERROR":
        return "Failed";
      case "REJECTED":
        return "Rejected";
      case "UNDER_REVIEW":
        return "Under Review";
      case "REVERSED":
        return "Reversed";
      case "REFUNDED":
        return "Refunded";
      case "ESCALATED":
        return "Escalated";
      default:
        return "Unknown";
    }
  };

  useEffect(() => {
    const fetchInitialPage = async () => {
      try {
        setLoading(true);
        const url = userIdFromQuery
          ? `https://api.tuma-app.com/api/transfer/user-transactions?userId=${userIdFromQuery}&page=1&size=${rowsPerPage}`
          : `https://api.tuma-app.com/api/transfer/all-transactions?page=1&size=${rowsPerPage}`;

        const res = await get<RawTransaction[]>(url);
        const formatted = res.map(mapApiTransactionToTransaction);

        setAllTransactions(formatted);
        setFilteredTransactions(formatted);
      } catch (err) {
        console.error("Failed to fetch initial transactions:", err);
        setError("Failed to fetch transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPage();
  }, []); // Added dependencies

  useEffect(() => {
    const fetchAllPagesRecursively = async () => {
      const batchSize = 50;
      let currentBatch = 2; // Start from page 2 as page 1 is fetched initially

      const fetchPage = async (page: number) => {
        if (loadedPages.has(page)) return null;

        const url = userIdFromQuery
          ? `https://api.tuma-app.com/api/transfer/user-transactions?userId=${userIdFromQuery}&page=${page}&size=${rowsPerPage}`
          : `https://api.tuma-app.com/api/transfer/all-transactions?page=${page}&size=${rowsPerPage}`;

        try {
          const res = await get<RawTransaction[]>(url);
          // Only add to loadedPages if data was actually returned
          if (res.length > 0) {
            setLoadedPages((prev) => new Set(prev).add(page));
          }
          return res.length > 0 ? res : null;
        } catch (err: unknown) {
          if (err && typeof err === "object" && "response" in err) {
            const axiosErr = err as { response?: { status?: number } };
            if (axiosErr.response?.status === 401) {
              // Redirect to login page
              router.push("/login");
            } else {
              console.error("Failed to fetch initial transactions:", err);
              setError("Failed to fetch transactions");
            }
          } else {
            console.error("Unexpected error:", err);
            setError("Failed to fetch transactions");
          }
          return null;
        }
      };

      const fetchInBatches = async () => {
        const batchPages = Array.from(
          { length: batchSize },
          (_, i) => currentBatch + i
        );
        // Filter out pages that are already loaded
        const pagesToFetch = batchPages.filter(
          (page) => !loadedPages.has(page)
        );

        if (pagesToFetch.length === 0) return; // No new pages to fetch

        const results = await Promise.all(pagesToFetch.map(fetchPage));

        const validResults = results.filter(Boolean) as RawTransaction[][];
        const flattened = validResults.flat();
        const formatted = flattened.map(mapApiTransactionToTransaction);

        setAllTransactions((prev) => {
          const seen = new Set(prev.map((tx) => tx.transactionId));
          const uniqueNew = formatted.filter(
            (tx) => !seen.has(tx.transactionId)
          );
          return [...prev, ...uniqueNew];
        });

        currentBatch += batchSize;

        // If any batch returned data, continue fetching more
        if (validResults.length > 0) {
          await new Promise((res) => setTimeout(res, 100));
          await fetchInBatches();
        }
      };

      // Ensure we only run this after the initial page is loaded and processed
      if (!loading && allTransactions.length > 0) {
        await fetchInBatches();
      }
    };

    // Only run if not loading and initial data is present
    if (!loading && allTransactions.length > 0) {
      fetchAllPagesRecursively();
    }
  }, [
    loadedPages,
    userIdFromQuery,
    get,
    mapApiTransactionToTransaction,
    loading,
    allTransactions.length,
  ]); // Added dependencies

  useEffect(() => {
    let filtered = [...allTransactions];

    if (statusFilter !== "All") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    if (selectedCountry) {
      const country = availableCountries.find(
        (c) => c.code === selectedCountry
      );
      if (country) {
        filtered = filtered.filter(
          (t) => t.receiverCurrencyIso3a === country.currency
        );
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.transactionId?.toString().includes(query) ||
          t.senderName?.toLowerCase().includes(query) ||
          t.receiverName?.toLowerCase().includes(query) ||
          t.currencyIso3a?.toLowerCase().includes(query) ||
          t.senderAmount?.toString().includes(query)
      );
    }

    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((t) => {
        const txDate = new Date(t.date).getTime();
        // Ensure endDate is inclusive by setting time to end of day
        const endOfDay = new Date(dateRange.endDate!);
        endOfDay.setHours(23, 59, 59, 999);

        return (
          txDate >= dateRange.startDate!.getTime() &&
          txDate <= endOfDay.getTime()
        );
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [
    searchQuery,
    statusFilter,
    dateRange,
    allTransactions,
    selectedCountry,
    availableCountries,
  ]);

  const handleOpenModal = (transactionId: string) => {
    setSelectedTransactionKey(transactionId);
    setIsModalOpen(true);
  };

  const handleExport = async () => {
    const toastId = toast.loading("Export in progress...");

    try {
      const fileName = generateExportFileName();
      const data = await prepareExportData(); // Await the async call!

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      XLSX.writeFile(workbook, `${fileName}.xlsx`, { compression: true });

      toast.success("Export completed!", { id: toastId });
    } catch (error) {
      toast.error("Export failed", { id: toastId });
      console.error("Export error:", error);
    }
  };

  const generateExportFileName = () => {
    let fileName = "transactions";
    if (searchQuery.trim())
      fileName += `_search_${searchQuery.trim().replace(/ /g, "_")}`;
    if (statusFilter !== "All")
      fileName += `_status_${statusFilter.toLowerCase()}`;
    // Only add _filtered if there are actual filters applied beyond just search
    if (
      searchQuery.trim() ||
      statusFilter !== "All" ||
      selectedCountry ||
      (dateRange.startDate && dateRange.endDate)
    ) {
      if (filteredTransactions.length !== allTransactions.length) {
        // Check if filtering actually reduced results
        fileName += "_filtered";
      }
    }
    if (dateRange.startDate && dateRange.endDate) {
      const start = dateRange.startDate.toISOString().split("T")[0];
      const end = dateRange.endDate.toISOString().split("T")[0];
      fileName += `_from_${start}_to_${end}`;
    }
    return fileName;
  };

  const prepareExportData = async () => {
    const fetchDetails = async (transaction: Transaction) => {
      try {
        // Use useApi().get for consistency and middleware benefits
        const fullDetails = await get<RawTransaction>(
          `/transfer/transaction-details?transactionId=${transaction.transactionId}`
        );

        return {
          "Transaction ID": Number(fullDetails.transactionId) || 0,
          "Transaction Key": fullDetails.transactionKey || "N/A",
          "Transaction Reference": fullDetails.transactionReference || "N/A",
          "User ID": Number(fullDetails.userId) || 0,
          "Sender Name": fullDetails.senderName || "N/A",
          "Sender's Number": fullDetails.senderPhone || "N/A",
          "Sender's Email": fullDetails.senderEmail || "N/A",
          "Recipient Name": fullDetails.receiverName || "N/A",
          "Recipient's Number": fullDetails.receiverPhone || "N/A",
          "Account Number": String(fullDetails.accountNumber || "N/A"),
          "Sender Amount": Number(fullDetails.senderAmount) || 0,
          "Recipient Amount": Number(fullDetails.recipientAmount) || 0,
          "Sender Currency": fullDetails.currencyIso3a || "N/A",
          "Destination Currency": fullDetails.receiverCurrencyIso3a || "N/A",
          Destination: fullDetails.receiverAddress || "N/A",
          "Exchange Rate": Number(fullDetails.exchangeRate) || 1,
          "Transaction Type": fullDetails.transactionType || "N/A",
          "Payment Description": fullDetails.paymentTypeDescription || "N/A",
          "Card Issuer": fullDetails.issuer || "N/A",
          "Masked Card Number": fullDetails.maskedPan || "N/A",
          "Settlement Reference": fullDetails.settlementReference || "N/A",
          "MPESA Reference": fullDetails.mpesaReference || "N/A",
          "Trust Payment Reference": fullDetails.tpReference || "N/A",
          "Bank Name": fullDetails.bankName || "N/A",
          Status: formatTransactionStatus(fullDetails.status),
          "Error Message": fullDetails.errorMessage || "N/A",
          "Date & Time (GMT)": formatDateTime(fullDetails.date || ""),
          "Fraud Reference": fullDetails.fraudReference || "N/A",
          "Payment Purpose": fullDetails.paymentPurpose || "N/A",
          "Source of Funds": fullDetails.fundsSource || "N/A",
        } as ExportTransaction;
      } catch (error) {
        console.error(
          `❌ Error fetching details for transaction ${transaction.transactionId}:`,
          error
        );
        // Return minimal info so the export still completes
        return {
          "Transaction ID": Number(transaction.transactionId) || 0,
          "Transaction Key": transaction.transactionKey || "N/A",
          "Transaction Reference": transaction.transactionReference || "N/A",
          "User ID": Number(transaction.userId) || 0,
          "Sender Name": transaction.senderName || "N/A",
          "Sender's Number": transaction.senderPhone || "N/A",
          "Sender's Email": transaction.senderEmail || "N/A",
          "Recipient Name": transaction.receiverName || "N/A",
          "Recipient's Number": transaction.receiverPhone || "N/A",
          "Account Number": String(transaction.accountNumber || "N/A"),
          "Sender Amount": Number(transaction.senderAmount) || 0,
          "Recipient Amount": Number(transaction.recipientAmount) || 0,
          "Sender Currency": transaction.currencyIso3a || "N/A",
          "Destination Currency": transaction.receiverCurrencyIso3a || "N/A",
          Destination: transaction.receiverAddress || "N/A",
          "Exchange Rate": Number(transaction.exchangeRate) || 1,
          "Transaction Type": transaction.transactionType || "N/A",
          "Payment Description": "N/A",
          "Card Issuer": "N/A",
          "Masked Card Number": "N/A",
          "Settlement Reference": transaction.settlementReference || "N/A",
          "MPESA Reference": transaction.mpesaReference || "N/A",
          "Trust Payment Reference": transaction.tpReference || "N/A",
          "Bank Name": transaction.bankName || "N/A",
          Status: transaction.status || "N/A",
          "Error Message": transaction.errorMessage || "N/A",
          "Date & Time (GMT)": formatDateTime(transaction.date),
          "Fraud Reference": transaction.fraudReference || "N/A",
          "Payment Purpose": transaction.paymentPurpose || "N/A",
          "Source of Funds": transaction.fundsSource || "N/A",
        } as ExportTransaction;
      }
    };

    // Run fetches in parallel batches to avoid API overload
    const concurrency = 10; // Reduced concurrency for safety, adjust as needed
    const results: ExportTransaction[] = [];

    for (let i = 0; i < filteredTransactions.length; i += concurrency) {
      const batch = filteredTransactions.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(fetchDetails));
      results.push(...batchResults);
      // Optional: Add a small delay between batches if the API is sensitive
      if (i + concurrency < filteredTransactions.length) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
      }
    }

    return results;
  };

  const formatDateTime = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      console.error("Invalid date string for formatting:", dateString, e);
      return dateString; // Return original if parsing fails
    }
  };

  const handleRetrySuccess = (updatedTransaction: Transaction) => {
    // Update both transaction lists
    setAllTransactions((prev: Transaction[]) =>
      prev.map((tx: Transaction) =>
        tx.transactionId === updatedTransaction.transactionId
          ? updatedTransaction
          : tx
      )
    );
    setFilteredTransactions((prev: Transaction[]) =>
      prev.map((tx: Transaction) =>
        tx.transactionId === updatedTransaction.transactionId
          ? updatedTransaction
          : tx
      )
    );
  };

  const toggleDropdown = (transactionId: string) => {
    setDropdownOpen(dropdownOpen === transactionId ? null : transactionId);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 md:ml-80 h-full overflow-y-auto bg-white">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-2xl font-semibold text-black">Transactions</h2>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-[450px]">
                <input
                  type="text"
                  placeholder="Search by sender, recipient, ID, currency"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-2 border rounded-md shadow-sm focus:ring focus:ring-gray-100"
                />
                <Search
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                  strokeWidth={2.5}
                />
              </div>

              <div className="relative" ref={dateFilterRef}>
                <button
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm text-md"
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
                        setShowDateFilter(false);
                      }}
                      onClear={() =>
                        setDateRange({ startDate: null, endDate: null })
                      }
                      initialStartDate={dateRange.startDate}
                      initialEndDate={dateRange.endDate}
                      isOpen={showDateFilter}
                      onClose={() => setShowDateFilter(false)}
                    />
                  </div>
                )}
              </div>
              <div className="relative" ref={countryDropdownRef}>
                <button
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100 w-full md:w-auto"
                >
                  {selectedCountry ? (
                    <>
                      <img
                        src={
                          availableCountries.find(
                            (c) => c.code === selectedCountry
                          )?.flag
                        }
                        alt={`${selectedCountry} flag`}
                        className="w-5 h-5"
                      />
                      <span className="text-sm">
                        {
                          availableCountries.find(
                            (c) => c.code === selectedCountry
                          )?.label
                        }
                      </span>
                    </>
                  ) : (
                    <span className="text-md">Filter by Receiving Country</span>
                  )}
                </button>

                {showCountryDropdown && (
                  <div className="absolute z-50 mt-2 bg-white border rounded shadow w-48">
                    {availableCountries.map((country) => (
                      <div
                        key={country.code}
                        onClick={() => {
                          setSelectedCountry(country.code);
                          setShowCountryDropdown(false);
                        }}
                        className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100"
                      >
                        <img
                          src={country.flag}
                          alt="flag"
                          className="w-5 h-5 mr-2"
                        />
                        {country.label} ({country.code})
                      </div>
                    ))}
                    <div
                      onClick={() => {
                        setSelectedCountry(null);
                        setShowCountryDropdown(false);
                      }}
                      className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 cursor-pointer border-t"
                    >
                      Reset filter
                    </div>
                  </div>
                )}
              </div>

              <div className="relative w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring focus:ring-gray-100 w-full"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100 w-full md:w-auto"
              >
                <FaFileExport /> Export
              </button>
            </div>
          </div>

          {/* Date filter active indicator */}
          {dateRange.startDate && (
            <div className="text-sm text-gray-500 mb-2">
              Showing transactions from{" "}
              {dateRange.startDate.toLocaleDateString()} to{" "}
              {dateRange.endDate?.toLocaleDateString()}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 text-sm">
                      <th className="px-6 py-3 hidden sm:table-cell">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3">Sender</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3 hidden sm:table-cell">
                        Currency
                      </th>
                      <th className="px-6 py-3 hidden md:table-cell">
                        Recipient
                      </th>
                      <th className="px-6 py-3 hidden md:table-cell">
                        Recipient Amount
                      </th>
                      <th className="px-6 py-3 hidden lg:table-cell">
                        Destination Currency
                      </th>
                      <th className="px-6 py-3 hidden lg:table-cell">Type</th>
                      <th className="px-6 py-3">Time</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: rowsPerPage }).map((_, i) => (
                      <tr key={i} className="animate-pulse border-b">
                        {Array.from({ length: 10 }).map((_, j) => (
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
                        <th className="px-6 py-3 hidden sm:table-cell">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3">Sender</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3 hidden sm:table-cell">
                          Currency
                        </th>
                        <th className="px-6 py-3 hidden md:table-cell">
                          Recipient
                        </th>
                        <th className="px-6 py-3 hidden md:table-cell">
                          Recipient Amount
                        </th>
                        <th className="px-6 py-3 hidden lg:table-cell">
                          Destination Currency
                        </th>
                        <th className="px-6 py-3 hidden lg:table-cell">Type</th>
                        <th className="px-6 py-3">Time</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Actions</th>
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
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() =>
                                handleOpenModal(transaction.transactionId)
                              }
                            >
                              <td className="px-6 py-4 hidden sm:table-cell">
                                {transaction.transactionId}
                              </td>
                              <td className="px-6 py-4">
                                {transaction.senderName}
                              </td>
                              <td className="px-6 py-4">
                                {transaction.senderAmount}
                              </td>
                              <td className="px-6 py-4 hidden sm:table-cell">
                                {transaction.currencyIso3a}
                              </td>
                              <td className="px-6 py-4 hidden md:table-cell">
                                {transaction.receiverName}
                              </td>
                              <td className="px-6 py-4 hidden md:table-cell">
                                {Number(transaction.recipientAmount).toFixed(0)}
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell">
                                {transaction.receiverCurrencyIso3a}
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell">
                                {transaction.transactionType}
                              </td>
                              <td className="px-6 py-4">
                                {formatDateTime(transaction.date)}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 text-sm font-semibold rounded-lg ${
                                    transaction.status === "Success"
                                      ? "text-green-700 bg-green-100"
                                      : transaction.status === "Pending"
                                        ? "text-yellow-700 bg-yellow-100"
                                        : transaction.status === "Failed"
                                          ? "text-red-700 bg-red-100"
                                          : transaction.status === "Refunded"
                                            ? "text-purple-700 bg-purple-100"
                                            : transaction.status ===
                                                "Under Review"
                                              ? "text-blue-700 bg-blue-100"
                                              : transaction.status ===
                                                  "Rejected"
                                                ? "text-orange-700 bg-orange-100"
                                                : transaction.status ===
                                                    "Escalated"
                                                  ? "text-amber-700 bg-amber-100"
                                                  : "text-black bg-gray-100"
                                  }`}
                                >
                                  {transaction.status}
                                </span>
                              </td>

                              <td
                                className="px-6 py-4 relative"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="relative">
                                  {transaction.fraudReference && (
                                    <>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleDropdown(
                                            transaction.transactionId
                                          );
                                        }}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <img
                                          src={"/backoffice/fraud.png"}
                                          className="h-4 w-4"
                                          alt="fraud icon"
                                        />
                                      </button>
                                      {dropdownOpen ===
                                        transaction.transactionId && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setShowFraudModal(true);
                                              setSelectedTransactionKey(
                                                transaction.fraudReference
                                              );
                                              setDropdownOpen(null);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          >
                                            View Fraud Info
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td
                            colSpan={10}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No transactions found.
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

      {isModalOpen && selectedTransactionKey && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <TransactionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            transactionId={selectedTransactionKey}
            onRetrySuccess={handleRetrySuccess}
          />
        </div>
      )}
      {showFraudModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <FraudModal
            isOpen={showFraudModal}
            onClose={() => setShowFraudModal(false)}
            fraudReference={selectedTransactionKey}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
