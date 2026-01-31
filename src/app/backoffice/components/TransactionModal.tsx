"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Transaction } from "../types/transactions";
import { generateReceiptPDF } from "./generateReceipt";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { authFetch } from "@/utils/authFetch";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
  onRetrySuccess?: (transaction: Transaction) => void;
};

interface RawComment {
  id: number;
  commentType: string;
  text: string;
  internalUser: string;
  createdAt: string;
  modifiedAt: string;
}

interface Comment {
  id: number;
  author: string;
  createdAt: string;
  text: string;
  commentType: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
}

const getStatusDetails = (status: string, errorMessage?: string) => {
  const normalizedStatus = status === "ERROR" ? "FAILED" : status;
  const baseDetails = {
    SUCCESS: {
      title: "Transaction Successful",
      icon: "/backoffice/icons/success.svg",
      reason: "Transaction has been completed and funds have been delivered",
    },
    FAILED: {
      title: "Transaction Failed",
      icon: "/backoffice/icons/failed.svg",
      reason: errorMessage || "Transaction failed to process",
    },
    REJECTED: {
      title: "Transaction Rejected",
      icon: "/backoffice/icons/rejected.svg",
      reason: errorMessage || "Transaction was rejected by the receiving bank",
    },
    PENDING: {
      title: "Transaction Pending",
      icon: "/backoffice/icons/pending.svg",
      reason: errorMessage || "Transaction is being processed",
    },
    REVERSED: {
      title: "Transaction Reversed",
      icon: "/backoffice/icons/reversed.svg",
      reason: "Transaction has been reversed to sender",
    },
    REFUNDED: {
      title: "Transaction Refunded",
      icon: "/backoffice/icons/refunded.svg",
      reason: "Amount has been refunded to sender",
    },
    ESCALATED: {
      title: "Transaction Escalated",
      icon: "/backoffice/icons/escalated.svg",
      reason: "Transaction requires manual review",
    },
    ERROR: {
      title: "Transaction Error",
      icon: "/backoffice/icons/error.svg",
      reason: errorMessage,
    },
    "UNDER REVIEW": {
      title: "Transaction Under Review",
      icon: "/backoffice/icons/under-review.svg",
      reason: "Transaction is being reviewed for compliance",
    },
  };

  return (
    baseDetails[normalizedStatus as keyof typeof baseDetails] || {
      title: "Transaction Status Unknown",
      icon: "/backoffice/icons/unknown.png",
      reason: "Status reason not available",
    }
  );
};

