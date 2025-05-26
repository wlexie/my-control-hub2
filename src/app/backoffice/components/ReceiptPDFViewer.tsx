"use client";

import { useEffect, useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReceiptPDF from "@/app/backoffice/components/ReceiptPDF";
import { Transaction } from "../types/transactions";

interface ReceiptPDFViewerProps {
  transaction: Transaction;
  formatDateTime: (date: string) => string;
  formatDateEAT: (date: string) => string;
  formatChannelName: (channel: string) => string;
}

const ReceiptPDFViewer = ({
  transaction,
  formatDateEAT,
  formatDateTime,
  formatChannelName,
}: ReceiptPDFViewerProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
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
      className="text-blue-600 font-semibold flex items-center gap-2"
    >
      {({ loading }) => (
        <>
          <img
            src="/backoffice/icons/download.svg"
            alt="download icon"
            className="w-4 h-4"
          />
          {loading ? "Generating..." : "Download Receipt"}
        </>
      )}
    </PDFDownloadLink>
  );
};

export default ReceiptPDFViewer;
