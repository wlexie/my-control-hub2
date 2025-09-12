"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Transaction } from "../types/transactions";
import { generateReceiptPDF } from "./generateReceipt";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { authFetch } from "@/utils/authFetch";

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

    if (isOpen && transactionId) {
      fetchTransaction();
    } else {
      setTransaction(null);
      setLoading(true);
    }
  }, [isOpen, transactionId]);

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
        toast.success(
          response.message || "Payment retry initiated successfully"
        );
        fetchTransaction(); // refresh latest status

        if (onRetrySuccess && transaction) {
          onRetrySuccess({ ...transaction, status: "SUCCESS" });
        }
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
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  const statusDetails = getStatusDetails(
    transaction.status === "ERROR" ? "FAILED" : transaction.status,
    transaction.errorMessage
  );

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
                  {transaction.status === "PENDING" && (
                    <button
                      onClick={handleRetryPayment}
                      disabled={isRetrying || !transaction.transactionReference}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRetrying ? "Processing..." : "Settle Payment"}
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
                      <p>{formatChannelName(transaction.transactionType)}</p>
                      <p className="text-gray-500">Bank Name:</p>
                      <p>{transaction.bankName || "N/A"}</p>
                      <p className="text-gray-500">Card Type:</p>
                      <p>{transaction.paymentTypeDescription || "N/A"}</p>
                      <p className="text-gray-500">Card Issuer:</p>
                      <p>{transaction.issuer || "N/A"}</p>
                      <p className="text-gray-500">Masked Card:</p>
                      <p>{transaction.maskedPan || "N/A"}</p>
                      <p className="text-gray-500">Transaction ID:</p>
                      <p className="truncate">{transaction.transactionId}</p>
                      <p className="text-gray-500">User ID:</p>
                      <p>{transaction.userId || "N/A"}</p>
                      <p className="text-gray-500">Tuma Reference:</p>
                      <p>{transaction.transactionKey || "N/A"}</p>
                      <p className="text-gray-500">Trust Payment Reference:</p>
                      <p>{transaction.tpReference || "N/A"}</p>
                      <p className="text-gray-500">Settlement Reference:</p>
                      <p>{transaction.settlementReference || "N/A"}</p>
                      <p className="text-gray-500">MPESA Reference:</p>
                      <p>{transaction.mpesaReference || "N/A"}</p>
                      <p className="text-gray-500">Transaction Reference:</p>
                      <p>{transaction.transactionReference || "N/A"}</p>
                      <p className="text-gray-500">Origin:</p>
                      <p>UK</p>
                      <p className="text-gray-500">Destination:</p>
                      <p>{transaction.receiverAddress}</p>
                      <p className="text-gray-500">Payment Purpose:</p>
                      <p>{transaction.paymentPurpose}</p>
                      <p className="text-gray-500">Source of Funds:</p>
                      <p>{transaction.fundsSource}</p>
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
                      <p>{transaction.receiverPhone || "N/A"}</p>
                      <p className="text-gray-500">Account Number:</p>
                      <p>{transaction.accountNumber || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-3 rounded-lg mt-3">
                    <h3 className="font-semibold text-gray-800 mb-2 flex justify-between items-center">
                      Internal Comments
                      <button
                        onClick={() => setIsAddingComment(true)}
                        className="text-blue-600 text-xs underline cursor-pointer"
                      >
                        Add Comment
                      </button>
                    </h3>

                    {isAddingComment && (
                      <div className="mb-4">
                        <textarea
                          rows={3}
                          placeholder="Type your comment here..."
                          className="w-full border rounded p-2 text-sm"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleAddComment}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
                            disabled={isProcessing}
                          >
                            Add Comment
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingComment(false);
                              setComment("");
                            }}
                            className="border text-sm border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {isLoadingComments ? (
                      <div className="flex justify-center py-4">
                        <div
                          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
                          style={{ borderTopColor: "transparent" }}
                        ></div>
                        <span className="ml-2">Loading comments...</span>
                      </div>
                    ) : comments.length > 0 ? (
                      <div className="space-y-3 text-sm">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-white p-3 rounded-lg border"
                          >
                            <p className="text-xs text-gray-500 font-semibold">
                              {comment.author} •{" "}
                              {new Date(comment.createdAt).toLocaleString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                  timeZone: "GMT",
                                }
                              )}{" "}
                              GMT
                            </p>
                            <p className="mt-1">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No comments yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 left-0 right-0 bg-white p-3 border-t flex justify-between items-center">
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
                  {transaction.status === "PENDING" && (
                    <button
                      onClick={handleRetryPayment}
                      disabled={isRetrying || !transaction.transactionReference}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRetrying ? "Processing..." : "Settle Payment"}
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
                      <p>{formatChannelName(transaction.transactionType)}</p>
                      <p className="text-gray-400">Bank Name:</p>
                      <p>{transaction.bankName || "N/A"}</p>
                      <p className="text-gray-400">Card Type:</p>
                      <p>{transaction.paymentTypeDescription || "N/A"}</p>
                      <p className="text-gray-400">Card Issuer:</p>
                      <p>{transaction.issuer || "N/A"}</p>
                      <p className="text-gray-400">Masked Card:</p>
                      <p>{transaction.maskedPan || "N/A"}</p>
                      <p className="text-gray-400">Transaction ID:</p>
                      <p>{transaction.transactionId}</p>
                      <p className="text-gray-400">User ID:</p>
                      <p>{transaction.userId || "N/A"}</p>
                      <p className="text-gray-400">Tuma Reference:</p>
                      <p>{transaction.transactionKey || "N/A"}</p>
                      <p className="text-gray-400">Trust Payment Reference:</p>
                      <p>{transaction.tpReference || "N/A"}</p>
                      <p className="text-gray-400">Fraud Reference:</p>
                      <p>{transaction.fraudReference || "N/A"}</p>
                      <p className="text-gray-400">Settlement Reference:</p>
                      <p>{transaction.settlementReference || "N/A"}</p>
                      <p className="text-gray-400">MPESA Reference:</p>
                      <p>{transaction.mpesaReference || "N/A"}</p>
                      <p className="text-gray-400">Transaction Reference:</p>
                      <p>{transaction.transactionReference || "N/A"}</p>
                      <p className="text-gray-400">Origin:</p>
                      <p>UK</p>
                      <p className="text-gray-400">Destination:</p>
                      <p>{transaction.receiverAddress}</p>
                      <p className="text-gray-400">Payment Purpose:</p>
                      <p>{transaction.paymentPurpose}</p>
                      <p className="text-gray-400">Source of Funds:</p>
                      <p>{transaction.fundsSource}</p>
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
                      <p>{transaction.receiverPhone || "N/A"}</p>
                      <p className="text-gray-400">Account Number:</p>
                      <p>{transaction.accountNumber || "N/A"}</p>
                    </div>
                  </div>

                  <div className="bg-gray-100 p-4 rounded-lg mt-4">
                    <h3 className="font-semibold text-gray-800 mb-3 flex justify-between items-center">
                      Internal Comments
                      <button
                        onClick={() => setIsAddingComment(true)}
                        className="text-blue-600 text-sm underline cursor-pointer"
                      >
                        Add Comment
                      </button>
                    </h3>

                    {isAddingComment && (
                      <div className="mb-4">
                        <textarea
                          rows={3}
                          placeholder="Type your comment here..."
                          className="w-full border rounded p-2 text-sm"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={handleAddComment}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
                            disabled={isProcessing}
                          >
                            Add Comment
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingComment(false);
                              setComment("");
                            }}
                            className="border text-sm border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {isLoadingComments ? (
                      <div className="flex justify-center py-4">
                        <div
                          className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"
                          style={{ borderTopColor: "transparent" }}
                        ></div>
                        <span className="ml-2">Loading comments...</span>
                      </div>
                    ) : comments.length > 0 ? (
                      <div className="space-y-3 text-sm">
                        {comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-white p-3 rounded-lg border"
                          >
                            <p className="text-xs text-gray-500 font-semibold">
                              {comment.author} •{" "}
                              {new Date(comment.createdAt).toLocaleString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                  timeZone: "GMT",
                                }
                              )}{" "}
                              GMT
                            </p>
                            <p className="mt-1">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No comments yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 sticky bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-between items-center">
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
