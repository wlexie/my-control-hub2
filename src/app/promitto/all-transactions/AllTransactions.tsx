"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, ArrowRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import DateFilter from "../components/DateFilter";
import * as XLSX from "xlsx";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { FaCalendarAlt, FaFileExport } from "react-icons/fa";

// Raw response structure from the API
type ApiTransaction = {
  transactionId: number;
  transactionKey: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string | null;
  senderAmount: number;
  recipientAmount: number;
  exchangeRate: number;
  date: string;
  status:
    | "SUCCESS"
    | "PENDING"
    | "FAILED"
    | "REJECTED"
    | "UNDER_REVIEW"
    | "REVERSED"
    | "REFUNDED"
    | "ESCALATED"
    | "ERROR";
  currencyIso3a: string;
  receiverCurrencyIso3a: string;
  transactionType: string;
  accountNumber: string;
  settlementReference: string;
  tpReference: string;
  mpesaReference: string | null;
  errorMessage: string;
  userId: string | null;
  bankName: string | null;
};

export interface Transaction {
  transactionId: number;
  transactionKey: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string | null;
  senderAmount: number;
  recipientAmount: number;
  exchangeRate: number;
  date: string;
  status:
    | "Success"
    | "Pending"
    | "Failed"
    | "Rejected"
    | "Reversed"
    | "Refunded"
    | "Escalated"
    | "Under Review";
  currencyIso3a: string;
  receiverCurrencyIso3a: string;
  transactionType: string;
  accountNumber: string;
  settlementReference: string;
  tpReference: string;
  mpesaReference: string | null;
  rawDate: Date;
  errorMessage: string;
  userId: string | null;
  bankName: string | null;
}

const mapApiStatus = (
  status: ApiTransaction["status"]
): Transaction["status"] => {
  switch (status) {
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
      return "Failed";
  }
};

