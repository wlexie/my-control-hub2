import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Transaction } from "../types/transactions";
import {
  PDFDownloadLink,
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
};

// Register fonts (this should be done once at app startup)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZg.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZg.ttf",
      fontWeight: 700,
    },
  ],
});

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
  },
  section: {
    marginBottom: 20,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 10,
    alignSelf: "center",
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  successText: {
    textAlign: "center",
    color: "#666",
    marginBottom: 5,
  },
  boldText: {
    fontWeight: "bold",
    color: "#000",
  },
  detailSection: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    fontSize: 12,
  },
  label: {
    color: "#666",
  },
  value: {
    color: "#000",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginVertical: 10,
  },
  footer: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 10,
  },
  footerText: {
    marginBottom: 5,
  },
  link: {
    color: "blue",
    textDecoration: "none",
  },
});

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
      icon: "/backoffice/backoffice/icons/reversed.svg",
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

// PDF Document Component
const ReceiptPDF = ({
  transaction,
  formatDateEAT,
  formatDateTime,
}: // formatChannelName,
{
  transaction: Transaction;
  formatDateTime: (date: string) => string;
  formatDateEAT: (date: string) => string;
  formatChannelName: (channel: string) => string;
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src="/backoffice/tuma-logo.png"
            style={styles.logo}
            cache={false}
          />
          <Text style={styles.amount}>
            {transaction.currencyIso3a}{" "}
            {Number(transaction.senderAmount).toFixed(0)}
          </Text>
          <Text style={styles.successText}>
            Successfully sent to{" "}
            <Text style={styles.boldText}>{transaction.receiverName}</Text>
          </Text>
          <Text style={styles.successText}>
            on{" "}
            <Text style={styles.boldText}>
              {formatDateTime(transaction.date)}
            </Text>
          </Text>
        </View>

        {/* Details */}
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Transaction Summary</Text>
          {[
            ["Transaction ID", transaction.transactionId],
            ["User ID", transaction.userId || "N/A"],
            ["Exchange Rate (KES)", transaction.exchangeRate || "N/A"],
            ["Tuma Reference", transaction.transactionKey || "N/A"],
            ["Trust Payment", transaction.tpReference || "N/A"],
            ["Settlement Reference", transaction.settlementReference || "N/A"],
            ["MPESA Reference", transaction.mpesaReference || "N/A"],
            ["Bank Name", transaction.bankName || "N/A"],
            ["Origin", "UK"],
            ["Destination", "Kenya"],
            ["Transfer Fee", "0.00"],
          ].map(([label, value], idx) => (
            <View style={styles.detailRow} key={idx}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Sender Details</Text>
          {[
            ["Name", transaction.senderName || "N/A"],
            ["Email", transaction.senderEmail || "N/A"],
            ["Phone", transaction.senderPhone || "N/A"],
          ].map(([label, value], idx) => (
            <View style={styles.detailRow} key={idx}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Receiver Details</Text>
          {[
            ["Name", transaction.receiverName || "N/A"],
            ["Phone", transaction.receiverPhone || "N/A"],
            [
              "Amount Received",
              `${transaction.receiverCurrencyIso3a} ${Number(
                transaction.recipientAmount
              ).toFixed(0)}`,
            ],
            ["Received At", formatDateEAT(transaction.date) || "N/A"],
          ].map(([label, value], idx) => (
            <View style={styles.detailRow} key={idx}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for using Tuma!</Text>
          <Text style={styles.footerText}>For help, contact us:</Text>
          <Text style={styles.footerText}>support@tuma.com</Text>
          <Text style={styles.footerText}>+447-778-024-995</Text>
          <Text style={[styles.footerText, styles.link]}>https://tuma.com</Text>
        </View>
      </Page>
    </Document>
  );
};

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  // Add loading overlay when generating PDF
  if (isGeneratingPdf) {
    return <div className=""></div>;
  }

  if (!isOpen || !transaction) return null;

  const statusDetails = getStatusDetails(
    transaction.status,
    transaction.errorMessage
  );
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatDateEAT = (dateString: string): string => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 3); // Add 3 hours for EAT

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
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

  return (
    <div
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: isOpen ? "0%" : "100%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute right-0 top-0 h-full w-[460px] bg-white shadow-lg flex flex-col"
          >
            {/* Header */}
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-scroll p-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src={statusDetails?.icon}
                  alt="status icon"
                  className="w-20 h-20"
                />
                <h3 className="text-xl font-bold mt-2">
                  {statusDetails?.title}
                </h3>
                <p className="text-gray-400 mt-2 max-w-xs">
                  {statusDetails?.reason}
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
                    <p className="text-gray-400">Time Sent:</p>
                    <p>{formatDateTime(transaction.date)}</p>
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
                    <p className="text-gray-400">Time Received:</p>
                    <p>{formatDateEAT(transaction.date)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Buttons */}
            <div className="sticky bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-between items-center">
              {transaction.status === "Success" && (
                <div className="text-blue-600 font-semibold flex items-center gap-2">
                  <PDFDownloadLink
                    document={
                      <ReceiptPDF
                        transaction={transaction}
                        formatDateTime={formatDateTime}
                        formatDateEAT={formatDateEAT}
                        formatChannelName={formatChannelName}
                      />
                    }
                    fileName={`Receipt_${transaction.transactionId}.pdf`}
                    className="flex items-center gap-2"
                    onClick={() => setIsGeneratingPdf(true)}
                  >
                    {({ loading }) => (
                      <>
                        <img
                          src="/backoffice/icons/download.svg"
                          alt="a-download-icon"
                          className="w-4 h-4"
                        />
                        {loading ? "Generating..." : "Download Receipt"}
                      </>
                    )}
                  </PDFDownloadLink>
                </div>
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
