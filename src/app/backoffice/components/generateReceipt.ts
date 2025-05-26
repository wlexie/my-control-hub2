import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Transaction } from '../types/transactions';

export const generateReceiptPDF = async (
  transaction: Transaction,
  formatDateTime: (date: string) => string,
  formatDateEAT: (date: string) => string,
  formatChannelName: (channel: string) => string
): Promise<Blob> => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const  height  = page.getSize().height;

  let y = height - 40;
  const lineHeight = 18;
  const sectionGap = 30;
  const leftX = 50;

  const drawText = (
    text: string,
    opts: {
      x?: number;
      y?: number;
      size?: number;
      font?: typeof font;
      color?: [number, number, number];
    } = {}
  ) => {
    page.drawText(text, {
      x: opts.x ?? leftX,
      y: opts.y ?? y,
      size: opts.size ?? 12,
      font: opts.font ?? font,
      color: rgb(...(opts.color ?? [0, 0, 0])),
    });
    y -= lineHeight;
  };

  // Header
  drawText('Tuma', { size: 20, font: boldFont, x: leftX });
  y -= 10;

  drawText(
    `${transaction.currencyIso3a} ${Number(transaction.senderAmount).toFixed(0)}`,
    { font: boldFont, size: 24 }
  );

  drawText(
    `Successfully sent to ${transaction.receiverName}`,
    { color: [0.4, 0.4, 0.4], size: 12 }
  );

  drawText(`on ${formatDateTime(transaction.date)}`, {
    color: [0.4, 0.4, 0.4],
    size: 12,
  });

  y -= sectionGap;

  // Transaction Summary
  drawText('Transaction Summary', { font: boldFont, size: 14 });
  const summary = [
    ['Transaction ID', transaction.transactionId],
    ['User ID', transaction.userId || 'N/A'],
    ['Exchange Rate (KES)', transaction.exchangeRate || 'N/A'],
    ['Tuma Reference', transaction.transactionKey || 'N/A'],
    ['Trust Payment', transaction.tpReference || 'N/A'],
    ['Settlement Reference', transaction.settlementReference || 'N/A'],
    ['MPESA Reference', transaction.mpesaReference || 'N/A'],
    ['Bank Name', transaction.bankName || 'N/A'],
    ['Origin', 'UK'],
    ['Destination', 'Kenya'],
    ['Transfer Fee', '0.00'],
  ];
  for (const [label, value] of summary) {
    drawText(`${label}: ${value}`, { size: 11 });
  }

  y -= sectionGap;

  // Sender Details
  drawText('Sender Details', { font: boldFont, size: 14 });
  const sender = [
    ['Name', transaction.senderName || 'N/A'],
    ['Email', transaction.senderEmail || 'N/A'],
    ['Phone', transaction.senderPhone || 'N/A'],
  ];
  for (const [label, value] of sender) {
    drawText(`${label}: ${value}`, { size: 11 });
  }

  y -= sectionGap;

  // Receiver Details
  drawText('Receiver Details', { font: boldFont, size: 14 });
  const receiver = [
    ['Name', transaction.receiverName || 'N/A'],
    ['Phone', transaction.receiverPhone || 'N/A'],
    [
      'Amount Received',
      `${transaction.receiverCurrencyIso3a} ${Number(transaction.recipientAmount).toFixed(0)}`,
    ],
    ['Received At', formatDateEAT(transaction.date)],
    ['Channel', formatChannelName(transaction.transactionType)],
  ];
  for (const [label, value] of receiver) {
    drawText(`${label}: ${value}`, { size: 11 });
  }

  y -= sectionGap;

  // Footer
  drawText('Thank you for using Tuma!', { size: 10 });
  drawText('For help, contact us:', { size: 10 });
  drawText('support@tuma.com', { size: 10 });
  drawText('+447-778-024-995', { size: 10 });
  drawText('https://tuma.com', { size: 10, color: [0, 0, 1] });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
};
