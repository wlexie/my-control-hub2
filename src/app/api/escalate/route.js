// src/app/api/escalate/route.js
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// WARNING: Hardcoded credentials - NOT recommended for production
const resend = new Resend('re_FKBEUQ2b_DaXGMEGCgtmxLehTW9aCsTTi'); // Replace with your actual key


const teamEmails = {
  'Support Team': 'support@tuma-app.com',
  'Manager': 'manager@tuma-app.com',
  'Technical Lead': 'jeremybundi4@gmail.com'
};

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.reason || !body.priority || !body.escalateTo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { reason, priority, escalateTo, notes } = body;
    const recipientEmail = teamEmails[escalateTo];

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'Invalid escalation team selected' },
        { status: 400 }
      );
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">New Issue Escalation</h2>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Escalated To:</strong> ${escalateTo}</p>
        ${notes ? `<div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;"><strong>Notes:</strong><br>${notes.replace(/\n/g, '<br>')}</div>` : ''}
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Tuma Support <support@tuma.com>',
      to: [recipientEmail],
      subject: `[${priority}] Escalation: ${reason}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Email sending failed:', error);
      return NextResponse.json(
        { error: 'Failed to send escalation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Escalation processed successfully',
      emailId: data.id
    });

  } catch (err) {
    console.error('Escalation error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



