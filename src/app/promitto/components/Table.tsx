import { FC, useState, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import api from "../../../hooks/useApi";

interface ApiTransaction {
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
  status: string;
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
  const { get } = api();

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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await get<ApiTransaction[]>(
          "/transfer/partner-transactions?page=1&size=5"
        );

        const mappedTransactions = response.map((item) => ({
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
          status: (item.status === "SUCCESS"
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
                          : "Failed") as Transaction["status"],
          currencyIso3a: item.currencyIso3a,
          receiverCurrencyIso3a: item.receiverCurrencyIso3a,
          transactionType: formatChannelName(item.transactionType),
          accountNumber: item.accountNumber,
          settlementReference: item.settlementReference,
          tpReference: item.tpReference,
          mpesaReference: item.mpesaReference,
          errorMessage: item.errorMessage,
          userId: item.userId,
          bankName: item.bankName,
        }));

        setTransactions(mappedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
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

  const closeModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedTransaction(null);
    }, 300);
  };

  const renderStatusBadge = (status: Transaction["status"]) => {
    // Use Transaction['status']
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
            </p>
            {selectedTransaction.errorMessage && (
              <p className="text-red-500 text-sm mt-1">
                {selectedTransaction.errorMessage}
              </p>
            )}
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
    }
  };

  return (
    <div className=" p-4">
      <div className="bg-white rounded-lg overflow-x-auto">
        <h2 className="px-6 py-4 font-semibold text-black border-b">
          Latest Transactions
        </h2>
        <table className="w-full text-sm text-left text-black min-w-[900px]">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 whitespace-nowrap">Customer</th>
              <th className="px-6 py-3 whitespace-nowrap">Transaction ID</th>
              <th className="px-6 py-3 whitespace-nowrap">Sender Amount</th>
              <th className="px-6 py-3 whitespace-nowrap">Sender Currency</th>
              <th className="px-6 py-3 whitespace-nowrap">Recipient Amount</th>
              <th className="px-6 py-3 whitespace-nowrap">
                Recipient Currency
              </th>
              <th className="px-6 py-3 whitespace-nowrap">Channel</th>
              <th className="px-6 py-3 whitespace-nowrap">Status</th>
              <th className="px-6 py-3 whitespace-nowrap">Date & Time</th>
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
                  className="cursor-pointer hover:bg-gray-100 border-b"
                  onClick={() => handleRowClick(transaction)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.senderName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.transactionId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.senderAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.currencyIso3a}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {Math.ceil(transaction.recipientAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.receiverCurrencyIso3a}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.transactionType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transaction.date}
                  </td>
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
            className="bg-black/30 backdrop-blur-sm w-full h-full fixed inset-0"
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
                  <div className="grid grid-cols-2 gap-y-4 text-gray-700 text-sm">
                    <p className="text-gray-400">Transaction ID:</p>
                    <p className="break-all">
                      {selectedTransaction.transactionId}
                    </p>
                    <p className="text-gray-400">User ID:</p>
                    <p className="break-all">
                      {selectedTransaction.userId || "N/A"}
                    </p>
                    <p className="text-gray-400">Transaction Key:</p>
                    <p className="break-all">
                      {selectedTransaction.transactionKey}
                    </p>
                    <p className="text-gray-400">Channel:</p>
                    <p className="break-all">
                      {selectedTransaction.transactionType}
                    </p>
                    <p className="text-gray-400">Bank Name:</p>
                    <p className="break-all">
                      {selectedTransaction.bankName || "N/A"}
                    </p>
                    <p className="text-gray-400">Purpose:</p>
                    <p>Transfer</p>
                    <p className="text-gray-400">Sender Currency:</p>
                    <p>{selectedTransaction.currencyIso3a}</p>
                    <p className="text-gray-400">Recipient Currency:</p>
                    <p>{selectedTransaction.receiverCurrencyIso3a || "N/A"}</p>
                    <p className="text-gray-400">Trust Payments:</p>
                    <p className="break-all">
                      {selectedTransaction.tpReference || "N/A"}
                    </p>
                    <p className="text-gray-400">Settlement Reference:</p>
                    <p className="break-all">
                      {selectedTransaction.settlementReference || "N/A"}
                    </p>
                    <p className="text-gray-400">MPESA Reference:</p>
                    <p className="break-all">
                      {selectedTransaction.mpesaReference || "N/A"}
                    </p>
                    <p className="text-gray-400">Account Number:</p>
                    <p className="break-all">
                      {selectedTransaction.accountNumber || "N/A"}{" "}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-y-4 text-gray-700 text-sm border border-dotted py-2 px-2 border-gray-300 rounded-md">
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

                <div className="mt-8 border-t pt-4 text-center">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    Sender
                  </h4>
                  <div className="flex flex-col items-center space-y-2 text-sm">
                    <div>
                      <p className="text-gray-700 font-semibold break-all">
                        {selectedTransaction.senderName}
                      </p>
                      <p className="text-gray-500 break-all">
                        {selectedTransaction.senderPhone}
                      </p>
                      <p className="text-gray-500 mt-1 break-all">
                        {selectedTransaction.senderEmail}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t pt-4 text-center">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    Receiver
                  </h4>
                  <div className="flex flex-col items-center space-y-2 text-sm">
                    <div>
                      <p className="text-gray-700 font-semibold break-all">
                        {selectedTransaction.receiverName}
                      </p>
                      {selectedTransaction.receiverPhone && (
                        <p className="text-gray-500 break-all">
                          {selectedTransaction.receiverPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-center pb-8">
                  {" "}
                  {/* Added pb-8 for bottom padding */}
                  <button
                    onClick={handleDownloadReceipt}
                    disabled={selectedTransaction.status !== "Success"}
                    className={`flex items-center gap-2 ${
                      selectedTransaction.status === "Success"
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-gray-400 cursor-not-allowed"
                    } font-semibold`}
                  >
                    <svg // Using a download icon
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Download Receipt</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
