// components/ReceiptPreview.tsx

import React from "react";
import { Transaction } from "../types/transactions";

type Props = {
  transaction: Transaction;
  formatDateTime: (date: string) => string;
  formatDateEAT: (date: string) => string;
  formatChannelName: (channel: string) => string;
};

const LabelRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm mb-1">
    <span className="text-gray-600">{label}</span>
    <span className="text-black font-medium">{value}</span>
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-gray-100 p-4 rounded-md mb-4">
    <h3 className="text-sm font-bold mb-3">{title}</h3>
    {children}
  </div>
);

const ReceiptPreview = ({
  transaction,
  formatDateTime,
  formatDateEAT,
  formatChannelName,
}: Props) => {
  return (
    <div
      id="receipt"
      className="bg-white p-10 rounded-md text-black w-full max-w-[600px] mx-auto"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="text-center mb-4">
        <img
          src="/backoffice/tuma-logo.png"
          alt="Tuma Logo"
          className="mx-auto w-10 h-10 mb-2"
        />
        <p className="text-2xl font-bold">
          {transaction.currencyIso3a}{" "}
          {Number(transaction.senderAmount).toFixed(0)}
        </p>
        <p className="text-sm text-gray-600">
          Successfully sent to{" "}
          <span className="font-semibold text-black">
            {transaction.receiverName}
          </span>
        </p>
        <p className="text-sm text-gray-600">
          on{" "}
          <span className="font-semibold text-black">
            {formatDateTime(transaction.date)}
          </span>
        </p>
      </div>

      <Section title="Transaction Summary">
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
          <LabelRow key={idx} label={String(label)} value={String(value)} />
        ))}
      </Section>

      <Section title="Sender Details">
        {[
          ["Name", transaction.senderName || "N/A"],
          ["Email", transaction.senderEmail || "N/A"],
          ["Phone", transaction.senderPhone || "N/A"],
          ["Channel", formatChannelName(transaction.transactionType || "N/A")],
        ].map(([label, value], idx) => (
          <LabelRow key={idx} label={label} value={value} />
        ))}
      </Section>

      <Section title="Receiver Details">
        {[
          ["Name", transaction.receiverName || "N/A"],
          ["Phone", transaction.receiverPhone || "N/A"],
          [
            "Amount Received",
            `${transaction.receiverCurrencyIso3a} ${Number(
              transaction.recipientAmount
            ).toFixed(0)}`,
          ],
          ["Received At", formatDateEAT(transaction.date)],
        ].map(([label, value], idx) => (
          <LabelRow key={idx} label={label} value={value} />
        ))}
      </Section>

      <div className="text-center text-xs mt-6">
        <p className="mb-1">Thank you for using Tuma!</p>
        <p className="mb-1">For help, contact us:</p>
        <p className="mb-1">support@tuma.com</p>
        <p className="mb-1">+447-778-024-995</p>
        <a
          href="https://tuma.com"
          className="text-blue-600 underline"
          target="_blank"
        >
          https://tuma.com
        </a>
      </div>
    </div>
  );
};

export default ReceiptPreview;
