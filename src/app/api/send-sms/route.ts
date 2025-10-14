import { NextResponse } from 'next/server';
import { Twilio } from 'twilio'; // ✅ Only import Twilio here

// Define an interface that represents the structure of a Twilio API error.
// These are common properties you might find on errors thrown by the Twilio SDK.
interface TwilioApiError extends Error {
  status?: number;     // HTTP status code associated with the error (e.g., 400, 401)
  code?: number;       // Twilio-specific error code (e.g., 21211 for "Invalid phone number")
  moreInfo?: string;   // URL to Twilio documentation about the error
  details?: unknown;       
}

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;

// Basic validation for environment variables
if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Twilio environment variables are not properly set.');
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      'Please ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are defined in your .env.local file.'
    );
  }
  // It's crucial to exit or throw an error if essential variables are missing
  // especially in a serverless function that might not have a long-running process to check.
  // For this example, we'll proceed but be aware of this.
}

const client = new Twilio(accountSid, authToken);

interface SendSMSRequestBody {
  to: string[];
  message: string;
}

interface SMSResult {
  to: string;
  status: string;
  sid?: string;
  error?: string;
  errorCode?: number; // Added to capture Twilio-specific error codes
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SendSMSRequestBody;
    const { to, message } = body;

    // Input validation
    if (!Array.isArray(to) || to.length === 0) {
      return NextResponse.json(
        { message: 'Recipient phone numbers (to) are required and must be an array.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { message: 'Message content is required.' },
        { status: 400 }
      );
    }

    const validRecipients = to.filter(
      (number) => typeof number === 'string' && number.trim() !== ''
    );

    if (validRecipients.length === 0) {
      return NextResponse.json(
        { message: 'No valid recipient phone numbers provided.' },
        { status: 400 }
      );
    }

    const results: SMSResult[] = [];

    // Loop through each recipient
    for (const phoneNumber of validRecipients) {
      try {
        // Try sending using Alphanumeric Sender ID ("TUMA")
        // Note: Alphanumeric Sender IDs require pre-registration in many countries
        // and are not supported for all destinations or Twilio accounts.
        const twilioResponse = await client.messages.create({
          body: message,
          from: 'TUMA', // This will likely fail without proper setup/country support
          to: phoneNumber,
        });

        results.push({ to: phoneNumber, status: 'success', sid: twilioResponse.sid });
      } catch (smsError) {
        // TypeScript catches errors as 'unknown' in strict mode.
        // We safely cast it to our custom TwilioApiError interface.
        const err = smsError as TwilioApiError;
        console.error(`Error sending SMS to ${phoneNumber} using 'TUMA':`, err.message);
        if (err.code) {
          console.error(`Twilio Error Code: ${err.code}`);
        }
        if (err.moreInfo) {
          console.error(`More Info: ${err.moreInfo}`);
        }

        // Fallback: use Twilio phone number
        try {
          const fallbackResponse = await client.messages.create({
            body: message,
            from: twilioPhoneNumber, // This is the reliable method for most accounts
            to: phoneNumber,
          });

          results.push({
            to: phoneNumber,
            status: 'success (fallback)',
            sid: fallbackResponse.sid,
          });
        } catch (fallbackError) {
          const fbErr = fallbackError as TwilioApiError;
          console.error(`Fallback failed for ${phoneNumber}:`, fbErr.message);
          if (fbErr.code) {
            console.error(`Fallback Twilio Error Code: ${fbErr.code}`);
          }

          results.push({
            to: phoneNumber,
            status: 'failed',
            error: fbErr.message,
            errorCode: fbErr.code, // Store the error code
          });
        }
      }
    }

    const failedMessages = results.filter((r) => r.status === 'failed');
    if (failedMessages.length > 0) {
      // Use status 207 for Partial Content if some messages failed but others succeeded
      return NextResponse.json(
        { message: 'Some messages failed to send.', results },
        { status: 207 }
      );
    }

    return NextResponse.json(
      { message: 'All SMS messages sent successfully!', results },
      { status: 200 }
    );
  } catch (outerError) {
    // Catch-all for any unexpected errors during the API route execution
    const err = outerError as Error; // General Error type for outer scope
    console.error('API route error:', err);
    return NextResponse.json(
      { message: 'Internal server error.', error: err.message },
      { status: 500 }
    );
  }
}