import { NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { formidable, Fields, Files } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';
import type { IncomingMessage } from 'http';

const MESSAGEBIRD_API_KEY = 'jR0kbXM2FxlNHMblz7sV33G6d';
const MESSAGEBIRD_CHANNEL_ID = '7e68f5e4-965d-4bbc-9b37-017de54c0d17';
const BASE_URL = 'http://localhost:3000';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to parse multipart form data
const parseForm = (req: Request): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req as unknown as IncomingMessage, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let messagePayload: object;

    if (contentType.includes('multipart/form-data')) {
      // --- HANDLE FILE UPLOAD ---
      const { fields, files } = await parseForm(request);

      if (!files.file || !fields.recipientPhone) {
        throw new Error('File and recipientPhone are required for uploads.');
      }

      const fileArray = Array.isArray(files.file) ? files.file : [files.file];
      const phoneArray = Array.isArray(fields.recipientPhone)
        ? fields.recipientPhone
        : [fields.recipientPhone];

      const file = fileArray[0];
      const recipientPhone = phoneArray[0];

      const publicUploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(publicUploadDir, { recursive: true });

      const newFilename = `${Date.now()}-${file.originalFilename}`;
      const newPath = path.join(publicUploadDir, newFilename);
      await fs.rename(file.filepath, newPath);

      const mediaUrl = `${BASE_URL}/uploads/${newFilename}`;

      if (file.mimetype && file.mimetype.startsWith('image/')) {
        messagePayload = {
          to: recipientPhone,
          from: MESSAGEBIRD_CHANNEL_ID,
          type: 'image',
          content: {
            image: { url: mediaUrl },
          },
        };
      } else {
        messagePayload = {
          to: recipientPhone,
          from: MESSAGEBIRD_CHANNEL_ID,
          type: 'file',
          content: {
            file: { url: mediaUrl },
          },
        };
      }
    } else if (contentType.includes('application/json')) {
      // --- HANDLE TEXT MESSAGE ---
      const body = await request.json();
      const { recipientPhone, message } = body;

      if (!recipientPhone || !message) {
        throw new Error('Recipient phone number and message are required.');
      }

      messagePayload = {
        to: recipientPhone,
        from: MESSAGEBIRD_CHANNEL_ID,
        type: 'text',
        content: { text: message },
      };
    } else {
      return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 415 });
    }

    // --- SEND TO MESSAGEBIRD ---
    const messageBirdResponse = await axios.post(
      'https://conversations.messagebird.com/v1/send',
      messagePayload,
      {
        headers: {
          Authorization: `AccessKey ${MESSAGEBIRD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json({
      success: true,
      response: messageBirdResponse.data,
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('MessageBird API sending error:', axiosError.response?.data || axiosError.message);

    return NextResponse.json(
      { success: false, error: 'Internal Server Error when sending message.' },
      { status: 500 }
    );
  }
}