export default function AllTransactionsPage() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [exportType, setExportType] = useState<"all" | "filtered">("all");
  const [fileType, setFileType] = useState<"csv" | "excel">("csv");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const [allPagesLoaded, setAllPagesLoaded] = useState(false);
  const fetchedPages = useRef<Set<number>>(new Set());
  const rowsPerPage = 12;

  // Format date as DD/MM/YYYY
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format time in 24-hour format (EAT - UTC+3)
  const formatTimeEAT = (dateString: string | Date | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Format date and time for table display
  const formatDateTimeForTable = (
    dateString: string | Date | undefined
  ): string => {
    if (!dateString) return "N/A";
    return `${formatDate(dateString)} ${formatTimeEAT(dateString)}`;
  };

  const formatChannelName = (channel: string): string => {
    if (!channel) return "Unknown";
    switch (channel.toUpperCase()) {
      case "CARD_TO_BANK":
        return "Bank";
      case "CARD_TO_PAYBILL":
        return "M-PESA";
      default:
        return channel;
    }
  };

  // Fetch transactions from API
  useEffect(() => {
    const fetchInitialPage = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.tuma-app.com/api/transfer/partner-transactions?page=1&size=${rowsPerPage}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const transactionsData = Array.isArray(data)
          ? data
          : data.content || [];

        const mappedTransactions = transactionsData.map(
          (item: ApiTransaction) => ({
            transactionId: item.transactionId || 0,
            transactionKey: item.transactionKey || "N/A",
            senderName: item.senderName || "Unknown",
            senderEmail: item.senderEmail || "N/A",
            senderPhone: item.senderPhone || "N/A",
            receiverName: item.receiverName || "Unknown",
            receiverPhone: item.receiverPhone || null,
            senderAmount: item.senderAmount || 0,
            recipientAmount: item.recipientAmount || 0,
            exchangeRate: item.exchangeRate || 0,
            date: item.date ? formatDateTimeForTable(item.date) : "N/A",
            status: mapApiStatus(item.status),
            currencyIso3a: item.currencyIso3a || "N/A",
            receiverCurrencyIso3a: item.receiverCurrencyIso3a || "N/A",
            transactionType:
              formatChannelName(item.transactionType) || "Unknown",
            accountNumber: item.accountNumber || "N/A",
            settlementReference: item.settlementReference || "N/A",
            tpReference: item.tpReference || "N/A",
            mpesaReference: item.mpesaReference || null,
            rawDate: item.date ? new Date(item.date) : new Date(),
            errorMessage: item.errorMessage || "N/A",
            userId: item.userId || null,
            bankName: item.bankName || null,
          })
        );

        setAllTransactions(mappedTransactions);
        setFilteredTransactions(mappedTransactions);
        fetchedPages.current.add(1);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setAllTransactions([]);
        setFilteredTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPage();
  }, []);

  // Add this useEffect for background loading of remaining pages
  useEffect(() => {
    const loadRemainingPages = async () => {
      let page = 2;
      let hasMore = true;

      while (hasMore) {
        if (fetchedPages.current.has(page)) {
          page++;
          continue;
        }

        try {
          const response = await fetch(
            `https://api.tuma-app.com/api/transfer/partner-transactions?page=${page}&size=${rowsPerPage}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const transactionsData = Array.isArray(data)
            ? data
            : data.content || [];

          if (!transactionsData || transactionsData.length === 0) {
            hasMore = false;
            break;
          }

          const mappedTransactions = transactionsData.map(
            (item: ApiTransaction) => ({
              transactionId: item.transactionId || 0,
              transactionKey: item.transactionKey || "N/A",
              senderName: item.senderName || "Unknown",
              senderEmail: item.senderEmail || "N/A",
              senderPhone: item.senderPhone || "N/A",
              receiverName: item.receiverName || "Unknown",
              receiverPhone: item.receiverPhone || null,
              senderAmount: item.senderAmount || 0,
              recipientAmount: item.recipientAmount || 0,
              exchangeRate: item.exchangeRate || 0,
              date: item.date ? formatDateTimeForTable(item.date) : "N/A",
              status: mapApiStatus(item.status),
              currencyIso3a: item.currencyIso3a || "N/A",
              receiverCurrencyIso3a: item.receiverCurrencyIso3a || "N/A",
              transactionType:
                formatChannelName(item.transactionType) || "Unknown",
              accountNumber: item.accountNumber || "N/A",
              settlementReference: item.settlementReference || "N/A",
              tpReference: item.tpReference || "N/A",
              mpesaReference: item.mpesaReference || null,
              rawDate: item.date ? new Date(item.date) : new Date(),
              errorMessage: item.errorMessage || "N/A",
              userId: item.userId || null,
              bankName: item.bankName || null,
            })
          );

          // Prevent duplicates by checking for existing transaction IDs
          setAllTransactions((prev) => {
            const seen = new Set(prev.map((tx) => tx.transactionId));
            const uniqueNew = mappedTransactions.filter(
              (tx: { transactionId: number }) => !seen.has(tx.transactionId)
            );
            return [...prev, ...uniqueNew];
          });

          fetchedPages.current.add(page);
          page++;

          if (transactionsData.length < rowsPerPage) hasMore = false;
        } catch (error) {
          console.error("Error loading page", page, error);
          hasMore = false;
        }
      }

      setAllPagesLoaded(true);
    };

    loadRemainingPages();
  }, []);

  // Filter transactions based on search term and date range
  useEffect(() => {
    let filtered = allTransactions;

    // Apply search filter
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((transaction) => {
        return (
          transaction.transactionId?.toString().includes(query) ||
          transaction.senderName?.toLowerCase().includes(query) ||
          transaction.receiverName?.toLowerCase().includes(query) ||
          transaction.senderAmount?.toString().includes(query) ||
          transaction.transactionType?.toLowerCase().includes(query)
        );
      });
    }

    // Apply date filter if dates are selected
    if (dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((transaction) => {
        if (!transaction.rawDate) return false;

        // Get time in milliseconds for comparison
        const transactionTime = transaction.rawDate.getTime();
        const startTime = dateRange.startDate!.getTime();
        const endTime = dateRange.endDate!.getTime();

        return transactionTime >= startTime && transactionTime <= endTime;
      });
    }

    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, allTransactions, dateRange.startDate, dateRange.endDate]);

  // Calculate paginated data
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle date filter changes
  const handleDateChange = (startDate: Date, endDate: Date) => {
    setDateRange({
      startDate: new Date(startDate.setHours(0, 0, 0, 0)),
      endDate: new Date(endDate.setHours(23, 59, 59, 999)),
    });
    console.log("Filtering from:", startDate, "to:", endDate);
  };

  // Clear date filters
  const clearDateFilter = () => {
    setDateRange({ startDate: null, endDate: null });
    console.log("Date filter cleared");
  };

  // Export data function
  const handleExport = () => {
    const dataToExport =
      exportType === "all" ? allTransactions : filteredTransactions;
    let fileName = "transactions";

    if (exportType === "filtered") {
      fileName += "_filtered";
    }
    if (currentPage > 1) fileName += `_page_${currentPage}`;

    if (dateRange.startDate && dateRange.endDate) {
      const start = dateRange.startDate.toISOString().split("T")[0];
      const end = dateRange.endDate.toISOString().split("T")[0];
      fileName += `_from_${start}_to_${end}`;
    }

    // Fixed date formatting function
    const formatDateTimeForExport = (
      dateString: string | Date | undefined
    ): string => {
      if (!dateString) return "N/A";

      // Ensure we have a Date object
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A"; // Check for invalid date

      // Format date as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      // Format time in 24-hour format (EAT - UTC+3)
      date.setHours(date.getHours() + 3); // Add 3 hours for EAT
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    if (fileType === "excel") {
      const exportData = dataToExport.map((t) => ({
        "Transaction ID": t.transactionId,
        "User ID": t.userId || "N/A",
        "Transaction Key": t.transactionKey,
        "Sender Name": t.senderName,
        "Sender Email": t.senderEmail,
        "Sender Phone": t.senderPhone,
        "Receiver Name": t.receiverName,
        "Sender Amount": t.senderAmount,
        "Sender Currency": t.currencyIso3a,
        "Recipient Amount": t.recipientAmount,
        "Recipient Currency": t.receiverCurrencyIso3a,
        "Exchange Rate": t.exchangeRate,
        Date: formatDateTimeForExport(t.rawDate || t.date), // Use rawDate if available
        Status: t.status,
        "Transaction Type": t.transactionType,
        "Account Number": t.accountNumber,
        "Settlement Reference": t.settlementReference,
        "TP Reference": t.tpReference,
        "Mpesa Reference": t.mpesaReference,
        "Bank Name": t.bankName || "N/A",
        "Error Message": t.errorMessage,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    } else {
      const headers = [
        "Transaction ID",
        "User ID",
        "Transaction Key",
        "Sender Name",
        "Sender Email",
        "Sender Phone",
        "Receiver Name",
        "Sender Amount",
        "Sender Currency",
        "Recipient Amount",
        "Recipient Currency",
        "Exchange Rate",
        "Date",
        "Status",
        "Transaction Type",
        "Account Number",
        "Settlement Reference",
        "TP Reference",
        "Mpesa Reference",
        "Bank Name",
        "Error Message",
      ];

      const rows = dataToExport.map((t) => [
        t.transactionId,
        t.userId || "N/A",
        t.transactionKey,
        t.senderName,
        t.senderEmail,
        t.senderPhone,
        t.receiverName,
        t.senderAmount,
        t.currencyIso3a,
        t.recipientAmount,
        t.receiverCurrencyIso3a,
        t.exchangeRate,
        formatDateTimeForExport(t.rawDate || t.date), // Use rawDate if available
        t.status,
        t.transactionType,
        t.accountNumber,
        t.settlementReference,
        t.tpReference,
        t.mpesaReference,
        t.bankName || "N/A",
        t.errorMessage,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((field) => `"${field}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setIsExportModalVisible(false);
  };

  // Show modal when transaction is selected
  useEffect(() => {
    if (selectedTransaction) {
      setIsModalVisible(true);
    }
  }, [selectedTransaction]);

  // Close modal and clear selected transaction
  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedTransaction(null);
    }, 300);
  };

  // Download receipt as PDF
  const handleDownloadReceipt = async () => {
    if (!selectedTransaction || selectedTransaction.status !== "Success") {
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      pdfDoc.registerFontkit(fontkit);
      const page = pdfDoc.addPage([420, 594]);

      // You'll need to adjust these font paths based on your actual setup
      const fontBytes = await fetch(
        "/fonts/fonts/Outfit/static/Outfit-Regular.ttf"
      ).then((res) => res.arrayBuffer());
      const boldFontBytes = await fetch(
        "/fonts/fonts/Outfit/static/Outfit-Bold.ttf"
      ).then((res) => res.arrayBuffer());

      const font = await pdfDoc.embedFont(fontBytes);
      const boldFont = await pdfDoc.embedFont(boldFontBytes);

      // Embed logo - adjust path as needed
      const logoBytes = await fetch("/backoffice/tuma-logo.png").then((res) =>
        res.arrayBuffer()
      );
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoDims = logoImage.scale(0.35);

      const height = page.getHeight();
      const width = page.getWidth();
      let y = height - 60;

      const centerX = (text: string, size = 12, useFont = font) =>
        (width - useFont.widthOfTextAtSize(text, size)) / 2;

      const drawText = (
        text: string | number,
        opts: {
          x?: number;
          y?: number;
          size?: number;
          font?: typeof font;
          color?: [number, number, number];
          adjustY?: boolean;
        } = {}
      ) => {
        const str = text?.toString?.() ?? "";
        const fontToUse = opts.font ?? font;
        const size = opts.size ?? 12;
        const textX = opts.x ?? 50;
        const textY = opts.y ?? y;

        page.drawText(str, {
          x: textX,
          y: textY,
          size,
          font: fontToUse,
          color: rgb(...(opts.color ?? [0, 0, 0])),
        });

        if (opts.adjustY !== false) {
          y = textY - size - 4;
        }
      };

      // Logo
      page.drawImage(logoImage, {
        x: (width - logoDims.width) / 2,
        y: y,
        width: logoDims.width,
        height: logoDims.height,
      });

      y -= logoDims.height + 16;

      // Amount
      const amountText = `${
        selectedTransaction.receiverCurrencyIso3a ?? ""
      } ${Number(selectedTransaction.recipientAmount ?? 0).toLocaleString()}`;
      drawText(amountText, {
        font: boldFont,
        size: 20,
        x: centerX(amountText, 20, boldFont),
        y,
      });

      // "Successfully sent to..." bolded
      drawText(`Successfully sent to ${selectedTransaction.receiverName}`, {
        size: 10,
        font: boldFont,
        color: [0.4, 0.4, 0.4],
        x: centerX(
          `Successfully sent to ${selectedTransaction.receiverName}`,
          10,
          boldFont
        ),
      });

      // Time bolded
      drawText(`on ${selectedTransaction.date}`, {
        size: 10,
        font: boldFont,
        color: [0.4, 0.4, 0.4],
        x: centerX(`on ${selectedTransaction.date}`, 10, boldFont),
      });

      y -= 30;

      const drawBox = (title: string, items: [string, string][]) => {
        const boxTop = y;
        const boxLeft = 40;
        const boxWidth = width - 80;
        const boxHeight = 20 + items.length * 16 + 10;

        page.drawRectangle({
          x: boxLeft,
          y: boxTop - boxHeight,
          width: boxWidth,
          height: boxHeight,
          color: rgb(0.96, 0.97, 0.98),
        });

        let textY = boxTop - 16;
        drawText(title, {
          font: boldFont,
          size: 12,
          x: boxLeft + 10,
          y: textY,
          adjustY: false,
        });

        textY -= 6;

        items.forEach(([label, value]) => {
          textY -= 14;
          drawText(label, {
            size: 9,
            color: [0.4, 0.4, 0.4],
            x: boxLeft + 10,
            y: textY,
            adjustY: false,
          });
          drawText(value ?? "", {
            size: 9,
            font: boldFont,
            x: boxLeft + 180,
            y: textY,
            adjustY: false,
          });
        });

        y = boxTop - boxHeight - 16;
      };

      drawBox("Receiver", [
        ["Transaction ID", selectedTransaction.transactionId.toString()],
        ["Channel", selectedTransaction.transactionType],
        ["Purpose of payment", "Transfer"],
        ["Origin", "UK – KE"],
        ["Transaction fee", "0.00"],
        [
          "Exchange Rate",
          `1 ${selectedTransaction.currencyIso3a} = ${Number(
            selectedTransaction.exchangeRate ?? 0
          ).toFixed(0)} ${selectedTransaction.receiverCurrencyIso3a ?? ""}`,
        ],
      ]);

      drawBox("Sender", [
        ["Sender Name", selectedTransaction.senderName || "N/A"],
        ["Phone Number", selectedTransaction.senderPhone || "N/A"],
      ]);

      // Footer
      const footerLines = [
        "Thank you for using Tuma!",
        "For inquiries or assistance, contact us:",
        "support@tuma.com | +447-778-024-995",
        "tuma.com",
      ];

      footerLines.forEach((line, idx) => {
        drawText(line, {
          size: 9,
          color: idx >= 1 ? [0.4, 0.4, 0.4] : [0, 0, 0],
          x: centerX(line, 9),
          adjustY: true,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt_${selectedTransaction.transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Render status icon for modal
  const renderStatusIcon = () => {
    if (!selectedTransaction) return null;

    const iconProps = {
      xmlns: "http://www.w3.org/2000/svg",
      width: "60",
      height: "60",
      viewBox: "0 0 24 24",
    };

    switch (selectedTransaction.status) {
      case "Success":
        return (
          <svg {...iconProps}>
            <path
              fill="#048020"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            />
          </svg>
        );
      case "Pending":
        return (
          <svg {...iconProps}>
            <path
              fill="#FFA500"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-13h-2v6h2V7zm0 8h-2v2h2v-2z"
            />
          </svg>
        );
      case "Failed":
      case "Rejected":
        return (
          <svg {...iconProps}>
            <path
              fill="#FF0000"
              d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"
            />
          </svg>
        );
      case "Under Review":
      case "Escalated":
        return (
          <svg {...iconProps}>
            <path
              fill="#1E90FF"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
            />
          </svg>
        );
      case "Refunded":
      case "Reversed":
        return (
          <svg {...iconProps}>
            <path
              fill="#800080"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
            />
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <path
              fill="#808080"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
            />
          </svg>
        );
    }
  };

  const renderStatusMessage = () => {
    if (!selectedTransaction) return null;

    const dateDisplay = selectedTransaction.date ? (
      <p className="text-md text-gray-400 mt-1">
        on{" "}
        <span className="text-black font-semibold">
          {selectedTransaction.date}
        </span>
      </p>
    ) : null;

    switch (selectedTransaction.status) {
      case "Success":
        return (
          <>
            <p className="text-gray-500 mt-1">
              Successfully sent to{" "}
              <span className="text-black font-semibold text-md">
                {selectedTransaction.receiverName}
              </span>
            </p>
            {dateDisplay}
          </>
        );
      case "Pending":
        return (
          <>
            <p className="text-gray-500 mt-1">
              Transaction pending with{" "}
              <span className="text-black font-semibold text-md">
                {selectedTransaction.receiverName}
              </span>
            </p>
            {dateDisplay}
          </>
        );
      case "Failed":
      case "Rejected":
        return (
          <>
            <p className="text-gray-500 mt-1">
              Transaction failed to{" "}
              <span className="text-black font-semibold text-md">
                {selectedTransaction.receiverName}
              </span>
            </p>
            {dateDisplay}
          </>
        );
      case "Under Review":
        return (
          <>
            <p className="text-gray-500 mt-1">
              Transaction under review for{" "}
              <span className="text-black font-semibold text-md">
                {selectedTransaction.receiverName}
              </span>
            </p>
            {dateDisplay}
          </>
        );
      case "Refunded":
      case "Reversed":
        return (
          <>
            <p className="text-gray-500 mt-1">
              Transaction refunded to{" "}
              <span className="text-black font-semibold text-md">
                {selectedTransaction.senderName}
              </span>
            </p>
            {dateDisplay}
          </>
        );
      case "Escalated":
        return (
          <>
            <p className="text-gray-500 mt-1">
              Transaction escalated for{" "}
              <span className="text-black font-semibold text-md">
                {selectedTransaction.receiverName}
              </span>
            </p>
            {dateDisplay}
          </>
        );
      default:
        return (
          <>
            <p className="text-gray-500 mt-1">
              Transaction {selectedTransaction.status} for{" "}
              <span className="text-black font-semibold text-md">
                {selectedTransaction.receiverName}
              </span>
            </p>
            {dateDisplay}
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-8 space-y-8 ml-80">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold">All transactions</h1>
          <div className="flex items-center gap-6">
            <div className="relative w-[300px] sm:w-[400px] md:w-[500px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 flex-wrap" />
              <input
                type="text"
                placeholder="Search by name, ID, or channel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDateFilter(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-md hover:bg-gray-400 border border-gray-300"
              >
                <FaCalendarAlt /> Filter by Date
              </button>
              {showDateFilter && (
                <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-lg p-4 z-10">
                  <DateFilter
                    isOpen={showDateFilter}
                    onClose={() => setShowDateFilter(false)}
                    onChange={handleDateChange}
                    onClear={clearDateFilter}
                    initialStartDate={dateRange.startDate}
                    initialEndDate={dateRange.endDate}
                  />
                  {dateRange.startDate && (
                    <button
                      onClick={clearDateFilter}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                    >
                      Clear date filter
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsExportModalVisible(true)}
              className="flex items-center gap-2 px-4 py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
            >
              <FaFileExport /> Export
            </button>
          </div>
        </div>
        {/* Date filter active indicator */}
        {dateRange.startDate && (
          <div className="text-sm text-gray-500">
            Showing transactions from {dateRange.startDate.toLocaleDateString()}{" "}
            to {dateRange.endDate?.toLocaleDateString()}
          </div>
        )}
        {/* Export Modal */}
        {isExportModalVisible && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className="bg-black bg-opacity-30 w-full h-full"
              onClick={() => setIsExportModalVisible(false)}
            ></div>
            <div className="bg-white w-96 h-full shadow-lg p-6 overflow-y-auto relative transform transition-transform duration-300 translate-x-0">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
                onClick={() => setIsExportModalVisible(false)}
              >
                &times;
              </button>
              <h2 className="text-lg font-bold text-gray-900">
                Export Transactions
              </h2>
              <div className="mt-4 space-y-4">
                <label className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer">
                  <span className="text-gray-700 text-sm">
                    All Transactions
                  </span>
                  <input
                    type="radio"
                    name="transactionType"
                    value="all"
                    checked={exportType === "all"}
                    onChange={() => setExportType("all")}
                    className="form-checkbox text-green-500"
                  />
                </label>
                <label className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer">
                  <span className="text-gray-700 text-sm">
                    Filtered Transactions
                  </span>
                  <input
                    type="radio"
                    name="transactionType"
                    value="filtered"
                    checked={exportType === "filtered"}
                    onChange={() => setExportType("filtered")}
                    className="form-checkbox text-green-500"
                  />
                </label>
              </div>
              <h3 className="mt-6 text-sm font-bold text-gray-900">
                Export as:
              </h3>
              <div className="mt-4 space-y-4">
                <label className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer">
                  <span className="text-gray-700 text-sm">CSV</span>
                  <input
                    type="radio"
                    name="fileType"
                    value="csv"
                    checked={fileType === "csv"}
                    onChange={() => setFileType("csv")}
                    className="form-checkbox text-green-500"
                  />
                </label>
                <label className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer">
                  <span className="text-gray-700 text-sm">Excel</span>
                  <input
                    type="radio"
                    name="fileType"
                    value="excel"
                    checked={fileType === "excel"}
                    onChange={() => setFileType("excel")}
                    className="form-checkbox text-green-500"
                  />
                </label>
              </div>
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setIsExportModalVisible(false)}
                  className="px-6 py-2 border border-yellow-500 text-yellow-500 text-sm font-semibold rounded-md hover:bg-yellow-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-6 py-2 bg-yellow-500 text-white text-sm font-semibold rounded-md hover:bg-yellow-600"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Transactions Table */}
        <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full table-auto text-left">
            <thead className="bg-white">
              <tr className="text-gray-400 font-light text-sm">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Sender Amount</th>
                <th className="py-3 px-4">Sender Currency</th>
                <th className="py-3 px-4">Recipient Amount</th>
                <th className="py-3 px-4">Recipient Currency</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={10}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <tr
                    key={transaction.transactionId}
                    className="text-gray-700 cursor-pointer text-sm hover:bg-gray-50"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <td className="py-4 px-6">{transaction.senderName}</td>
                    <td className="py-3 px-4">{transaction.transactionId}</td>
                    <td className="py-3 px-4">
                      {transaction.senderAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">{transaction.currencyIso3a}</td>
                    <td className="py-3 px-4">
                      {Math.ceil(transaction.recipientAmount)}
                    </td>
                    <td className="py-3 px-4">
                      {transaction.receiverCurrencyIso3a}
                    </td>
                    <td className="py-3 px-4">{transaction.transactionType}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${
                          transaction.status === "Success"
                            ? "text-green-600 bg-green-100"
                            : "text-red-600 bg-red-100"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{transaction.date}</td>
                    <td className="py-3 px-4 text-right">
                      <ArrowRight className="h-5 w-5 text-gray-500" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-6 px-4 text-center text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {currentPage} of{" "}
              {Math.ceil(filteredTransactions.length / rowsPerPage)}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={
                currentPage >=
                  Math.ceil(filteredTransactions.length / rowsPerPage) &&
                allPagesLoaded
              }
              className="px-4 py-2 border rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {allPagesLoaded ||
              currentPage < Math.ceil(filteredTransactions.length / rowsPerPage)
                ? "Next"
                : "Loading..."}
            </button>
          </div>
        )}

        {!allPagesLoaded && (
          <p className="text-xs text-gray-500 mt-1 text-center">
            ⚠ Filtering results may be incomplete. More data is still
            loading...
          </p>
        )}

        {/* Transaction Details Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div
              className=" bg-opacity-50 bg-black/30 backdrop-blur-sm w-full h-full fixed inset-0"
              onClick={closeModal}
            ></div>

            <div
              className={`bg-white w-[28rem] h-screen shadow-lg fixed right-0 transform transition-transform duration-300 ${
                isModalVisible ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-end p-6 border-b sticky top-0 bg-white z-10">
                <button
                  className="text-gray-500 hover:text-gray-800 text-3xl"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>

              <div className="overflow-y-auto p-6 h-[calc(100vh-80px)]">
                {" "}
                {/* Adjust height for header */}
                <div className=" space-y-8">
                  <div className="text-center mb-6">
                    <div className="mx-auto rounded-full flex items-center justify-center">
                      {renderStatusIcon()}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mt-4">
                      {selectedTransaction.senderAmount.toFixed(2)}{" "}
                      {selectedTransaction.currencyIso3a}
                    </h3>
                    {renderStatusMessage()}
                  </div>

                  <div className="mt-6">
                    <div className="grid grid-cols-2 gap-y-4 text-gray-700">
                      <p className="text-gray-400">Transaction ID:</p>
                      <p>{selectedTransaction.transactionId}</p>
                      <p className="text-gray-400">User ID:</p>
                      <p>{selectedTransaction.userId || "N/A"}</p>
                      <p className="text-gray-400">Transaction Key:</p>
                      <p>{selectedTransaction.transactionKey}</p>
                      <p className="text-gray-400">Channel:</p>
                      <p>{selectedTransaction.transactionType}</p>
                      <p className="text-gray-400">Bank Name:</p>
                      <p>{selectedTransaction.bankName || "N/A"}</p>
                      <p className="text-gray-400">Purpose:</p>
                      <p>Transfer</p>
                      <p className="text-gray-400">Sender Currency:</p>
                      <p>{selectedTransaction.currencyIso3a}</p>
                      <p className="text-gray-400">Recipient Currency:</p>
                      <p>{selectedTransaction.receiverCurrencyIso3a}</p>
                      <p className="text-gray-400">Trust Payments:</p>
                      <p>{selectedTransaction.tpReference}</p>
                      <p className="text-gray-400">Settlement Reference:</p>
                      <p>{selectedTransaction.settlementReference}</p>
                      <p className="text-gray-400">MPESA Reference:</p>
                      <p>{selectedTransaction.mpesaReference || "N/A"}</p>
                      <p className="text-gray-400">Account Number:</p>
                      <p>{selectedTransaction.accountNumber}</p>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-y-4 text-gray-700 border border-dotted py-2 px-2 border-gray-300">
                      <p className="text-gray-400">Exchange Rate:</p>
                      <p>{selectedTransaction.exchangeRate.toFixed(2)}</p>
                      <p className="text-gray-400">Transaction Fee:</p>
                      <p>0.00</p>
                      <p className="text-gray-400">Recipient Amount:</p>
                      <p>
                        {selectedTransaction.recipientAmount.toFixed(2)}{" "}
                        {selectedTransaction.receiverCurrencyIso3a}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 border-t pt-4 text-center">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      Sender
                    </h4>
                    <div className="flex flex-col items-center space-y-4">
                      <div>
                        <p className="text-gray-700 font-semibold">
                          {selectedTransaction.senderName}
                        </p>
                        <p className="text-gray-500 text-lg">
                          {selectedTransaction.senderPhone}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {selectedTransaction.senderEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 border-t pt-4 text-center">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      Receiver
                    </h4>
                    <div className="flex flex-col items-center space-y-4">
                      <div>
                        <p className="text-gray-700 font-semibold">
                          {selectedTransaction.receiverName}
                        </p>
                        {selectedTransaction.receiverPhone && (
                          <p className="text-gray-500 text-lg">
                            {selectedTransaction.receiverPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedTransaction.status === "Success" && (
                    <div className="mt-8 text-center">
                      <button
                        className="flex items-center justify-center gap-2 text-yellow-500 font-semibold hover:text-yellow-600 mx-auto"
                        onClick={handleDownloadReceipt}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Download Receipt
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </main>
    </div>
  );
}
