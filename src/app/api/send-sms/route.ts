import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { formidable, Fields, Files } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import type { IncomingMessage } from 'http';

// --- CONFIGURATION ---
// IMPORTANT: For security, store these secrets in environment variables (.env.local)
// and access them with process.env.MESSAGEBIRD_API_KEY, etc.
const MESSAGEBIRD_API_KEY = 'jR0kbXM2FxlNHMblz7sV33G6d'; // Replace with your actual key from .env
const MESSAGEBIRD_CHANNEL_ID = '7e68f5e4-965d-4bbc-9b37-017de54c0d17'; // Replace with your channel ID from .env
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const config = {
  api: {
    // bodyParser must be false for formidable to parse multipart form data
    bodyParser: false,
  },
};

// --- HELPER FUNCTION TO PARSE FILE UPLOADS ---
const parseForm = (req: Request): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

// --- MAIN API ROUTE HANDLER ---
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // --- BRANCH 1: HANDLE FILE UPLOADS (for single messages with attachments) ---
    if (contentType.includes('multipart/form-data')) {
      const { fields, files } = await parseForm(request);

      if (!files.file || !fields.recipientPhone) {
        return NextResponse.json({ error: 'File and recipientPhone are required.' }, { status: 400 });
      }

      const fileArray = Array.isArray(files.file) ? files.file : [files.file];
      const phoneArray = Array.isArray(fields.recipientPhone) ? fields.recipientPhone : [fields.recipientPhone];
      const file = fileArray[0];
      const recipientPhone = phoneArray[0];

      const publicUploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(publicUploadDir, { recursive: true });

      const newFilename = `${Date.now()}-${file.originalFilename}`;
      const newPath = path.join(publicUploadDir, newFilename);
      await fs.rename(file.filepath, newPath);

      const mediaUrl = `${BASE_URL}/uploads/${newFilename}`;
      let messagePayload: object;

      if (file.mimetype?.startsWith('image/')) {
        messagePayload = { to: recipientPhone, from: MESSAGEBIRD_CHANNEL_ID, type: 'image', content: { image: { url: mediaUrl } } };
      } else {
        messagePayload = { to: recipientPhone, from: MESSAGEBIRD_CHANNEL_ID, type: 'file', content: { file: { url: mediaUrl } } };
      }
      
      const messageBirdResponse = await axios.post('https://conversations.messagebird.com/v1/send', messagePayload, {
          headers: { Authorization: `AccessKey ${MESSAGEBIRD_API_KEY}`, 'Content-Type': 'application/json' },
      });

      return NextResponse.json({ success: true, response: messageBirdResponse.data });
    }

    // --- BRANCH 2: HANDLE JSON (for bulk SMS text campaigns) ---
    else if (contentType.includes('application/json')) {
      const body = await request.json();
      // **FIXED**: Expect 'to' (an array) and 'message' from the React component
      const { to: recipients, message } = body;

      // **VALIDATION**: Ensure the data is what we expect for a campaign
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0 || !message) {
        return NextResponse.json(
          { success: false, error: 'Request body must include a non-empty "to" array and a "message" string.' },
          { status: 400 } // 400 Bad Request
        );
      }

      // **PROCESSING**: Create a list of API calls to make, one for each recipient
      const sendPromises = recipients.map((recipientPhone: string) => {
        const messagePayload = {
          to: recipientPhone.trim(), // Sanitize by trimming whitespace
          from: MESSAGEBIRD_CHANNEL_ID,
          type: 'text',
          content: { text: message },
        };

        return axios.post('https://conversations.messagebird.com/v1/send', messagePayload, {
          headers: { Authorization: `AccessKey ${MESSAGEBIRD_API_KEY}`, 'Content-Type': 'application/json' },
        });
      });

      // **EXECUTION**: Run all API calls in parallel and wait for them to finish
      const results = await Promise.allSettled(sendPromises);

      // **RESPONSE**: Report a summary of the campaign outcome
      const successfulSends = results.filter(res => res.status === 'fulfilled').length;
      const failedSends = results.length - successfulSends;

      console.log(`Campaign processed: ${successfulSends} successful, ${failedSends} failed.`);

      // Use a 207 Multi-Status code if some messages failed but others succeeded
      const responseStatus = failedSends > 0 && successfulSends > 0 ? 207 : 200;

      return NextResponse.json(
        {
          success: true,
          message: `Campaign processed. Successfully sent ${successfulSends} of ${recipients.length} messages.`,
          details: {
            totalRecipients: recipients.length,
            successful: successfulSends,
            failed: failedSends,
          },
        },
        { status: responseStatus }
      );
    }

    // --- BRANCH 3: HANDLE UNSUPPORTED REQUEST TYPES ---
    else {
      return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 415 });
    }

  } catch (error) {
    // --- GENERIC ERROR HANDLING ---
    const axiosError = error as AxiosError;
    console.error('API Route Error:', axiosError.response?.data || axiosError.message);
    return NextResponse.json(
      { success: false, error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}