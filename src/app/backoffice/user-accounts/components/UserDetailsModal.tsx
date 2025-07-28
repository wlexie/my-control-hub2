// components/UserDetailsModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getInitials,
  getPastelColor,
  riskScoreStyles,
  statusStyles,
} from "./constants";
import type { CardDetails, User } from "@/app/backoffice/user-accounts/types";
import Link from "next/link";
import toast from "react-hot-toast";

interface Props {
  userId: number;
  onClose: () => void;
  open: boolean;
  onUserUpdated: (userId: number, updates: Partial<User>) => void;
}

interface Comment {
  id: string;
  author: string;
  date: string;
  content: string;
}
const tabs = [
  { key: "overview", label: "Overview" },
  { key: "kyc", label: "KYC & Verification" },
  { key: "transactions", label: "Transactions" },
  { key: "notes", label: "Notes" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function UserDetailsModal({
  userId,
  onClose,
  open: isOpen,
  onUserUpdated,
}: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [comment, setComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const sectionRefs = {
    overview: React.useRef<HTMLDivElement>(null),
    transactions: React.useRef<HTMLDivElement>(null),
    kyc: React.useRef<HTMLDivElement>(null),
    notes: React.useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (section: keyof typeof sectionRefs) => {
    sectionRefs[section]?.current?.scrollIntoView({ behavior: "smooth" });
    setActiveTab(section);
  };

  useEffect(() => {
    const handleScroll = () => {
      const thresholds = Object.entries(sectionRefs).map(([key, ref]) => ({
        key,
        offset: ref.current?.getBoundingClientRect().top || Infinity,
      }));

      const closest = thresholds.reduce((prev, curr) => {
        return Math.abs(curr.offset) < Math.abs(prev.offset) ? curr : prev;
      });

      if (closest.key !== activeTab)
        setActiveTab(closest.key as keyof typeof sectionRefs);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen && userId) {
      const fetchUserDetails = async () => {
        try {
          setLoading(true);
          const res = await fetch(
            `https://api.tuma-app.com/api/account/client-profile?userId=${userId}`
          );
          if (!res.ok) throw new Error("Failed to fetch user details");
          const data = await res.json();

          // Parse card data with first 6 digits and last four digits
          const parsedCards =
            data.cards?.map((cardString: string) => {
              const [issuerAndType, numberPart] = cardString.split(" - ");
              const [issuer, ...typeParts] = issuerAndType.split(", ");
              const type = typeParts.join(", ");

              // Extract first 6 and last 4 digits
              const bin = numberPart?.substring(0, 6) || "";
              const lastFour = numberPart?.slice(-4) || "";

              return {
                issuer: issuer.trim(),
                type: type.trim(),
                bin,
                lastFour,
                fullMaskedNumber: numberPart, // Store the original masked format
              };
            }) || [];

          setUser({
            ...data,
            cards: parsedCards,
          });
        } catch (error) {
          console.error("Error fetching user details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const handleApproveUser = async () => {
    if (!user?.onfidoApplicantId) {
      toast.error("No applicant ID found.");
      return;
    }

    try {
      toast.loading("Sending approval request...");
      const response = await fetch(
        `https://api.tuma-app.com/api/account/document-recheck?applicantId=${user.userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(result.status || "Document recheck completed");
        setUser((prev) =>
          prev
            ? {
                ...prev,
                step: "KYC_COMPLETED",
                accountStatus: "Basic",
              }
            : prev
        );
        onUserUpdated(user.userId ?? userId, {
          accountStatus: "Basic",
        });
      } else {
        toast.error(result.message || "Approval failed.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred. Please try again.");
      console.error(error);
    }
  };

  const handleReinstateUser = async () => {
    try {
      setIsProcessing(true);
      toast.loading("Reinstating user...");
      const response = await fetch(
        `https://api.tuma-app.com/api/account/reinstate-user?userId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(result.message || "User successfully reinstated");
        setUser((prev) => (prev ? { ...prev, accountStatus: "Basic" } : prev));
        onUserUpdated(userId, {
          accountStatus: "Basic",
        });

        // Add system comment about reinstatement
        const newComment = {
          id: Date.now().toString(),
          author: "System",
          date: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          content: "User account reinstated to Basic status",
        };
        setComments((prev) => [newComment, ...prev]);
      } else {
        toast.error(result.message || "Reinstatement failed");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineUser = async () => {
    if (!user?.userId) {
      toast.error("No user ID found.");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter a reason for declining");
      return;
    }

    try {
      setIsProcessing(true);
      toast.loading("Declining user...");
      const response = await fetch(
        `https://api.tuma-app.com/api/account/manual-account-decline?applicantId=${user.userId}&comment=${encodeURIComponent(comment)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(result.message || "User successfully declined");
        setUser((prev) =>
          prev ? { ...prev, accountStatus: "Declined" } : prev
        );
        onUserUpdated(userId, {
          accountStatus: "Declined",
        });

        // Add the decline comment
        const newComment = {
          id: Date.now().toString(),
          author: "Admin",
          date: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          content: `Account declined: ${comment}`,
        };
        setComments((prev) => [newComment, ...prev]);
        setComment("");
        setIsAddingComment(false);
      } else {
        toast.error(result.message || "Decline failed");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspendUser = async () => {
    try {
      setIsProcessing(true);
      toast.loading("Suspending user...");
      const response = await fetch(
        `https://api.tuma-app.com/api/account/suspend-account?userId=${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      toast.dismiss();

      if (response.ok) {
        toast.success(result.message || "User successfully suspended");
        setUser((prev) =>
          prev ? { ...prev, accountStatus: "Temporary Blocked" } : prev
        );
        onUserUpdated(userId, {
          accountStatus: "Temporary Blocked",
        });

        // Add system comment about suspension
        const newComment = {
          id: Date.now().toString(),
          author: "System",
          date: new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          content: "User account suspended",
        };
        setComments((prev) => [newComment, ...prev]);
      } else {
        toast.error(result.message || "Suspension failed");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      setIsProcessing(true);

      const newComment = {
        id: Date.now().toString(),
        author: "Admin",
        date: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        content: comment,
      };

      // Update state AND localStorage together
      setComments((prev) => {
        const updatedComments = [newComment, ...prev];
        localStorage.setItem(
          `user_comments_${userId}`,
          JSON.stringify(updatedComments)
        );
        return updatedComments;
      });

      setComment("");
      setIsAddingComment(false);
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;
  const document = user.documents?.[0];
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const totalTransactions = user.transaction?.totalTransactions
    ? user.transaction.totalTransactions.successfulTransactions +
      user.transaction.totalTransactions.failedTransactions
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-full sm:w-[460px] bg-white z-50 shadow-xl overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-5 space-y-4">
              {/* Header Actions */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">User Details</h2>
                <button
                  onClick={onClose}
                  className="hover:bg-gray-100 p-1 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex gap-2">
                {/* Only show buttons if user is not Declined */}
                {user.accountStatus !== "Declined" && (
                  <>
                    {user.step === "KYC_IN_PROGRESS" && (
                      <button
                        onClick={handleApproveUser}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Approve User
                      </button>
                    )}

                    {(user.accountStatus === "Temporary Blocked" ||
                      user.accountStatus === "Temporary_Blocked") && (
                      <button
                        onClick={handleReinstateUser}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Reinstate User
                      </button>
                    )}

                    {user.accountStatus === "Basic Pending" && (
                      <button
                        onClick={() => {
                          setActiveTab("notes");
                          setIsAddingComment(true);
                          scrollToSection("notes");
                        }}
                        className="border text-sm border-gray-300 text-white bg-red-600 px-4 py-2 rounded-md hover:bg-red-700"
                        disabled={isProcessing}
                      >
                        Decline
                      </button>
                    )}

                    {(user.accountStatus === "Basic" ||
                      user.accountStatus === "Active") && (
                      <button
                        onClick={handleSuspendUser}
                        className="border text-sm border-gray-300 text-white bg-amber-500 px-4 py-2 rounded-md hover:bg-amber-600"
                        disabled={isProcessing}
                      >
                        Suspend
                      </button>
                    )}
                  </>
                )}

                {/* Show a status message if user is Declined */}
                {user.accountStatus === "Declined" && (
                  <div className="text-sm text-gray-600 italic">
                    This account has been declined
                  </div>
                )}
              </div>

              {/* Avatar & Info */}
              <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg text-white ${getPastelColor(fullName)}`}
                >
                  {getInitials(fullName)}
                </div>
                <p className="mt-3 font-semibold">{fullName}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">{user.phone}</p>

                {/* Status Tags */}
                <div className="mt-2 flex gap-2 flex-wrap justify-center">
                  {/* KYC Status */}
                  <div
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                      statusStyles[user.kycStatus]?.bg || "bg-gray-200"
                    } ${statusStyles[user.kycStatus]?.text || "text-gray-700"}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        statusStyles[user.kycStatus]?.dot || "bg-gray-300"
                      }`}
                    />
                    KYC: {user.kycStatus}
                  </div>

                  {/* Account Status */}
                  <div
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                      statusStyles[user.accountStatus]?.bg || "bg-gray-100"
                    } ${statusStyles[user.accountStatus]?.text || "text-gray-700"}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        statusStyles[user.accountStatus]?.dot || "bg-gray-300"
                      }`}
                    />
                    Account: {user.accountStatus}
                  </div>

                  {/* Risk Score */}
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      riskScoreStyles[user.riskScore?.riskLevel || ""] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Risk Score: {user.riskScore?.riskLevel ?? "N/A"}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b flex space-x-6 text-sm font-medium text-gray-600">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-2 ${
                      activeTab === tab.key
                        ? "border-b-2 border-blue-600 text-blue-600"
                        : "hover:text-black"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Basic Info */}
              {activeTab === "overview" && (
                <div className="pt-5">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-6 text-sm text-gray-700">
                    <div>
                      <p className="text-gray-500">User ID</p>
                      <p className="font-semibold">TUMA{user.userId || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gender</p>
                      <p className="font-semibold">{document?.gender || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Registration Date</p>
                      <p className="font-semibold">
                        {new Date(user.createdAt).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date of Birth</p>
                      <p className="font-semibold">
                        {document?.dateOfBirth || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Issuing Country</p>
                      <p className="font-semibold">
                        {document?.issuingCountry || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">ID Document number</p>
                      <p className="font-semibold">
                        {document?.documentNumber || "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 mt-6">Onfido ID</p>
                    <p className="font-semibold">
                      {user.onfidoApplicantId || "—"}
                    </p>
                  </div>
                </div>
              )}
              {/* KYC Verification */}
              {activeTab === "kyc" && (
                <div className="pt-5">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Onfido Verification
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="bg-gray-50 p-3 rounded-xl border">
                      <div className="flex justify-between items-center">
                        <span>ID Verification</span>
                        <span
                          className={`${statusStyles[user.kycStatus]?.text || "text-gray-600"} text-xs px-2 py-0.5 rounded ${statusStyles[user.kycStatus]?.dot ? statusStyles[user.kycStatus].dot.replace("w-2 h-2", "bg-opacity-20") : "bg-gray-100"}`}
                        >
                          {user.kycStatus}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 underline mt-1 space-x-4">
                        <button>View Document</button>
                        <button>View Onfido Report</button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border">
                      <div className="flex justify-between items-center">
                        <span>Selfie Verification</span>
                        <span
                          className={`${statusStyles[user.kycStatus]?.text || "text-gray-600"} text-xs px-2 py-0.5 rounded ${statusStyles[user.kycStatus]?.dot ? statusStyles[user.kycStatus].dot.replace("w-2 h-2", "bg-opacity-20") : "bg-gray-100"}`}
                        >
                          {user.kycStatus}
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 underline mt-1">
                        <button>View Photo</button>
                      </div>
                    </div>
                  </div>
                  {/* SEON Risk Analysis */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 mt-4">
                      SEON Risk Analysis
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-xl border text-sm text-gray-700 space-y-2">
                      <div className="flex justify-between">
                        <span>Fraud Score</span>
                        <span className="text-yellow-600 text-xs bg-yellow-100 px-2 py-0.5 rounded">
                          (65)
                        </span>
                      </div>
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                        <li>Email domain registered less than 3 months ago</li>
                        <li>IP address associated with VPN usage</li>
                        <li>Phone number registered to multiple accounts</li>
                      </ul>
                      <div className="text-xs text-blue-600 underline">
                        <button>View Full SEON Report</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Summary */}
              {activeTab === "transactions" && (
                <div className="pt-5">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Transaction Summary
                  </h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex justify-between">
                      <span>Total Transactions</span>
                      <span>
                        {totalTransactions ? (
                          <Link
                            href={`/backoffice/transactions?userId=${userId}`}
                            className="text-blue-600 underline"
                          >
                            {totalTransactions}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Successful Transactions</span>
                      <span>
                        {user.transaction?.totalTransactions
                          ?.successfulTransactions || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed Transactions</span>
                      <span>
                        {user.transaction?.totalTransactions
                          ?.failedTransactions || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Volume</span>
                      <span>
                        {user.transaction?.totalTransactionsValue
                          ? `KES ${user.transaction.totalTransactionsValue.toFixed(2)}`
                          : "—"}
                      </span>
                    </div>

                    <div className="space-y-2 mt-2">
                      {user.transaction?.lastTransactionDate && (
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl">
                          <div>
                            <p className="font-medium">Last Transaction</p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                user.transaction.lastTransactionDate
                              ).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })}
                            </p>
                          </div>
                          <span className="text-green-700 text-xs bg-green-100 px-2 py-0.5 rounded">
                            Completed
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-blue-600 underline text-right">
                      <Link href={`/backoffice/transactions?userId=${userId}`}>
                        View All Transactions
                      </Link>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2 mt-6">
                    Card Details
                  </h3>
                  <div className="space-y-3">
                    {user.cards && user.cards.length > 0 ? (
                      user.cards.map((card: CardDetails, index: number) => (
                        <div
                          key={index}
                          className="bg-gray-50 p-3 rounded-xl border"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{card.issuer}</p>
                              <p className="text-sm text-gray-600">
                                {card.type}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-md ">
                                {card.bin}&nbsp;••••••&nbsp;{card.lastFour}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No card information available
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* Internal Comments */}
              {activeTab === "notes" && (
                <div className="pt-5">
                  <h3 className="font-semibold text-gray-800 mb-2 flex justify-between items-center">
                    Internal Comments
                    <button
                      onClick={() => {
                        setIsAddingComment(true);
                        scrollToSection("notes");
                      }}
                      className="text-blue-600 text-xs underline cursor-pointer"
                    >
                      Add Comment
                    </button>
                  </h3>

                  {isAddingComment && (
                    <div className="mb-4">
                      <textarea
                        rows={3}
                        placeholder={
                          user.accountStatus === "Basic Pending"
                            ? "Enter reason for declining..."
                            : "Type your comment here..."
                        }
                        className="w-full border rounded p-2 text-sm"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={
                            user.accountStatus === "Basic Pending"
                              ? handleDeclineUser
                              : handleAddComment
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
                          disabled={isProcessing}
                        >
                          {user.accountStatus === "Basic Pending"
                            ? "Submit Decline"
                            : "Add Comment"}
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

                  {comments.length > 0 ? (
                    <div className="space-y-3 text-sm">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-50 p-3 rounded-xl"
                        >
                          <p className="text-xs text-gray-500 font-semibold">
                            {comment.author} · {comment.date}
                          </p>
                          <p className="mt-1">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      No comments yet
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
