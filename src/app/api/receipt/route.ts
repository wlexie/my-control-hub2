import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import { join } from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    console.log('📥 Parsing request body...');
    const { transaction, formattedDate, channelName } = await req.json();

    console.log('📄 Resolving template...');
    const templatePath = join(process.cwd(), 'templates', 'receipt-template.html');
    let html = await fs.readFile(templatePath, 'utf8');

    console.log('🔄 Replacing placeholders...');
    const replace = (key: string, value: string) =>
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? 'N/A'));

    Object.entries({
      receiverCurrencyIso3a: transaction.receiverCurrencyIso3a,
      recipientAmount: Number(transaction.recipientAmount).toFixed(0),
      receiverName: transaction.receiverName,
      formattedDate,
      transactionId: transaction.transactionId,
      exchangeRate: transaction.exchangeRate,
      transactionKey: transaction.transactionKey,
      channel: channelName,
      senderName: transaction.senderName,
      senderEmail: transaction.senderEmail,
      senderPhone: transaction.senderPhone,
      receiverPhone: transaction.receiverPhone,
    }).forEach(([k, v]) => replace(k, v));

    console.log('🚀 Launching Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('🖥 Opening new page...');
    const page = await browser.newPage();

    console.log('📃 Setting content...');
    await page.setContent(html, { waitUntil: 'networkidle0' });

    console.log('🧾 Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', bottom: '40px', left: '30px', right: '30px' },
    });

    await browser.close();
    console.log('✅ PDF generated and browser closed.');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt_${transaction.transactionId}.pdf"`,
      },
    });

 } catch (err: unknown) {
  let errorMessage = 'PDF generation failed';

  if (err instanceof Error) {
    errorMessage = err.message;
    console.error('[PDF GENERATION ERROR]', err);
  } else {
    console.error('[PDF GENERATION ERROR]', err);
  }

  return NextResponse.json(
    { error: errorMessage },
    { status: 500 }
  );
}

}
