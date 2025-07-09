"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Transaction } from "../types/transactions";
import { generateReceiptPDF } from "./generateReceipt";
import toast from "react-hot-toast";

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onRetrySuccess?: (transaction: Transaction) => void;
};

const getStatusDetails = (status: string, errorMessage?: string) => {
  const baseDetails = {
    Success: {
      title: "Transaction Successful",
      icon: "/backoffice/icons/success.svg",
      reason: "Transaction has been completed and funds have been delivered",
    },
    Failed: {
      title: "Transaction Failed",
      icon: "/backoffice/icons/failed.svg",
      reason: errorMessage || "N/A",
    },
    Rejected: {
      title: "Transaction Rejected",
      icon: "/backoffice/icons/rejected.svg",
      reason: errorMessage || "Transaction was rejected by the receiving bank",
    },
    Pending: {
      title: "Transaction Pending",
      icon: "/backoffice/icons/pending.svg",
      reason: "Transaction is being processed",
    },
    Reversed: {
      title: "Transaction Reversed",
      icon: "/backoffice/icons/reversed.svg",
      reason: "Transaction has been reversed to sender",
    },
    Refunded: {
      title: "Transaction Refunded",
      icon: "/backoffice/icons/refunded.svg",
      reason: "Amount has been refunded to sender",
    },
    Escalated: {
      title: "Transaction Escalated",
      icon: "/backoffice/icons/escalated.svg",
      reason: "Transaction requires manual review",
    },
    Error: {
      title: "Transaction Error",
      icon: "/backoffice/icons/error.svg",
      reason: errorMessage || "Insufficient funds in account",
    },
    "Under Review": {
      title: "Transaction Under Review",
      icon: "/backoffice/icons/under-review.svg",
      reason: "Transaction is being reviewed for compliance",
    },
  };

  return (
    baseDetails[status as keyof typeof baseDetails] || {
      title: "Transaction Status Unknown",
      icon: "/backoffice/icons/unknown.png",
      reason: "Status reason not available",
    }
  );
};

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction: initialTransaction,
  onRetrySuccess,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(
    initialTransaction
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isOpen || !transaction) return null;

  const statusDetails = getStatusDetails(
    transaction.status,
    transaction.errorMessage
  );

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDateEAT = (dateString: string): string => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatChannelName = (channel: string): string => {
    switch (channel?.toUpperCase()) {
      case "CARD_TO_BANK":
        return "Bank";
      case "CARD_TO_PAYBILL":
        return "M-PESA";
      default:
        return channel || "Unknown";
    }
  };

  const retryPendingPayment = async (transactionReference: string) => {
    const response = await fetch(
      `https://api.tuma-app.com/api/transfer/settle-pending-payment?transactionReference=${transactionReference}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Payment retry failed");
    }

    return data;
  };

  const handleRetryPayment = async () => {
    if (!transaction) return;

    setIsRetrying(true);
    try {
      const response = await retryPendingPayment(transaction.transactionKey);
      console.log("Retry Payment API Response:", response);

      if (response.status === "ok") {
        toast.success(
          response.message || "Payment retry initiated successfully"
        );

        const updatedTransaction = { ...transaction, status: "Success" };
        setTransaction(updatedTransaction);
        onRetrySuccess?.(updatedTransaction);

        setTimeout(() => onClose(), 2000);
      } else {
        toast.error(response.message || "Unexpected response from server");
      }
    } catch (error: any) {
      console.error("Retry Payment Error:", error);

      if (error.message?.includes("TRANSACTION.NOT.FOUND")) {
        toast.error("Transaction not found");
        setTransaction((prev: Transaction | null) =>
          prev ? { ...prev, status: "Failed" } : null
        );
      } else {
        toast.error(error.message || "Failed to retry payment");
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile: Bottom sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden absolute bottom-0 left-0 right-0 h-[90vh] bg-white rounded-t-3xl shadow-xl flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold text-gray-900">
                  {transaction.transactionId}
                </h2>
                <div className="flex items-center gap-2">
                  {transaction.status === "Pending" && (
                    <button
                      onClick={handleRetryPayment}
                      disabled={isRetrying}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRetrying ? "Processing..." : "Retry Payment"}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex flex-col items-center text-center mb-4">
                  <img
                    src={statusDetails.icon}
                    alt="status icon"
                    className="w-16 h-16"
                  />
                  <h3 className="text-lg font-bold mt-2">
                    {statusDetails.title}
                  </h3>
                  <p className="text-gray-400 mt-1 text-sm">
                    {statusDetails.reason}
                  </p>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Transaction Details
                    </h3>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                      <p className="text-gray-500">Amount Sent:</p>
                      <p className="font-semibold text-black">
                        {transaction.senderAmount} {transaction.currencyIso3a}
                      </p>
                      <p className="text-gray-500">Amount Received:</p>
                      <p className="font-semibold text-black">
                        {Number(transaction.recipientAmount).toFixed(0)}{" "}
                        {transaction.receiverCurrencyIso3a}
                      </p>
                      <p className="text-gray-500">Exchange Rate:</p>
                      <p>{transaction.exchangeRate}</p>
                      <p className="text-gray-500">Transfer Fee:</p>
                      <p>0.00</p>
                      <p className="text-gray-500">Payment Method:</p>
                      <p>{transaction.transactionType}</p>
                      <p className="text-gray-500">Bank Name:</p>
                      <p>{transaction.bankName || "N/A"}</p>
                      <p className="text-gray-500">Transaction ID:</p>
                      <p className="truncate">{transaction.transactionId}</p>
                      <p className="text-gray-500">User ID:</p>
                      <p>{transaction.userId || "N/A"}</p>
                      <p className="text-gray-500">Tuma Reference:</p>
                      <p>{transaction.transactionKey || "N/A"}</p>
                      <p className="text-gray-500">Trust Payment:</p>
                      <p>{transaction.tpReference || "N/A"}</p>
                      <p className="text-gray-500">Settlement Reference:</p>
                      <p>{transaction.settlementReference || "N/A"}</p>
                      <p className="text-gray-500">MPESA Reference:</p>
                      <p>{transaction.mpesaReference || "N/A"}</p>
                      <p className="text-gray-500">Origin:</p>
                      <p>UK</p>
                      <p className="text-gray-500">Destination:</p>
                      <p>Kenya</p>
                      <p className="text-gray-500">Time Sent:</p>
                      <p>{formatDateTime(transaction.date)}</p>
                      <p className="text-gray-500">Time Received:</p>
                      <p>{formatDateEAT(transaction.date)}</p>
                    </div>
                  </div>

                  {/* Sender Details */}
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Sender Details
                    </h3>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                      <p className="text-gray-500">Name:</p>
                      <p className="truncate">{transaction.senderName}</p>
                      <p className="text-gray-500">Email:</p>
                      <p className="break-all overflow-hidden text-ellipsis">
                        {transaction.senderEmail}
                      </p>
                      <p className="text-gray-500">Number:</p>
                      <p className="truncate">{transaction.senderPhone}</p>
                    </div>
                  </div>

                  {/* Receiver Details */}
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Receiver Details
                    </h3>
                    <div className="grid grid-cols-2 gap-y-1 text-sm">
                      <p className="text-gray-500">Name:</p>
                      <p>{transaction.receiverName}</p>
                      <p className="text-gray-500">Number:</p>
                      <p>{transaction.receiverPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 left-0 right-0 bg-white p-3 border-t flex justify-between items-center">
                {isClient && transaction.status === "Success" && (
                  <button
                    onClick={async () => {
                      const blob = await generateReceiptPDF(
                        transaction,
                        formatDateTime,
                        formatDateEAT,
                        formatChannelName
                      );
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `Receipt_${transaction.transactionId}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-blue-600 font-medium text-sm flex items-center gap-1"
                  >
                    <img
                      src="/backoffice/icons/download.svg"
                      alt="download icon"
                      className="w-4 h-4"
                    />
                    Download Receipt
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-3 py-1.5 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>

            {/* Desktop: Side panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="hidden md:flex fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-lg flex-col z-50"
            >
              <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-900">
                  {transaction.transactionId}
                </h2>
                <div className="flex items-center gap-4">
                  {transaction.status === "Pending" && (
                    <button
                      onClick={handleRetryPayment}
                      disabled={isRetrying}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRetrying ? "Processing..." : "Retry Payment"}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={statusDetails.icon}
                    alt="status icon"
                    className="w-20 h-20"
                  />
                  <h3 className="text-xl font-bold mt-2">
                    {statusDetails.title}
                  </h3>
                  <p className="text-gray-400 mt-2 max-w-xs">
                    {statusDetails.reason}
                  </p>
                </div>

                {/* Transaction Details */}
                <div className="mt-4 space-y-2">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Transaction Details
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2 text-gray-700">
                      <p className="text-gray-400">Amount Sent:</p>
                      <p className="font-semibold text-black">
                        {transaction.senderAmount} {transaction.currencyIso3a}
                      </p>
                      <p className="text-gray-400">Amount Received:</p>
                      <p className="font-semibold text-black">
                        {Number(transaction.recipientAmount).toFixed(0)}{" "}
                        {transaction.receiverCurrencyIso3a}
                      </p>
                      <p className="text-gray-400">Exchange Rate:</p>
                      <p>{transaction.exchangeRate}</p>
                      <p className="text-gray-400">Transfer Fee:</p>
                      <p>0.00</p>
                      <p className="text-gray-400">Payment Method:</p>
                      <p>{transaction.transactionType}</p>
                      <p className="text-gray-400">Bank Name:</p>
                      <p>{transaction.bankName || "N/A"}</p>
                      <p className="text-gray-400">Transaction ID:</p>
                      <p>{transaction.transactionId}</p>
                      <p className="text-gray-400">User ID:</p>
                      <p>{transaction.userId || "N/A"}</p>
                      <p className="text-gray-400">Tuma Reference:</p>
                      <p>{transaction.transactionKey || "N/A"}</p>
                      <p className="text-gray-400">Trust Payment:</p>
                      <p>{transaction.tpReference || "N/A"}</p>
                      <p className="text-gray-400">Settlement Reference:</p>
                      <p>{transaction.settlementReference || "N/A"}</p>
                      <p className="text-gray-400">MPESA Reference:</p>
                      <p>{transaction.mpesaReference || "N/A"}</p>
                      <p className="text-gray-400">Origin:</p>
                      <p>UK</p>
                      <p className="text-gray-400">Destination:</p>
                      <p>Kenya</p>
                      <p className="text-gray-400">Time Sent:</p>
                      <p>{formatDateTime(transaction.date)}</p>
                      <p className="text-gray-400">Time Received:</p>
                      <p>{formatDateEAT(transaction.date)}</p>
                    </div>
                  </div>

                  {/* Sender Details */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Sender Details
                    </h3>
                    <div className="grid grid-cols-2 gap-y-3 text-gray-700">
                      <p className="text-gray-500">Name:</p>
                      <p className="truncate">{transaction.senderName}</p>
                      <p className="text-gray-500">Email:</p>
                      <p className="break-all overflow-hidden text-ellipsis">
                        {transaction.senderEmail}
                      </p>
                      <p className="text-gray-500">Number:</p>
                      <p className="truncate">{transaction.senderPhone}</p>
                    </div>
                  </div>

                  {/* Receiver Details */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Receiver Details
                    </h3>
                    <div className="grid grid-cols-2 gap-y-2 text-gray-700">
                      <p className="text-gray-400">Name:</p>
                      <p>{transaction.receiverName}</p>
                      <p className="text-gray-400">Number:</p>
                      <p>{transaction.receiverPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className=" flex-shrink-0 sticky bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-between items-center">
                {isClient && transaction.status === "Success" && (
                  <button
                    onClick={async () => {
                      const blob = await generateReceiptPDF(
                        transaction,
                        formatDateTime,
                        formatDateEAT,
                        formatChannelName
                      );
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `Receipt_${transaction.transactionId}.pdf`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="text-blue-600 font-semibold flex items-center gap-2"
                  >
                    <img
                      src="/backoffice/icons/download.svg"
                      alt="download icon"
                      className="w-4 h-4"
                    />
                    Download Receipt
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionModal;
