// /api/sendTemplate.js

import { NextResponse } from 'next/server';

// --- Credentials ---
const MESSAGEBIRD_API_KEY = 'jR0kbXM2FxlNHMblz7sV33G6d';
const MESSAGEBIRD_CHANNEL_ID = '7e68f5e4-965d-4bbc-9b37-017de54c0d17';
const MESSAGEBIRD_WHATSAPP_NAMESPACE = '275630005643112'; 

export async function POST(request) {
  try {
    const { recipient, templateName, params, mediaUrl } = await request.json();

    if (!recipient || !templateName) {
      return NextResponse.json({ error: 'Recipient phone number and templateName are required.' }, { status: 400 });
    }

    let formattedRecipient = String(recipient);
    if (!formattedRecipient.startsWith('+')) {
      formattedRecipient = `+${formattedRecipient}`;
    }

    // --- LOGIC MODIFICATION START ---
    // This is the new business rule implementation.

    let processedParams = params; 

    // Check if params exist and the first param's value is purely numeric
    if (params && params.length > 0 && params[0].default && /^\d+$/.test(params[0].default)) {
      // We create a new array to avoid modifying the original.
      console.log(`Original param "${params[0].default}" is numeric. Replacing with "there".`);
      processedParams = [{ default: 'there' }, ...params.slice(1)]; 
    }


    // --- DYNAMIC PAYLOAD CONSTRUCTION (using the processed params) ---
    const components = [];

    if (mediaUrl) {
      components.push({
        type: 'header',
        parameters: [{ type: 'image', image: { url: mediaUrl } }],
      });
    }

    // Use the `processedParams` which now contains either the original name or "Customer"
    if (processedParams && processedParams.length > 0) {
      components.push({
        type: 'body',
        parameters: processedParams.map(param => ({
          type: 'text',
          text: param.default,
        })),
      });
    }
    
    const messageBirdPayload = {
      to: formattedRecipient,
      from: MESSAGEBIRD_CHANNEL_ID,
      type: 'hsm',
      content: {
        hsm: {
          namespace: MESSAGEBIRD_WHATSAPP_NAMESPACE,
          templateName: templateName,
          language: { policy: 'deterministic', code: 'en' },
          components: components,
        },
      },
    };

    console.log("FINAL PAYLOAD TO MESSAGEBIRD:", JSON.stringify(messageBirdPayload, null, 2));

    const response = await fetch('https://conversations.messagebird.com/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${MESSAGEBIRD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageBirdPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Error from MessageBird API:', responseData);
      const errorMessage = responseData.errors?.[0]?.description || 'An unknown error occurred.';
      return NextResponse.json({ error: 'Failed to send template.', details: errorMessage }, { status: response.status });
    }
    
    return NextResponse.json({ success: true, message: 'Template message request sent successfully.', responseData });

  } catch (error) {
    console.error('Internal server error in /api/sendTemplate:', error);
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}