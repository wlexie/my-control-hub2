import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';

export const generateReceiptPDF = async (
  transaction: any,
  formatDateTime: (date: string) => string,
  formatDateEAT: (date: string) => string,
  formatChannelName: (channel: string) => string
) => {
  return new Promise<Blob>((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = doc.pipe(blobStream());

    // Register fonts (you'll need to host these fonts yourself)
    doc.registerFont('InterRegular', '/fonts/Inter-Regular.ttf');
    doc.registerFont('InterBold', '/fonts/Inter-Bold.ttf');

    // Header
    doc.image('/backoffice/tuma-logo.png', 248, 40, { width: 40, height: 40 });
    
    doc.font('InterBold').fontSize(24).text(
      `${transaction.currencyIso3a} ${Number(transaction.senderAmount).toFixed(0)}`,
      { align: 'center' }
    );
    
    doc.moveDown(0.5);
    doc.font('InterRegular').fontSize(12).fillColor('#666').text(
      'Successfully sent to ',
      { align: 'center', continued: true }
    ).fillColor('#000').text(transaction.receiverName, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fillColor('#666').text('on ', { align: 'center', continued: true })
      .fillColor('#000').text(formatDateTime(transaction.date), { align: 'center' });

    // Transaction Summary
    doc.moveDown(2);
    doc.font('InterBold').fontSize(14).fillColor('#000')
      .text('Transaction Summary', { underline: true });
    
    doc.moveDown(0.5);
    drawTwoColumnText(doc, [
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
    ]);

    // Sender Details
    doc.moveDown(1);
    doc.font('InterBold').fontSize(14).text('Sender Details', { underline: true });
    doc.moveDown(0.5);
    drawTwoColumnText(doc, [
      ['Name', transaction.senderName || 'N/A'],
      ['Email', transaction.senderEmail || 'N/A'],
      ['Phone', transaction.senderPhone || 'N/A'],
    ]);

    // Receiver Details
    doc.moveDown(1);
    doc.font('InterBold').fontSize(14).text('Receiver Details', { underline: true });
    doc.moveDown(0.5);
    drawTwoColumnText(doc, [
      ['Name', transaction.receiverName || 'N/A'],
      ['Phone', transaction.receiverPhone || 'N/A'],
      [
        'Amount Received',
        `${transaction.receiverCurrencyIso3a} ${Number(transaction.recipientAmount).toFixed(0)}`,
      ],
      ['Received At', formatDateEAT(transaction.date) || 'N/A'],
      ['Channel', formatChannelName(transaction.transactionType) || 'N/A'],
    ]);

    // Footer
    doc.moveDown(2);
    doc.font('InterRegular').fontSize(10).fillColor('#000')
      .text('Thank you for using Tuma!', { align: 'center' });
    doc.moveDown(0.5);
    doc.text('For help, contact us:', { align: 'center' });
    doc.moveDown(0.5);
    doc.text('support@tuma.com', { align: 'center' });
    doc.moveDown(0.5);
    doc.text('+447-778-024-995', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('blue').text('https://tuma.com', { align: 'center', underline: true });

    doc.end();
    stream.on('finish', () => {
      resolve(stream.toBlob('application/pdf'));
    });
  });
};

const drawTwoColumnText = (doc: PDFKit.PDFDocument, items: [string, string][]) => {
  const leftX = 50;
  const rightX = 250;
  const initialY = doc.y;
  
  items.forEach(([label, value], i) => {
    const y = initialY + (i * 20);
    doc.font('InterRegular').fontSize(12).fillColor('#666').text(label, leftX, y);
    doc.font('InterRegular').fontSize(12).fillColor('#000').text(value, rightX, y);
  });
  
  doc.y = initialY + (items.length * 20);
};