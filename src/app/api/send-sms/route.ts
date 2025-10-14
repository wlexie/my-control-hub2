import { NextResponse } from 'next/server';
import twilio from 'twilio';

// Load Twilio credentials from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Basic validation for environment variables
if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('Twilio environment variables are not properly set.');
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      'Please ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are defined in your .env.local file.'
    );
  }
}

const client = twilio(accountSid, authToken);

interface SendSMSRequestBody {
  to: string[];
  message: string;
}

export async function POST(req: Request) {
  try {
    const { to, message }: SendSMSRequestBody = await req.json();

    // Input validation
    if (!to || !Array.isArray(to) || to.length === 0) {
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

    const results: { to: string; status: string; error?: string; sid?: string }[] = [];

    // Loop through each recipient
    for (const phoneNumber of validRecipients) {
      try {
        // Try sending using Alphanumeric Sender ID ("TUMA")
        const twilioResponse = await client.messages.create({
          body: message,
          from: 'TUMA', // Your registered alphanumeric sender ID
          to: phoneNumber,
        });

        results.push({ to: phoneNumber, status: 'success', sid: twilioResponse.sid });
      } catch (smsError: any) {
        console.error(`Error sending SMS to ${phoneNumber} using 'TUMA':`, smsError.message);

        // Fallback: use your Twilio phone number if "TUMA" fails
        try {
          const fallbackResponse = await client.messages.create({
            body: message,
            from: twilioPhoneNumber,
            to: phoneNumber,
          });

          results.push({
            to: phoneNumber,
            status: 'success (fallback)',
            sid: fallbackResponse.sid,
          });
        } catch (fallbackError: any) {
          console.error(`Fallback failed for ${phoneNumber}:`, fallbackError.message);
          results.push({
            to: phoneNumber,
            status: 'failed',
            error: fallbackError.message,
          });
        }
      }
    }

    // Determine final response
    const failedMessages = results.filter((r) => r.status.startsWith('failed'));
    if (failedMessages.length > 0) {
      return NextResponse.json(
        {
          message: 'Some messages failed to send.',
          results,
        },
        { status: 207 } // Partial success
      );
    }

    return NextResponse.json(
      {
        message: 'All SMS messages sent successfully!',
        results,
      },
      { status: 200 }
    );
  } catch (outerError: any) {
    console.error('API route error:', outerError);
    return NextResponse.json(
      { message: 'Internal server error.', error: outerError.message },
      { status: 500 }
    );
  }
}
