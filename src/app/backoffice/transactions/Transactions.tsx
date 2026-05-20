"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import { FaCalendarAlt, FaFileExport, FaFilter } from "react-icons/fa";
import { Search } from "lucide-react";
import TransactionDateFilter from "../components/TransactionDateFilter";
import TransactionModal from "../components/TransactionModal";
import FraudModal from "../compliance-security/components/FraudModal";
import { Transaction } from "../types/transactions";
import * as XLSX from "xlsx";
import api from "../../../utils/apiService";
import { useSearchParams } from "next/navigation";
import { useMediaQuery } from "react-responsive";
import toast from "react-hot-toast";
import { IoIosArrowDropdownCircle } from "react-icons/io";

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
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [fetchProgress, setFetchProgress] = useState<{
    loaded: number;
    total: number | null;
  }>({ loaded: 0, total: null });
  const fetchAbortRef = useRef<(() => void) | null>(null);
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const [showFraudModal, setShowFraudModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<
    string | null
  >(null);

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

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

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
        code: "TZ",
        label: "Tanzania",
        flag: "/backoffice/tz.png",
        currency: "TZS",
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
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setActiveFilter(null);
      }
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

  useEffect(() => {
    // Cancel any previous fetch run
    if (fetchAbortRef.current) fetchAbortRef.current();
    let cancelled = false;
    fetchAbortRef.current = () => {
      cancelled = true;
    };

    const CONCURRENCY = 8; // parallel requests at once
    const PAGE_SIZE = 50; // rows per API page

    const run = async () => {
      try {
        setLoading(true);
        setIsFetchingMore(false);
        setFetchProgress({ loaded: 0, total: null });
        setAllTransactions([]);
        setFilteredTransactions([]);

        // ── Step 1: fetch page 1 to show data immediately ──────────────
        const firstEndpoint = userIdFromQuery
          ? `/transfer/user-transactions?userId=${userIdFromQuery}&page=1&size=${PAGE_SIZE}`
          : `/transfer/all-transactions?page=1&size=${PAGE_SIZE}`;

        const firstRes = await api.get<RawTransaction[]>(firstEndpoint);
        if (cancelled) return;

        const firstPage = firstRes.data;
        const firstFormatted = firstPage
          .map(mapApiTransactionToTransaction)
          .filter((tx) => tx.currencyIso3a?.toUpperCase() !== "TZS");

        setAllTransactions(firstFormatted);
        setLoading(false);

        // If first page returned fewer rows than PAGE_SIZE, we're done
        if (firstPage.length < PAGE_SIZE) {
          setFetchProgress({
            loaded: firstFormatted.length,
            total: firstFormatted.length,
          });
          return;
        }

        // ── Step 2: fetch remaining pages with controlled concurrency ───
        setIsFetchingMore(true);
        setFetchProgress({ loaded: firstFormatted.length, total: null });

        let page = 2;
        let done = false;

        while (!done && !cancelled) {
          // Build a batch of CONCURRENCY pages
          const batch = Array.from({ length: CONCURRENCY }, (_, i) => page + i);
          page += CONCURRENCY;

          const results = await Promise.all(
            batch.map(async (p) => {
              const endpoint = userIdFromQuery
                ? `/transfer/user-transactions?userId=${userIdFromQuery}&page=${p}&size=${PAGE_SIZE}`
                : `/transfer/all-transactions?page=${p}&size=${PAGE_SIZE}`;
              try {
                const res = await api.get<RawTransaction[]>(endpoint);
                return res.data as RawTransaction[];
              } catch {
                return [] as RawTransaction[];
              }
            }),
          );

          if (cancelled) return;

          // If every response in the batch was empty, we've hit the end
          const allEmpty = results.every((r) => r.length === 0);
          if (allEmpty) {
            done = true;
            break;
          }

          // If any page returned fewer than PAGE_SIZE rows, this is the last batch
          if (results.some((r) => r.length < PAGE_SIZE)) done = true;

          const newRows = results
            .flat()
            .map(mapApiTransactionToTransaction)
            .filter((tx) => tx.currencyIso3a?.toUpperCase() !== "TZS");

          setAllTransactions((prev) => {
            const seen = new Set(prev.map((tx) => tx.transactionId));
            const unique = newRows.filter((tx) => !seen.has(tx.transactionId));
            const next = [...prev, ...unique];
            setFetchProgress({
              loaded: next.length,
              total: done ? next.length : null,
            });
            return next;
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Fetch error:", err);
          setError("Failed to fetch transactions");
          setLoading(false);
        }
      } finally {
        if (!cancelled) setIsFetchingMore(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [userIdFromQuery]);

  useEffect(() => {
    let filtered = [...allTransactions];

    if (statusFilter !== "All") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }
    if (selectedCountry) {
      const country = availableCountries.find(
        (c) => c.code === selectedCountry,
        (c) => c.code === selectedCountry,
      );
      if (country) {
        filtered = filtered.filter(
          (t) => t.receiverCurrencyIso3a === country.currency,
          (t) => t.receiverCurrencyIso3a === country.currency,
        );
      }
    }
    if (transactionTypeFilter) {
      filtered = filtered.filter(
        (t) => t.transactionType === transactionTypeFilter,
        (t) => t.transactionType === transactionTypeFilter,
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.transactionId?.toString().includes(query) ||
          t.senderName?.toLowerCase().includes(query) ||
          t.receiverName?.toLowerCase().includes(query) ||
          t.currencyIso3a?.toLowerCase().includes(query) ||
          t.senderAmount?.toString().includes(query) ||
          t.transactionReference?.toLowerCase().includes(query) ||
          t.settlementReference?.toLowerCase().includes(query),
          t.settlementReference?.toLowerCase().includes(query),
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
    statusFilter,
    dateRange,
    allTransactions,
    selectedCountry,
    transactionTypeFilter,
  ]);

  const mapApiTransactionToTransaction = (tx: RawTransaction): Transaction => ({
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
      tx.userId !== undefined && tx.userId !== null && !isNaN(Number(tx.userId))
        ? Number(tx.userId)
        : null,
    bankName: tx.bankName || "N/A",
    transactionReference: tx.transactionReference || "N/A",
    receiverAddress: tx.receiverAddress || "N/A",
    fraudReference: tx.fraudReference || "N/A",
    paymentPurpose: tx.paymentPurpose || "N/A",
    fundsSource: tx.fundsSource || "N/A",
  });

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
        return "Escalate";
      default:
        return "Unknown";
    }
  };

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
    let fileName = "Transactions";
    if (searchQuery.trim())
      fileName += `_search_${searchQuery.trim().replace(/ /g, "_")}`;
    if (statusFilter !== "All")
      fileName += `_status_${statusFilter.toLowerCase()}`;
    if (filteredTransactions !== allTransactions) fileName += "_filtered";
    if (dateRange.startDate && dateRange.endDate) {
      const start = dateRange.startDate.toISOString().split("T")[0];
      const end = dateRange.endDate.toISOString().split("T")[0];
      fileName += `_from_${start}_to_${end}`;
    }
    return fileName;
  };

  const fetchTransactionDetails = async (
    transaction: Transaction,
    transaction: Transaction,
  ): Promise<ExportTransaction> => {
    const response = await api.get(
      `/transfer/transaction-details?transactionId=${transaction.transactionId}`,
      `/transfer/transaction-details?transactionId=${transaction.transactionId}`,
    );

    const fullDetails = response.data;
    return mapToExportFormat(fullDetails);
  };

  const mapToExportFormat = (
    fullDetails: RawTransaction & {
      paymentTypeDescription?: string;
      issuer?: string;
      maskedPan?: string;
    },
    },
  ): ExportTransaction => ({
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
    Status: fullDetails.status || "N/A",
    "Error Message": fullDetails.errorMessage || "N/A",
    "Date & Time (GMT)": formatDateTime(
      fullDetails.date || new Date().toISOString(),
      fullDetails.date || new Date().toISOString(),
    ),
    "Fraud Reference": fullDetails.fraudReference || "N/A",
    "Payment Purpose": fullDetails.paymentPurpose || "N/A",
    "Source of Funds": fullDetails.fundsSource || "N/A",
  });

  const createFallbackExportData = (
    transaction: Transaction,
    transaction: Transaction,
  ): ExportTransaction => ({
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
  });

  const fetchWithRetry = async (
    transaction: Transaction,
    retries: number,
    retries: number,
  ): Promise<ExportTransaction> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fetchTransactionDetails(transaction);
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1)),
          setTimeout(resolve, 1000 * (attempt + 1)),
        );
      }
    }
    throw new Error("All retry attempts failed");
  };

  const prepareExportData = async (
    onProgress?: (progress: number) => void,
    onProgress?: (progress: number) => void,
  ): Promise<ExportTransaction[]> => {
    const BATCH_SIZE = 20;
    const RETRY_ATTEMPTS = 2;
    const DELAY_BETWEEN_BATCHES = 100;

    const results: ExportTransaction[] = [];

    for (let i = 0; i < filteredTransactions.length; i += BATCH_SIZE) {
      const batch = filteredTransactions.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.allSettled(
        batch.map((transaction) => fetchWithRetry(transaction, RETRY_ATTEMPTS)),
        batch.map((transaction) => fetchWithRetry(transaction, RETRY_ATTEMPTS)),
      );

      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          results.push(result.value);
        } else {
          console.error(
            `Failed to fetch transaction ${batch[index].transactionId}:`,
            result.reason,
            result.reason,
          );
          results.push(createFallbackExportData(batch[index]));
        }
      });

      if (onProgress) {
        const progress = Math.round(
          ((i + BATCH_SIZE) / filteredTransactions.length) * 100,
          ((i + BATCH_SIZE) / filteredTransactions.length) * 100,
        );
        onProgress(Math.min(progress, 100));
      }

      if (i + BATCH_SIZE < filteredTransactions.length) {
        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_BATCHES),
          setTimeout(resolve, DELAY_BETWEEN_BATCHES),
        );
      }
    }

    return results;
  };

  const handleExport = async () => {
    if (filteredTransactions.length > 50) {
      const shouldProceed = window.confirm(
        `This will export ${filteredTransactions.length} transactions. This may take several minutes. Continue?`,
        `This will export ${filteredTransactions.length} transactions. This may take several minutes. Continue?`,
      );
      if (!shouldProceed) return;
    }

    const toastId = toast.loading("Preparing export...");

    try {
      const fileName = generateExportFileName();

      if (filteredTransactions.length > 20) {
        toast.loading(`Exporting... 0%`, { id: toastId });
      }

      const data = await prepareExportData((progress) => {
        if (filteredTransactions.length > 20) {
          toast.loading(`Exporting... ${progress}%`, { id: toastId });
        }
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);

      toast.success(`Exported ${data.length} transactions successfully!!`, {
        id: toastId,
      });
    } catch (error) {
      toast.error("Export failed", { id: toastId });
      console.error("Export error:", error);
    }
  };

  const handleOpenModal = (transactionId: string) => {
    setSelectedTransactionKey(transactionId);
    setIsModalOpen(true);
  };

  const handleRetrySuccess = (updatedTransaction: Transaction) => {
    setAllTransactions((prev: Transaction[]) =>
      prev.map((tx: Transaction) =>
        tx.transactionId === updatedTransaction.transactionId
          ? updatedTransaction
          : tx,
      ),
          : tx,
      ),
    );
    setFilteredTransactions((prev: Transaction[]) =>
      prev.map((tx: Transaction) =>
        tx.transactionId === updatedTransaction.transactionId
          ? updatedTransaction
          : tx,
      ),
          : tx,
      ),
    );
  };

  const toggleDropdown = (transactionId: string) => {
    setDropdownOpen(dropdownOpen === transactionId ? null : transactionId);
  };

  const formatTransactionType = (type?: string) => {
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
          {/* Header Section - All in one line on desktop */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h2 className="text-2xl font-semibold text-black md:shrink-0">
              Transactions
            </h2>

            {/* Search Bar - Centered in Desktop */}
            <div className="relative w-full md:w-[450px] md:mx-auto order-3 md:order-0">
              <input
                type="text"
                placeholder="Search transactions by ID, Sender and Recipient"
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
                  <TransactionDateFilter
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
            <div className="flex gap-2 w-full md:w-auto order-2 md:order-0">
              {/* Consolidated Filter Button */}
              <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100 w-full md:w-auto"
                >
                  <FaFilter />
                  Filters
                </button>

                {showFilterDropdown && (
                  <div className="absolute left-0 md:left-auto md:right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50">
                    {/* Status Filter */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveFilter(
                            activeFilter === "status" ? null : "status",
                            activeFilter === "status" ? null : "status",
                          )
                        }
                        className="w-full text-left px-4 py-2 hover:bg-gray-200 flex justify-between items-center"
                      >
                        Status
                        <span>
                          <IoIosArrowDropdownCircle />
                        </span>
                      </button>
                      {activeFilter === "status" && (
                        <div className="absolute left-28 top-0 ml-1 w-48 bg-white border rounded-md shadow-lg z-50">
                          {statusOptions.map((status) => (
                            <div
                              key={status}
                              onClick={() => {
                                setStatusFilter(status);
                                setActiveFilter(null);
                              }}
                              className={`px-4 py-2 cursor-pointer hover:bg-gray-200 ${
                                statusFilter === status ? "bg-blue-200" : ""
                              }`}
                            >
                              {status}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Country Filter */}
                    <div className="relative border-t">
                      <button
                        onClick={() =>
                          setActiveFilter(
                            activeFilter === "country" ? null : "country",
                            activeFilter === "country" ? null : "country",
                          )
                        }
                        className="w-full text-left px-4 py-2 hover:bg-gray-200 flex justify-between items-center"
                      >
                        Country
                        <span>
                          <IoIosArrowDropdownCircle />
                        </span>
                      </button>
                      {activeFilter === "country" && (
                        <div className="absolute left-28 top-0 ml-1 w-48 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                          {availableCountries.map((country) => (
                            <div
                              key={country.code}
                              onClick={() => {
                                setSelectedCountry(country.code);
                                setActiveFilter(null);
                              }}
                              className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-200"
                            >
                              <img
                                src={country.flag}
                                alt="flag"
                                className="w-5 h-5 mr-2"
                              />
                              {country.label}
                            </div>
                          ))}
                          <div
                            onClick={() => {
                              setSelectedCountry(null);
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
                            activeFilter === "type" ? null : "type",
                            activeFilter === "type" ? null : "type",
                          )
                        }
                        className="w-full text-left px-4 py-2 hover:bg-gray-200 flex justify-between items-center"
                      >
                        Transaction Type
                        <IoIosArrowDropdownCircle />
                      </button>

                      {activeFilter === "type" && (
                        <div className="absolute left-28 top-0 ml-1 w-56 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
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
                        setStatusFilter("All");
                        setSelectedCountry(null);
                        setTransactionTypeFilter(null);
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

          {/* Filters Row -Active filters display */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Active Filters Display - Below on desktop, like date range indicator */}
            <div className="flex flex-wrap gap-2 items-center">
              {statusFilter !== "All" && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Status: {statusFilter}
                  <button
                    onClick={() => setStatusFilter("All")}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCountry && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Country:{" "}
                  {
                    availableCountries.find((c) => c.code === selectedCountry)
                      ?.label
                  }
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}

              {transactionTypeFilter && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                  Transaction Type:{" "}
                  {
                    TRANSACTION_TYPE_OPTIONS.find(
                      (t) => t.value === transactionTypeFilter,
                      (t) => t.value === transactionTypeFilter,
                    )?.label
                  }
                  <button
                    onClick={() => setTransactionTypeFilter(null)}
                    className="ml-1 hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          {/* Live fetch progress banner */}
          {isFetchingMore && (
            <div className="flex items-center gap-3 mb-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
              <svg
                className="animate-spin h-4 w-4 text-blue-500 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>
                Loading more transactions…{" "}
                <span className="font-semibold">
                  {fetchProgress.loaded.toLocaleString()}
                </span>
                {fetchProgress.total
                  ? ` of ${fetchProgress.total.toLocaleString()}`
                  : ""}{" "}
                loaded. You can filter now — results update as more arrive.
              </span>
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

          {/* Rest of your table and components remain exactly the same */}
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
                            currentPage * rowsPerPage,
                            currentPage * rowsPerPage,
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
                              <td className="px-6 py-4 hidden lg:table-cell whitespace-nowrap">
                                {formatTransactionType(
                                  transaction.transactionType,
                                  transaction.transactionType,
                                )}
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
                                            transaction.transactionId,
                                            transaction.transactionId,
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
                                                transaction.fraudReference,
                                                transaction.fraudReference,
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
                            No transactions found .
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

