import { PDFDocument, rgb } from 'pdf-lib';
import { Transaction } from '../types/transactions';
import fontkit from '@pdf-lib/fontkit';


export const generateReceiptPDF = async (
  transaction: Transaction,
  formatDateTime: (date: string) => string,
  formatDateEAT: (date: string) => string,
  formatChannelName: (channel: string) => string
): Promise<Blob> => {
  try {
    

    const pdfDoc = await PDFDocument.create();
pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage([420, 594]);

const fontBytes = await fetch('/fonts/fonts/Outfit/static/Outfit-Regular.ttf').then(res => res.arrayBuffer());
const boldFontBytes = await fetch('/fonts/fonts/Outfit/static/Outfit-Bold.ttf').then(res => res.arrayBuffer());

const font = await pdfDoc.embedFont(fontBytes);
const boldFont = await pdfDoc.embedFont(boldFontBytes);


    // Embed logo
    const logoBytes = await fetch('/backoffice/tuma-logo.png').then(res => res.arrayBuffer());
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
      const str = text?.toString?.() ?? '';
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
    const amountText = `${transaction.receiverCurrencyIso3a ?? ''} ${Number(transaction.recipientAmount ?? 0).toLocaleString()}`;
    drawText(amountText, { font: boldFont, size: 20, x: centerX(amountText, 20, boldFont), y });

    // "Successfully sent to..." bolded
    drawText(`Successfully sent to ${transaction.receiverName}`, {
      size: 10,
      font: boldFont,
      color: [0.4, 0.4, 0.4],
      x: centerX(`Successfully sent to ${transaction.receiverName}`, 10, boldFont),
    });

    // Time bolded
    drawText(`on ${formatDateTime(transaction.date)}`, {
      size: 10,
      font: boldFont,
      color: [0.4, 0.4, 0.4],
      x: centerX(`on ${formatDateTime(transaction.date)}`, 10, boldFont),
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
        drawText(value ?? '', {
          size: 9,
          font: boldFont,
          x: boxLeft + 180,
          y: textY,
          adjustY: false,
        });
      });

      y = boxTop - boxHeight - 16;
    };

    drawBox('Receiver', [
      ['Transaction ID', transaction.transactionId],
      ['Channel', formatChannelName(transaction.transactionType)],
      ['Purpose of payment', 'Deposit'],
      ['Origin', 'UK – KE'],
      ['Transaction fee', '0.00'],
      [
        'Exchange Rate',
        `1 GBP = ${Number(transaction.exchangeRate ?? 0).toFixed(0)} ${transaction.receiverCurrencyIso3a ?? ''}`,
      ],
    ]);

    drawBox('Sender', [
      ['Sender Name', transaction.senderName || 'N/A'],
      ['Phone Number', transaction.senderPhone || 'N/A'],
    ]);

    // Footer (tight spacing)
    const footerLines = [
      'Thank you for using Tuma!',
      'For inquiries or assistance, contact us:',
      'support@tuma.com | +447-778-024-995',
      'tuma.com',
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
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('[generateReceiptPDF ERROR]', error);
    throw error;
  }
};
