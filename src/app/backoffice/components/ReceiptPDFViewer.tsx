import { useState } from "react";
import { generateReceiptPDF } from "./ReceiptGenerator";

const ReceiptPDFViewer = ({
  transaction,
  formatDateEAT,
  formatDateTime,
  formatChannelName,
}: {
  transaction: any;
  formatDateTime: (date: string) => string;
  formatDateEAT: (date: string) => string;
  formatChannelName: (channel: string) => string;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateReceiptPDF(
        transaction,
        formatDateTime,
        formatDateEAT,
        formatChannelName
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt_${transaction.transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="text-blue-600 font-semibold flex items-center gap-2"
    >
      <img
        src="/backoffice/icons/download.svg"
        alt="download icon"
        className="w-4 h-4"
      />
      {isGenerating ? "Generating..." : "Download Receipt"}
    </button>
  );
};

export default ReceiptPDFViewer;
