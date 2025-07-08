import { NextResponse } from 'next/server';

// --- Credentials ---
// For production, it's highly recommended to move these to environment variables (.env.local)
// e.g., process.env.MESSAGEBIRD_API_KEY
const MESSAGEBIRD_API_KEY = 'jR0kbXM2FxlNHMblz7sV33G6d';
const MESSAGEBIRD_CHANNEL_ID = '7e68f5e4-965d-4bbc-9b37-017de54c0d17';
const MESSAGEBIRD_WHATSAPP_NAMESPACE = '275630005643112';

/**
 * API route to send a WhatsApp HSM (Highly Structured Message) template via MessageBird.
 * This code is specifically structured to handle templates with variables in the body.
 */
export async function POST(request) {
  try {
    // 1. Get the data from the frontend request
    const { recipient, templateName, params } = await request.json();

    // 2. Validate essential inputs
    if (!recipient || !templateName) {
      return NextResponse.json({ error: 'Recipient phone number and templateName are required.' }, { status: 400 });
    }

    // 3. --- THE DEFINITIVE FIX ---
    // This section correctly formats the parameters for templates with variables (like adding a user's name).
    // The WhatsApp API requires a 'components' array for this purpose.
    let components;
    if (params && Array.isArray(params) && params.length > 0) {
      // Step 3a: Extract the variable values from the frontend's format (e.g., from [{ "default": "John Doe" }])
      // This makes the code robust, as it handles the specific way your frontend sends data.
      const variableValues = params.map(p => p.default);

      // Step 3b: Build the 'components' array in the exact structure MessageBird/WhatsApp requires.
      components = [
        {
          type: 'body', // Specifies the variables are for the message body
          parameters: variableValues.map(value => ({
            type: 'text', // Specifies the variable is plain text
            text: String(value), // Ensures the value is a string
          })),
        },
      ];
    }
    // --- END OF THE FIX ---

    // 4. Construct the final, correct payload for the MessageBird API
    const messageBirdPayload = {
      to: recipient,
      from: MESSAGEBIRD_CHANNEL_ID,
      type: 'hsm',
      content: {
        hsm: {
          namespace: MESSAGEBIRD_WHATSAPP_NAMESPACE,
          templateName: templateName,
          language: {
            policy: 'deterministic',
            code: 'en',
          },
          // Conditionally add the 'components' array ONLY if there are variables.
          // This is crucial for templates that might not have variables.
          ...(components && { components: components }),
        },
      },
    };

    // Log the payload for debugging. This is extremely useful to confirm what's being sent.
    console.log(" PAYLOAD SENT TO MESSAGEBIRD:", JSON.stringify(messageBirdPayload, null, 2));

    // 5. Send the request to MessageBird
    const response = await fetch('https://conversations.messagebird.com/v1/send', {
      method: 'POST',
      headers: {
        'Authorization': `AccessKey ${MESSAGEBIRD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageBirdPayload),
    });

    const responseData = await response.json();

    // 6. Handle the response from MessageBird
    if (!response.ok) {
      // If MessageBird returns an error, log it and send a clear error to the frontend.
      console.error('Error from MessageBird API:', responseData);
      const errorMessage = responseData.errors?.[0]?.description || 'An unknown error occurred with the MessageBird API.';
      return NextResponse.json(
        {
          error: 'Failed to send template message via MessageBird.',
          details: errorMessage,
        },
        { status: response.status }
      );
    }
    
    // 7. If successful, send a success response back to the frontend.
    return NextResponse.json({ 
        success: true, 
        message: 'Template message request sent successfully.',
        messagebirdResponse: responseData 
    });

  } catch (error) {
    // Handle unexpected server errors (e.g., network failure, JSON parsing issues)
    console.error('Internal server error in /api/sendTemplate:', error);
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}