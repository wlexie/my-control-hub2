"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Transaction } from "../types/transactions";
import { generateReceiptPDF } from "./generateReceipt";

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
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
  transaction,
}) => {
  const [isClient, setIsClient] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute right-0 top-0 h-full w-[460px] bg-white shadow-lg flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                {transaction.transactionId}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-scroll p-6">
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

            <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-between items-center">
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionModal;
