// File: /app/api/webhooks/messagebird-status/route.js

import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const payload = await request.json();

    // THIS IS THE MOST IMPORTANT PART. IT WILL PRINT THE REAL STATUS TO YOUR SERVER LOGS.
    console.log("--- ✅ WEBHOOK RECEIVED FROM MESSAGEBIRD ---");
    console.log(JSON.stringify(payload, null, 2));
    // ---

    // The 'payload.message.status' field will be 'failed'.
    // The 'payload.message.errors' object will contain the reason why.

  } catch (error) {
    console.error("Error processing webhook:", error);
  }

  // Always return a 200 OK to MessageBird to acknowledge receipt.
  // If you don't do this, MessageBird will think your webhook is broken and stop sending them.
  return NextResponse.json({ received: true }, { status: 200 });
}