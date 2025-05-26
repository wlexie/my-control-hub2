import { FC, useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Transaction {
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
  errorMessage: string | null;
  bankName: string | null;
  userId: string | null;
}

const Table: FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTimeEAT = (dateString: string | Date | undefined): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    // Convert to East Africa Time (UTC+3)
    date.setHours(date.getHours() + 3);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDateTimeForTable = (
    dateString: string | Date | undefined
  ): string => {
    if (!dateString) return "N/A";
    return `${formatDate(dateString)} ${formatTimeEAT(dateString)}`;
  };

  const statusOptions = [
    "Success",
    "Pending",
    "Failed",
    "Rejected",
    "Reversed",
    "Refunded",
    "Escalated",
    "Under Review",
  ];

  useEffect(() => {
    setLoading(true);
    fetch(
      "https://api.tuma-app.com/api/transfer/partner-transactions?page=1&size=5"
    )
      .then((response) => response.json())
      .then((data) => {
        const mappedTransactions = data.map((item: any) => ({
          transactionId: item.transactionId,
          transactionKey: item.transactionKey,
          senderName: item.senderName,
          senderEmail: item.senderEmail,
          senderPhone: item.senderPhone,
          receiverName: item.receiverName,
          receiverPhone: item.receiverPhone,
          senderAmount: item.senderAmount,
          recipientAmount: item.recipientAmount,
          exchangeRate: item.exchangeRate,
          date: formatDateTimeForTable(item.date),
          status:
            item.status === "SUCCESS"
              ? "Success"
              : item.status === "PENDING"
              ? "Pending"
              : item.status === "FAILED" || item.status === "ERROR"
              ? "Failed"
              : item.status === "REJECTED"
              ? "Rejected"
              : item.status === "UNDER_REVIEW"
              ? "Under Review"
              : item.status === "REVERSED"
              ? "Reversed"
              : item.status === "REFUNDED"
              ? "Refunded"
              : item.status === "ESCALATED"
              ? "Escalated"
              : "Failed",
          currencyIso3a: item.currencyIso3a,
          receiverCurrencyIso3a: item.receiverCurrencyIso3a,
          transactionType: formatChannelName(item.transactionType),
          accountNumber: item.accountNumber,
          settlementReference: item.settlementReference,
          tpReference: item.tpReference,
          mpesaReference: item.mpesaReference,
          errorMessage: item.errorMessage,
          userID: item.userId,
          bankName: item.bankName,
        }));
        setTransactions(mappedTransactions);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedTransaction) {
      setIsModalVisible(true);
    }
  }, [selectedTransaction]);

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleDownloadReceipt = async () => {
    if (!selectedTransaction || selectedTransaction.status !== "Success") {
      return;
    }

    const receiptElement = document.getElementById("receipt");
    if (!receiptElement) {
      console.error("Receipt element not found in the DOM");
      return;
    }

    try {
      // Clone receipt to avoid UI distortion
      const clonedReceipt = receiptElement.cloneNode(true) as HTMLElement;
      clonedReceipt.style.opacity = "1";
      clonedReceipt.style.position = "static";
      clonedReceipt.style.pointerEvents = "auto";
      clonedReceipt.style.transform = "scale(1)";

      // Style adjustments for proper A4 layout
      clonedReceipt.style.width = "700px"; // Wider layout for better spacing
      clonedReceipt.style.padding = "40px"; // Adds space on the sides
      clonedReceipt.style.margin = "auto"; // Centers content
      clonedReceipt.style.background = "white"; // Ensure background visibility

      // Append cloned receipt to a hidden container
      const hiddenContainer = document.createElement("div");
      hiddenContainer.style.position = "fixed";
      hiddenContainer.style.top = "-9999px"; // Moves it out of view
      hiddenContainer.style.width = "100%";
      hiddenContainer.style.display = "flex";
      hiddenContainer.style.justifyContent = "center"; // Centers horizontally
      hiddenContainer.appendChild(clonedReceipt);
      document.body.appendChild(hiddenContainer);

      // Wait for fonts & images to load
      await document.fonts.ready;

      // Capture the receipt
      const canvas = await html2canvas(clonedReceipt, {
        scale: 2,
        useCORS: true,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm

      // Calculate proper scaling
      const imgWidth = pdfWidth - 40; // Leaving margin on sides
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Centered placement on A4
      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;

      // Add image to PDF
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        xOffset,
        yOffset,
        imgWidth,
        imgHeight
      );
      pdf.save(`Receipt_${selectedTransaction?.transactionId}.pdf`);

      console.log("PDF downloaded successfully");

      // Remove cloned receipt from the DOM
      document.body.removeChild(hiddenContainer);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedTransaction(null);
    }, 420); // Matches the transition duration
  };

  const renderStatusBadge = (status: string) => {
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-lg ${
          status === "Success"
            ? "text-green-700 bg-green-100"
            : status === "Pending"
            ? "text-yellow-700 bg-yellow-100"
            : status === "Failed"
            ? "text-red-700 bg-red-100"
            : status === "Refunded"
            ? "text-purple-700 bg-purple-100"
            : status === "Under Review"
            ? "text-blue-700 bg-blue-100"
            : status === "Rejected"
            ? "text-orange-700 bg-orange-100"
            : status === "Escalated"
            ? "text-amber-700 bg-amber-100"
            : "text-black bg-gray-100"
        }`}
      >
        {status}
      </span>
    );
  };

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
        return (
          <>
            <p className="text-gray-500 mt-1">
              Transaction failed with{" "}
              <span className="text-black font-semibold text-md">
                {selectedTransaction.receiverName}
              </span>
              <p>{selectedTransaction.errorMessage}</p>
            </p>
            {dateDisplay}
          </>
        );
      case "Rejected":
        return (
          <>
            <p className="text-gray-500 mt-1">
              Transaction rejected to{" "}
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
    <div className="bg-gray-100 p-4">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <h2 className="px-6 py-4 font-semibold text-gray-800 border-b">
          Latest Transactions
        </h2>
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Transaction ID</th>
              <th className="px-6 py-3">Sender Amount</th>
              <th className="px-6 py-3">Sender Currency</th>
              <th className="px-6 py-3">Recipient Amount</th>
              <th className="px-6 py-3">Recipient Currency</th>
              <th className="px-6 py-3">Channel</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  Loading transactions...
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr
                  key={transaction.transactionId}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRowClick(transaction)}
                >
                  <td className="px-6 py-4 flex items-center">
                    {transaction.senderName}
                  </td>
                  <td className="px-6 py-4">{transaction.transactionId}</td>
                  <td className="px-6 py-4">
                    {transaction.senderAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">{transaction.currencyIso3a}</td>
                  <td className="px-6 py-4">
                    {transaction.recipientAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    {transaction.receiverCurrencyIso3a}
                  </td>
                  <td className="px-6 py-4">{transaction.transactionType}</td>
                  <td>{renderStatusBadge(transaction.status)}</td>
                  <td className="px-6 py-4">{transaction.date}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-In Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="bg-black/30 backdrop-blur-sm  w-full h-full"
            onClick={closeModal}
          ></div>

          {/* Modal with Slide-in Transition */}
          <div
            className={`bg-white w-[28rem] h-screen shadow-lg p-8 fixed right-0 transform transition-transform duration-300 ${
              isModalVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Close Button */}
            <div className="flex items-center justify-end p-6 border-b sticky top-0 bg-white z-10">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 h-[calc(100vh-80px)]">
              <div className=" space-y-8">
                {/* Confirmation Section */}
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

                {/* Transaction Details */}
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
                    <p>{selectedTransaction.receiverCurrencyIso3a || "N/A"}</p>
                    <p className="text-gray-400">Trust Payments:</p>
                    <p>{selectedTransaction.tpReference || "N/A"}</p>
                    <p className="text-gray-400">Settlement Reference:</p>
                    <p>{selectedTransaction.settlementReference || "N/A"}</p>
                    <p className="text-gray-400">Account Number:</p>
                    <p>{selectedTransaction.accountNumber || "N/A"} </p>
                    <p className="text-gray-400">Error Message:</p>
                    <p>{selectedTransaction.errorMessage || "N/A"} </p>
                  </div>
                </div>

                {/* Exchange Rate */}
                <div>
                  <div className="grid grid-cols-2 gap-y-4 text-gray-700 border border-dotted py-2 px-2 border-gray-300">
                    <p className="text-gray-400">Exchange Rate:</p>
                    <p>
                      {selectedTransaction.exchangeRate.toFixed(2) || "N/A"}
                    </p>
                    <p className="text-gray-400">Transaction Fee:</p>
                    <p>0.00</p>
                    <p className="text-gray-400">Recipient Amount:</p>
                    <p>
                      {selectedTransaction.recipientAmount.toFixed(2)}{" "}
                      {selectedTransaction.receiverCurrencyIso3a}
                    </p>
                  </div>
                </div>

                {/* Sender Section */}
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

                {/* Receiver Section */}
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

                {/* Download Receipt */}
                <div className="mt-2 flex items-center justify-center">
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={selectedTransaction.status !== "Success"}
                    className={`flex items-center gap-2 ${
                      selectedTransaction.status === "Success"
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-gray-400 cursor-not-allowed"
                    } font-semibold`}
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
                    <span>Download Receipt</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden Receipt for PDF Generation */}
            {selectedTransaction?.status === "Success" && (
              <div
                id="receipt"
                style={{
                  opacity: 0,
                  position: "absolute",
                  pointerEvents: "none",
                  width: "700px",
                  padding: "40px",
                  boxSizing: "border-box",
                }}
                className="bg-white mx-auto shadow-lg rounded-lg text-gray-700"
              >
                {/* Header */}
                <div className="text-center mb-1 mt-1">
                  <img
                    src="/logoimage.png"
                    className="w-10 h-10 mx-auto"
                    alt="Company Logo"
                  />
                  <h2 className="text-2xl font-bold text-black mt-3">
                    {selectedTransaction.senderAmount.toFixed(2)}{" "}
                    {selectedTransaction.currencyIso3a}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Successfully sent to{" "}
                    <span className="font-semibold text-black">
                      {selectedTransaction.receiverName}
                    </span>
                  </p>
                  <p className="text-gray-500 mt-0">
                    on{" "}
                    <span className="font-semibold text-black">
                      {selectedTransaction.date}
                    </span>
                  </p>
                </div>

                {/* Transaction Details - 2 Column Layout */}
                <div className="bg-gray-50 p-5 rounded-lg mb-3">
                  <h3 className="font-semibold text-black text-lg mb-3">
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-500 text-sm">Transaction ID</p>
                        <p className="text-black text-sm break-all font-semibold">
                          {selectedTransaction.transactionId}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Channel</p>
                        <p className="text-sm font-semibold">
                          {selectedTransaction.transactionType}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Sender Currency</p>
                        <p className="text-sm font-semibold">
                          {selectedTransaction.currencyIso3a}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">TP Reference</p>
                        <p className="text-sm font-semibold">
                          {selectedTransaction.tpReference}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-gray-500 text-sm">Purpose</p>
                        <p className="text-sm font-semibold">Transfer</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">
                          Recipient Currency
                        </p>
                        <p className="text-sm font-semibold">
                          {selectedTransaction.receiverCurrencyIso3a}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Settlement Ref</p>
                        <p className="text-sm font-semibold">
                          {selectedTransaction.settlementReference || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">MPESA Reference</p>
                        <p className="text-sm font-semibold">
                          {selectedTransaction.mpesaReference || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Key as full-width row */}
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">Transaction Key</p>
                    <p className="text-black font-semibold text-sm break-all p-2 rounded mt-1">
                      {selectedTransaction.transactionKey}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 my-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Transaction Fee</p>
                      <p className="text-sm font-semibold">0.00</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Exchange Rate</p>
                      <p className="text-sm font-semibold">
                        {selectedTransaction.exchangeRate.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-semibold">
                        Recipient Amount
                      </p>
                      <p className="text-sm font-semibold">
                        {selectedTransaction.recipientAmount.toFixed(2)}{" "}
                        {selectedTransaction.receiverCurrencyIso3a}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Bank Name</p>
                      <p className="text-sm font-semibold">
                        {selectedTransaction.bankName || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sender & Receiver - Side by Side */}
                <div className="flex gap-5 mb-5">
                  <div className="bg-gray-50 p-5 rounded-lg flex-1">
                    <h3 className="font-semibold text-black text-lg mb-3">
                      Sender
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-500 text-sm">Name</p>
                        <p className="text-black text-sm font-semibold">
                          {selectedTransaction.senderName}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Phone</p>
                        <p className="text-sm font-semibold">
                          {selectedTransaction.senderPhone}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Email</p>
                        <p className="text-sm font-semibold">
                          {selectedTransaction.senderEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg flex-1">
                    <h3 className="font-semibold text-black text-lg mb-3">
                      Receiver
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-500 text-sm">Name</p>
                        <p className="text-black text-sm font-semibold">
                          {selectedTransaction.receiverName}
                        </p>
                      </div>
                      {selectedTransaction.receiverPhone && (
                        <div>
                          <p className="text-gray-500 text-sm">Phone</p>
                          <p className="text-sm font-semibold">
                            {selectedTransaction.receiverPhone}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500 text-sm">Account Number</p>
                        <p className="text-sm font-semibold">
                          {selectedTransaction.accountNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center text-sm mt-4">
                  <p className="font-semibold">Thank you for using Tuma!</p>
                  <p className="text-gray-500 italic mt-1">
                    For inquiries or assistance, contact us:
                  </p>
                  <p className="text-gray-600 mt-1">support@tuma.com</p>
                  <p className="text-gray-600">+447-778-024-995</p>
                  <a
                    href="https://tuma.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block -mt-1"
                  >
                    <p className="text-blue-500">tuma.com</p>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
