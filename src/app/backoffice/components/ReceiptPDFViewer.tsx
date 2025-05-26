import { useEffect } from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Transaction } from "../types/transactions";

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

const ReceiptPDF = ({
  transaction,
  formatDateEAT,
  formatDateTime,
  formatChannelName,
}: {
  transaction: Transaction;
  formatDateTime: (date: string) => string;
  formatDateEAT: (date: string) => string;
  formatChannelName: (channel: string) => string;
}) => (
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

const ReceiptPDFViewer = ({
  transaction,
  formatDateEAT,
  formatDateTime,
  formatChannelName,
}: {
  transaction: Transaction;
  formatDateTime: (date: string) => string;
  formatDateEAT: (date: string) => string;
  formatChannelName: (channel: string) => string;
}) => {
  useEffect(() => {
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
  }, []);

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