const mapApiTransactionToTransaction = (tx: Transaction): Transaction => ({
  transactionId: tx.transactionId || "N/A",
  senderName: tx.senderName || "Unknown Sender",
  receiverName: tx.receiverName || "Unknown Recipient",
  senderAmount: tx.senderAmount || 0,
  currencyIso3a: tx.currencyIso3a || "USD",
  date: tx.date || new Date().toISOString(),
  status: tx.status || "UNKNOWN",
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
  transactionReference: tx.transactionReference || "",
  maskedPan: tx.maskedPan || "N/A",
  issuer: tx.issuer || "N/A",
  paymentTypeDescription: tx.paymentTypeDescription || "N/A",
  receiverAddress: tx.receiverAddress || "N/A",
  fraudReference: tx.fraudReference,
  paymentPurpose: tx.paymentPurpose,
  fundsSource: tx.fundsSource,
});

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transactionId,
  onRetrySuccess,
}) => {
  const [isClient, setIsClient] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const userRoles = useSelector((state: RootState) => state.auth.user?.roles);
  const isAdmin = userRoles?.includes("ADMIN");

  const getAuthToken = () => {
    return Cookies.get("accessToken");
  };
  const fetchComments = async (transactionId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setIsLoadingComments(true);
      const res = await fetch(
        `https://api.tuma-app.com/api/communication/transaction-comments/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch comments");

      const result: { comments: RawComment[] } = await res.json();
      const commentList = result.comments || [];

      const internalUserKeys = [
        ...new Set(commentList.map((c) => c.internalUser).filter(Boolean)),
      ];

      const nameMap: Record<string, string> = { ...userMap };

      // Fetch missing user names using accountKey
      await Promise.all(
        internalUserKeys.map(async (accountKey) => {
          if (!nameMap[accountKey]) {
            const userRes = await fetch(
              `https://api.tuma-app.com/api/account/client-profile?accountKey=${accountKey}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (userRes.ok) {
              const data: UserProfile = await userRes.json();
              nameMap[accountKey] = `${data.firstName} ${data.lastName}`.trim();
            }
          }
        })
      );

      setUserMap(nameMap);

      const mappedComments: Comment[] = commentList.map((item) => ({
        id: item.id,
        author: nameMap[item.internalUser] || "Admin",
        createdAt: item.createdAt,
        text: item.text,
        commentType: item.commentType,
      }));

      setComments(mappedComments);
    } catch (err) {
      console.error("Error fetching comments", err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    if (!transaction?.transactionId) {
      toast.error("No transaction ID found");
      return;
    }

    try {
      setIsProcessing(true);
      const token = getAuthToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        "https://api.tuma-app.com/api/communication/add-transaction-comment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            commentType: "INTERNAL_NOTE",
            text: comment.trim(),
            transactionId: transaction.transactionId,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || "Comment added successfully");
        setComment("");
        setIsAddingComment(false);
        await fetchComments(transaction.transactionId);
      } else {
        throw new Error(result.message || "Failed to add comment");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add comment"
      );
      console.error("Add comment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (isOpen && transaction?.transactionId) {
      fetchComments(transaction.transactionId);
    }
  }, [isOpen, transaction?.transactionId]);

  useEffect(() => {
    setIsClient(true);
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  console.log("Fetching with transactionKey:", transactionId);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.tuma-app.com/api/transfer/transaction-details?transactionId=${transactionId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transaction");
      }

      const data = await response.json();
      const mappedTransaction = mapApiTransactionToTransaction(data);
      setTransaction(mappedTransaction);
    } catch (error) {
      console.error("Error fetching transaction:", error);
      toast.error("Failed to load transaction details");
      setTransaction(null); // prevent stale values
    } finally {
      setLoading(false);
    }
  };

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
    date.setHours(date.getHours() + 3); // Convert to East Africa Time
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
        return "Bank Transfer";
      case "CARD_TO_MPESA":
        return "M-PESA";
      case "CARD_TO_CARD":
        return "Card Transfer";
      default:
        return channel || "Unknown";
    }
  };

  const retryPendingPayment = async () => {
    if (!transaction?.transactionReference) {
      throw new Error("Transaction reference not available");
    }

    const data = await authFetch(
      `/transfer/settle-pending-payment?transactionReference=${transaction.transactionReference}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    return data; // always return, handle logic outside
  };

  const handleRetryPayment = async () => {
    if (!transaction?.transactionReference) {
      toast.error("Transaction reference not available");
      return;
    }

    setIsRetrying(true);
    try {
      const response = await retryPendingPayment();
      console.log("Retry Payment API Response:", response);

      if (response.status === "ok" && response.success) {
        toast.success(response.message || "Payment settled successfully");

        // refresh status
        await fetchTransaction();

        if (onRetrySuccess && transaction) {
          onRetrySuccess({ ...transaction, status: "SUCCESS" });
        }

        // Close modal after success
        onClose();
      } else {
        toast.error(
          response.message || "We are unable to complete your payout request"
        );

        if (onRetrySuccess && transaction) {
          onRetrySuccess({ ...transaction, status: "FAILED" });
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Retry Payment Error:", error);
        toast.error(error.message || "Failed to retry payment");
      } else {
        console.error("Unknown error:", error);
        toast.error("An unknown error occurred while retrying payment.");
      }
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOpen) return null;

  if (loading || !transaction) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full mx-4"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Loading Transaction
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600">Loading transaction details...</p>
            <p className="text-sm text-gray-500 mt-2">
              Transaction ID: {transactionId}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const statusDetails = getStatusDetails(
    transaction.status === "ERROR" ? "FAILED" : transaction.status,
    transaction.errorMessage
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 overflow-y-auto py-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative mx-auto my-8 max-w-6xl w-full"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Transaction Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {transaction.transactionId}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {transaction.status === "PENDING" && isAdmin && (
                    <button
                      onClick={handleRetryPayment}
                      disabled={isRetrying || !transaction.transactionReference}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isRetrying ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </span>
                      ) : (
                        "Settle Payment"
                      )}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl p-1"
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>
              </div>

              {/* Main Content - Multi-row Layout */}
              <div className="p-6">
                {/* Status Banner */}
                <div className="flex items-center justify-center text-center mb-8 p-4 bg-gray-50 rounded-xl">
                  <img
                    src={statusDetails.icon}
                    alt="status icon"
                    className="w-16 h-16 mr-4"
                  />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {statusDetails.title}
                    </h3>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                      {statusDetails.reason}
                    </p>
                  </div>
                </div>

                {/* Multi-column Layout for Transaction Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: Transaction Summary */}
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                      Transaction Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Amount Sent:</span>
                        <span className="font-bold text-lg text-gray-900">
                          {transaction.senderAmount} {transaction.currencyIso3a}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Amount Received:</span>
                        <span className="font-bold text-lg text-gray-900">
                          {Number(transaction.recipientAmount).toFixed(0)}{" "}
                          {transaction.receiverCurrencyIso3a}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Exchange Rate:</span>
                        <span>{transaction.exchangeRate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Transfer Fee:</span>
                        <span>0.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Payment Method:</span>
                        <span>
                          {formatChannelName(transaction.transactionType)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Sender & Receiver Details */}
                  <div className="space-y-6">
                    {/* Sender Details */}
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                        Sender Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">
                            {transaction.senderName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium break-all">
                            {transaction.senderEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">
                            {transaction.senderPhone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Receiver Details */}
                    <div className="bg-gray-50 p-5 rounded-xl">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                        Receiver Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">
                            {transaction.receiverName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium">
                            {transaction.receiverPhone || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Account Number
                          </p>
                          <p className="font-medium">
                            {transaction.accountNumber || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Payment Details */}
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h3 className="font-semibold text-gray-800 mb-4 text-lg">
                      Payment Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Bank Name</p>
                        <p className="font-medium">
                          {transaction.bankName || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Card Type</p>
                        <p className="font-medium">
                          {transaction.paymentTypeDescription || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Card Issuer</p>
                        <p className="font-medium">
                          {transaction.issuer || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Masked Card</p>
                        <p className="font-medium">
                          {transaction.maskedPan || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Destination</p>
                        <p className="font-medium">
                          {transaction.receiverAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reference Numbers Grid */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-medium text-sm truncate">
                      {transaction.transactionId}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Tuma Reference</p>
                    <p className="font-medium text-sm">
                      {transaction.transactionKey || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Trust Payment Ref</p>
                    <p className="font-medium text-sm break-all whitespace-normal">
                      {transaction.tpReference || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Settlement Reference
                    </p>
                    <p className="font-medium text-sm">
                      {transaction.settlementReference || "N/A"}
                    </p>
                  </div>
                  {/* Conditionally show MPESA Reference only if not "N/A" */}
                  {transaction.mpesaReference &&
                    transaction.mpesaReference !== "N/A" && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">
                          {transaction.transactionType === "CARD_TO_BANK"
                            ? "Bank Reference"
                            : "MPESA Reference"}
                        </p>
                        <p className="font-medium text-sm break-words">
                          {transaction.mpesaReference}
                        </p>
                      </div>
                    )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Transaction Reference
                    </p>
                    <p className="font-medium text-sm">
                      {transaction.transactionReference || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">User ID</p>
                    <p className="font-medium text-sm">
                      {transaction.userId || "N/A"}
                    </p>
                  </div>
                  {/* <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Fraud Reference</p>
                    <p className="font-medium text-sm">
                      {transaction.fraudReference || "N/A"}
                    </p>
                  </div> */}
                </div>

                {/* Additional Information */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Additional Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Payment Purpose</p>
                        <p className="font-medium">
                          {transaction.paymentPurpose || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Source of Funds</p>
                        <p className="font-medium">
                          {transaction.fundsSource || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h4 className="font-semibold text-gray-800 mb-3">
                      Timing Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Time Sent (GMT)</p>
                        <p className="font-medium">
                          {formatDateTime(transaction.date)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Time Received (EAT)
                        </p>
                        <p className="font-medium">
                          {formatDateEAT(transaction.date)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-gray-800">
                        Internal Comments
                      </h4>
                      <button
                        onClick={() => setIsAddingComment(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Add Comment
                      </button>
                    </div>

                    {isAddingComment && (
                      <div className="mb-4">
                        <textarea
                          rows={3}
                          placeholder="Type your comment here..."
                          className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={handleAddComment}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg flex-1 transition-colors disabled:opacity-50"
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Adding..." : "Add Comment"}
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingComment(false);
                              setComment("");
                            }}
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {isLoadingComments ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : comments.length > 0 ? (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-white p-3 rounded-lg border border-gray-200"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-medium text-gray-900">
                                {comment.author}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                    timeZone: "GMT",
                                  }
                                )}{" "}
                                GMT
                              </p>
                            </div>
                            <p className="text-sm text-gray-700">
                              {comment.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic text-center py-6">
                        No comments yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-between items-center pt-6 border-t">
                  <div>
                    {isClient && transaction.status === "SUCCESS" && (
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
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        <img
                          src="/backoffice/icons/download.svg"
                          alt="download icon"
                          className="w-5 h-5"
                        />
                        Download Receipt
                      </button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransactionModal;
