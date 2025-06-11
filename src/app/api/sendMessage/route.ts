// File: app/api/sendMessage/route.ts

import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// --- SECURITY WARNING ---
// It's highly recommended to move these into environment variables (.env.local)
// For example: process.env.MESSAGEBIRD_API_KEY
// But for now, we will keep them here to get it working.
const MESSAGEBIRD_API_KEY = 'jR0kbXM2FxlNHMblz7sV33G6d';
const MESSAGEBIRD_CHANNEL_ID = '7e68f5e4-965d-4bbc-9b37-017de54c0d17';

// This is the new App Router format for a POST request
export async function POST(request: Request) {
  try {
    // 1. Get the body from the incoming request
    const body = await request.json();
    const { recipientPhone, message } = body;

    // 2. Validate the data
    if (!recipientPhone || !message) {
      return NextResponse.json(
        { error: 'Recipient phone number and message are required.' },
        { status: 400 } // 400 Bad Request
      );
    }

    // 3. Your existing logic to call the MessageBird API
    const messageBirdResponse = await axios.post(
      'https://conversations.messagebird.com/v1/send',
      {
        to: recipientPhone,
        from: MESSAGEBIRD_CHANNEL_ID,
        type: 'text',
        content: { text: message },
      },
      {
        headers: {
          Authorization: `AccessKey ${MESSAGEBIRD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 4. Return a successful response
    return NextResponse.json({
      success: true,
      response: messageBirdResponse.data,
    });
    
  } catch (error) {
    const axiosError = error as AxiosError;
    // Log the detailed error on the server for debugging
    console.error('MessageBird API sending error:', axiosError.response?.data || axiosError.message);

    // Return a generic error to the client
    return NextResponse.json(
      { success: false, error: 'Internal Server Error when sending message.' },
      { status: 500 } // 500 Internal Server Error
    );
  }
}