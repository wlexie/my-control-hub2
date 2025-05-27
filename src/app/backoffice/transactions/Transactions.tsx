"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import { FaCalendarAlt, FaFileExport } from "react-icons/fa";
import { Search } from "lucide-react";
import DateFilter from "../components/DateFilter";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import TransactionModal from "../components/TransactionModal";
import { Transaction } from "../types/transactions";
import * as XLSX from "xlsx";
import api from "../../../hooks/useApi";
import { useSearchParams } from "next/navigation";

type RawTransaction = Partial<{
  transactionReference: string;
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
}>;

const TransactionsPage = () => {
  const searchParams = useSearchParams();
  const userIdFilter = searchParams.get("userId");

  const { get } = api();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const dateFilterRef = useRef<HTMLDivElement>(null);

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

  // Pagination states

  const rowsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [serverPageToFetch, setServerPageToFetch] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Handle clicks outside date filter
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

  useEffect(() => {
    const fetchInitialTransactions = async () => {
      try {
        setLoading(true);
        setAllTransactions([]);
        setFilteredTransactions([]);
        setCurrentPage(1);
        setServerPageToFetch(1);
        setHasMoreData(true);

        const result = await get<RawTransaction[]>(
          `/transfer/all-transactions?page=1&size=${rowsPerPage}`
        );

        if (!result || !Array.isArray(result)) {
          throw new Error("Invalid API response format.");
        }

        const formatted = result.map(mapApiTransactionToTransaction);
        setAllTransactions(formatted);
        setFilteredTransactions(formatted);
        setServerPageToFetch(2);
        if (formatted.length < rowsPerPage) setHasMoreData(false);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialTransactions();
  }, []);

  const mapApiTransactionToTransaction = (tx: RawTransaction): Transaction => ({
    transactionReference: tx.transactionReference || "N/A",
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
    receiverCurrencyIso3a: tx.receiverCurrencyIso3a || "USD",
    mpesaReference: tx.mpesaReference || "N/A",
    tpReference: tx.tpReference || "N/A",
    errorMessage: tx.errorMessage || "N/A",
    userId:
      tx.userId !== undefined && tx.userId !== null && !isNaN(Number(tx.userId))
        ? Number(tx.userId)
        : null,
    bankName: tx.bankName || "N/A",
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
        return "Escalated";
      default:
        return "Unknown";
    }
  };

  const fetchMoreTransactions = useCallback(async () => {
    if (loadingMore || !hasMoreData) return;
    try {
      setLoadingMore(true);
      const result = await get<RawTransaction[]>(
        `/transfer/all-transactions?page=${serverPageToFetch}&size=${rowsPerPage}`
      );

      if (!result || !Array.isArray(result)) {
        setHasMoreData(false);
        return;
      }
      const formatted = result.map(mapApiTransactionToTransaction);
      setAllTransactions((prev) => [...prev, ...formatted]);
      setServerPageToFetch((prev) => prev + 1);
      if (formatted.length < rowsPerPage) setHasMoreData(false);
    } catch (err) {
      console.error("Fetch more error:", err);
      setHasMoreData(false);
    } finally {
      setLoadingMore(false);
    }
  }, [get, loadingMore, hasMoreData, serverPageToFetch, rowsPerPage]);

  // Filter transactions
  useEffect(() => {
    let filtered = allTransactions;

    if (statusFilter !== "All") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
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
        if (!t.date) return false;
        const transactionDate = new Date(t.date).getTime();
        return (
          transactionDate >= dateRange.startDate!.getTime() &&
          transactionDate <= dateRange.endDate!.getTime()
        );
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1);
  }, [searchQuery, allTransactions, statusFilter, dateRange, userIdFilter]);

  const handleDateChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
    setShowDateFilter(false);
  };

  const clearDateFilter = () => {
    setDateRange({ startDate: null, endDate: null });
  };

  const handleOpenModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleExport = () => {
    const fileName = generateExportFileName();
    const data = prepareExportData();

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, `${fileName}.xlsx`, { compression: true });
  };

  const generateExportFileName = () => {
    let fileName = "transactions";
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

  const prepareExportData = () => {
    return filteredTransactions.map((transaction) => ({
      "Transaction Reference": transaction.transactionReference,
      "Transaction ID": transaction.transactionId,
      "User ID": transaction.userId,
      Sender: transaction.senderName,
      "Sender's Number": transaction.senderPhone,
      "Sender's Email": transaction.senderEmail,
      Recipient: transaction.receiverName,
      "Recipient's Number": transaction.receiverPhone,
      "Recipient's Amount": transaction.recipientAmount,
      "Sender Amount": transaction.senderAmount,
      "Sender Currency": transaction.currencyIso3a,
      "Destination Currency": transaction.receiverCurrencyIso3a,
      "Exchange Rate": transaction.exchangeRate,
      "Transaction Type": transaction.transactionType,
      "Date & Time (GMT)": formatDateTime(transaction.date),
      Status: transaction.status,
      "Settlement Reference": transaction.settlementReference,
      "MPESA Reference": transaction.mpesaReference,
      "Trust Payment Reference": transaction.tpReference,
      "Bank Name": transaction.bankName,
    }));
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

  const handleNextPage = () => {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);

    if (
      newPage * rowsPerPage > allTransactions.length &&
      hasMoreData &&
      !loadingMore
    ) {
      fetchMoreTransactions();
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-80 flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 p-6 bg-white overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-black">Transactions</h2>
          <div className="flex gap-4">
            <div className="relative w-[600px] ">
              <input
                type="text"
                placeholder="Search by sender, recipient, ID, currency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-md shadow-sm focus:ring focus:ring-gray-100"
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 "
                strokeWidth={2.5}
              />
            </div>

            <div className="relative" ref={dateFilterRef}>
              <button
                onClick={() => setShowDateFilter(!showDateFilter)}
                className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100"
              >
                <FaCalendarAlt />
                {dateRange.startDate && dateRange.endDate ? (
                  <span className="text-sm">
                    {dateRange.startDate.toLocaleDateString()} -{" "}
                    {dateRange.endDate.toLocaleDateString()}
                  </span>
                ) : (
                  "Filter by date"
                )}
              </button>

              {dateRange.startDate && dateRange.endDate && (
                <button
                  onClick={clearDateFilter}
                  className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  title="Clear date filter"
                >
                  ×
                </button>
              )}

              {showDateFilter && (
                <>
                  {/* Overlay with blur effect */}
                  <div
                    className="fixed inset-0 backdrop-blur-sm bg-transparent z-40"
                    onClick={() => setShowDateFilter(false)}
                  />

                  {/* Modal container centered on screen */}
                  <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <DateFilter
                      onChange={handleDateChange}
                      onClear={clearDateFilter}
                      initialStartDate={dateRange.startDate}
                      initialEndDate={dateRange.endDate}
                      isOpen={showDateFilter}
                      onClose={() => setShowDateFilter(false)}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white border rounded-md px-4 py-2 pr-8 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring focus:ring-gray-100"
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
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-100"
            >
              <FaFileExport /> Export
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        {loading ? (
          <p className="text-center text-gray-500">Loading transactions...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm">
                    <th className="px-6 py-3">Transaction ID</th>
                    <th className="px-6 py-3">Sender</th>
                    <th className="px-6 py-3">Sender Amount</th>
                    <th className="px-6 py-3">Sender Currency</th>
                    <th className="px-6 py-3">Recipient</th>
                    <th className="px-6 py-3">Recipient Amount</th>
                    <th className="px-6 py-3">Destination Currency</th>
                    <th className="px-6 py-3">Transaction Type</th>
                    <th className="px-6 py-3">Time (GMT)</th>
                    <th className="px-6 py-3">Status</th>
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
                          onClick={() => handleOpenModal(transaction)}
                        >
                          <td className="px-6 py-4">
                            {transaction.transactionId}
                          </td>
                          <td className="px-6 py-4">
                            {transaction.senderName}
                          </td>
                          <td className="px-6 py-4">
                            {transaction.senderAmount}
                          </td>
                          <td className="px-6 py-4">
                            {transaction.currencyIso3a}
                          </td>
                          <td className="px-6 py-4">
                            {transaction.receiverName}
                          </td>
                          <td className="px-6 py-4">
                            {Number(transaction.recipientAmount).toFixed(0)}
                          </td>
                          <td className="px-6 py-4">
                            {transaction.receiverCurrencyIso3a}
                          </td>
                          <td className="px-6 py-4">
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
                                  : transaction.status === "Under Review"
                                  ? "text-blue-700 bg-blue-100"
                                  : transaction.status === "Rejected"
                                  ? "text-orange-700 bg-orange-100"
                                  : transaction.status === "Escalated"
                                  ? "text-amber-700 bg-amber-100"
                                  : "text-black bg-gray-100"
                              }`}
                            >
                              {transaction.status}
                            </span>
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

            {/* Pagination */}
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loadingMore || loading}
                className="px-4 py-2 border rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                onClick={handleNextPage}
                disabled={
                  loading ||
                  loadingMore ||
                  (currentPage * rowsPerPage >= filteredTransactions.length &&
                    !hasMoreData)
                }
                className="px-4 py-2 border rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Loading..." : "Next"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTransaction}
        />
      )}
    </div>
  );
};

export default TransactionsPage;
