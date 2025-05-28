"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getInitials, getPastelColor, statusStyles } from "./constants";
import Link from "next/link";
import type { User } from "../types";
import toast from "react-hot-toast";

interface Props {
  userId: number;
  onClose: () => void;
  open: boolean;
  onUserUpdated: (userId: number, updates: Partial<User>) => void;
}

export default function UserDetailsModal({
  userId,
  onClose,
  open: isOpen,
  onUserUpdated,
}: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
          setUser(data);
        } catch (error) {
          console.error("Error fetching user details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserDetails();
    }
  }, [isOpen, userId]);

  if (!user) return null;

  const fullName = `${user.firstName.trim()} ${user.lastName.trim()}`.trim();
  const document = user.documents?.[0];
  const totalTransactions = user.transaction?.totalTransactions
    ? user.transaction.totalTransactions.successfulTransactions +
      user.transaction.totalTransactions.failedTransactions
    : 0;

  // const getCountryDisplay = (code: string | null) => {
  //   if (code === "Kenya") {
  //     return (
  //       <>
  //         <img
  //           src="/backoffice/kenya-flag.png"
  //           alt="Kenya"
  //           className="w-5 h-5 rounded"
  //         />{" "}
  //         Kenya
  //       </>
  //     );
  //   } else if (code === "United Kingdom" || code === "GBR") {
  //     return (
  //       <>
  //         <img
  //           src="/backoffice/uk-flag.png"
  //           alt="UK"
  //           className="w-5 h-5 rounded"
  //         />{" "}
  //         United Kingdom
  //       </>
  //     );
  //   } else {
  //     return <span className="text-gray-400">N/A</span>;
  //   }
  // };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 w-full sm:w-[400px] md:w-[460px] h-full bg-white z-50 shadow-lg"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-6 h-full overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  User Details
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="text-gray-500 hover:text-gray-800 w-5 h-5" />
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Loading user details...</p>
                </div>
              ) : (
                <>
                  {/* User Info */}
                  <div className="flex flex-col items-center bg-gray-50 rounded-xl p-4 mb-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg text-gray-800 ${getPastelColor(
                        fullName
                      )}`}
                    >
                      {getInitials(fullName)}
                    </div>
                    <p className="font-semibold text-lg mt-3">{fullName}</p>
                    <p className="text-sm text-gray-600">{user.phone}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>

                  {/* Status */}
                  {/* Status and Manual Approval Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* KYC status */}
                    <div className="bg-white border px-4 py-2 rounded-xl">
                      <p className="text-sm font-semibold">KYC status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            statusStyles[user.step]?.dot || "bg-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            statusStyles[user.step]?.text || "text-gray-600"
                          }`}
                        >
                          {user.step}
                        </span>
                      </div>
                    </div>

                    {/* Account status */}
                    <div className="bg-white border px-4 py-2 rounded-xl">
                      <p className="text-sm font-semibold">Account status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            statusStyles[user.accountStatus]?.dot ||
                            "bg-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            statusStyles[user.accountStatus]?.text ||
                            "text-gray-600"
                          }`}
                        >
                          {user.accountStatus}
                        </span>
                      </div>
                    </div>

                    {/* Notification Section with Manual Approve Button */}
                    {user.step === "KYC_IN_PROGRESS" && (
                      <div className="col-span-2 bg-white border px-4 py-2 rounded-xl">
                        <p className="text-sm font-semibold mb-2">
                          Notification
                        </p>
                        <button
                          disabled={String(user.step) === "KYC_COMPLETED"}
                          onClick={async () => {
                            if (!user.onfidoApplicantId) {
                              toast.error("No applicant ID found.");
                              return;
                            }

                            try {
                              toast.loading("Sending approval request...");
                              const response = await fetch(
                                `https://api.tuma-app.com/api/account/document-recheck?applicantId=${user.onfidoApplicantId}`,
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
                                toast.success(
                                  result.status || "Document recheck completed"
                                );

                                // ✅ Update local user state in modal
                                setUser((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        step: "KYC_COMPLETED",
                                        accountStatus: "Basic",
                                      }
                                    : prev
                                );

                                // ✅ Update parent list (table)
                                onUserUpdated(user.userId ?? userId, {
                                  accountStatus: "Basic",
                                });
                              } else {
                                toast.error(
                                  result.message || "Approval failed."
                                );
                              }
                            } catch (error) {
                              toast.dismiss();
                              toast.error(
                                "An error occurred. Please try again."
                              );
                              console.error(error);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="bg-gray-50 p-4 rounded-xl mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        Verification Status
                      </span>
                      <span className="font-semibold">
                        {user.kycStatus || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gender</span>
                      <span className="font-medium">
                        {document?.gender || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date of Birth</span>
                      <span className="font-medium">
                        {document?.dateOfBirth
                          ? new Date(document.dateOfBirth).toLocaleDateString(
                              "en-GB"
                            )
                          : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nationality</span>

                      <span className="font-medium">
                        {document?.nationality || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ID Document Type</span>
                      <span className="font-medium">
                        {document?.type
                          ? document.type.replace(/_/g, " ")
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="text-gray-600">Issuing Country</span>
                      <span className="flex items-center gap-1 font-medium">
                        {document?.issuingCountry}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ID Document Number</span>
                      <span className="font-medium">
                        {document?.documentNumber || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Transactions */}
                  <div className="bg-gray-50 p-4 rounded-xl mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Last transaction Date
                      </span>
                      <span className="font-medium">
                        {user.transaction?.lastTransactionDate
                          ? new Date(
                              user.transaction.lastTransactionDate
                            ).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total transactions</span>
                      <span className="font-medium">
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
                      <span className="text-gray-600">
                        Successful transactions
                      </span>
                      <span className="font-medium">
                        {user.transaction?.totalTransactions
                          ?.successfulTransactions || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Failed transactions</span>
                      <span className="font-medium">
                        {user.transaction?.totalTransactions
                          ?.failedTransactions || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Total value of transactions
                      </span>
                      <span className="font-medium">
                        {user.transaction?.totalTransactionsValue
                          ? ` KES ${user.transaction.totalTransactionsValue.toFixed(
                              2
                            )}`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Other Info */}
                  <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User ID</span>
                      <span className="font-medium">{userId}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Key</span>
                      <span className="font-medium">{user.accountKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Onfido Applicant ID</span>
                      <span className="font-medium">
                        {user.onfidoApplicantId || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Date of registration
                      </span>
                      <span className="font-medium">
                        {new Date(user.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
