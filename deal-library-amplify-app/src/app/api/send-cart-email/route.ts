import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Initialize Resend only when API is called (not during build)
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Email service is not configured. Please contact support.' },
      { status: 500 }
    );
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const body = await request.json();
    const { deals, audiences, senderInfo } = body;

    // Validate that we have at least some data
    if ((!deals || deals.length === 0) && (!audiences || audiences.length === 0)) {
      return NextResponse.json(
        { error: 'Cart is empty. Please add deals or audiences before sending.' },
        { status: 400 }
      );
    }

    // Validate sender info
    if (!senderInfo || !senderInfo.name || !senderInfo.company || !senderInfo.email) {
      return NextResponse.json(
        { error: 'Sender information is required.' },
        { status: 400 }
      );
    }

    // Build deals list HTML
    let dealsHtml = '';
    if (deals && deals.length > 0) {
      dealsHtml = `
        <div class="section">
          <h2 class="section-title">Deals (${deals.length})</h2>
          <div class="items-list">
            ${deals.map((deal: any) => `
              <div class="item">
                <div class="item-name">${deal.dealName}</div>
                <div class="item-id">Deal ID: ${deal.dealId || deal.id}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Build audiences list HTML
    let audiencesHtml = '';
    if (audiences && audiences.length > 0) {
      audiencesHtml = `
        <div class="section">
          <h2 class="section-title">Audiences (${audiences.length})</h2>
          <div class="items-list">
            ${audiences.map((audience: any) => `
              <div class="item">
                <div class="item-name">${audience.segmentName || audience.name}</div>
                <div class="item-id">Segment ID: ${audience.sovrnSegmentId || audience.segmentId || audience.id}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Build email HTML content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .header {
              background: linear-gradient(135deg, #D4AF37 0%, #FF8C42 100%);
              color: #2C2C2C;
              padding: 30px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 700;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .section {
              margin-bottom: 30px;
            }
            .section:last-child {
              margin-bottom: 0;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #2C2C2C;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #D4AF37;
            }
            .items-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .item {
              background: #f9fafb;
              padding: 12px 15px;
              border-radius: 6px;
              border-left: 3px solid #D4AF37;
            }
            .item-name {
              font-weight: 600;
              color: #2C2C2C;
              margin-bottom: 4px;
            }
            .item-id {
              font-size: 13px;
              color: #6b7280;
              font-family: 'Courier New', monospace;
            }
            .footer {
              background: #ffffff;
              margin-top: 0;
              padding: 20px 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
            .summary {
              background: #fef3c7;
              padding: 15px;
              border-radius: 6px;
              margin-bottom: 20px;
              text-align: center;
              font-weight: 600;
              color: #92400e;
            }
            .sender-info {
              background: #e0f2fe;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 25px;
              border-left: 4px solid #0284c7;
            }
            .sender-info-title {
              font-size: 14px;
              font-weight: 700;
              color: #0c4a6e;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
            }
            .sender-field {
              margin-bottom: 8px;
            }
            .sender-field:last-child {
              margin-bottom: 0;
            }
            .sender-label {
              font-weight: 600;
              color: #0c4a6e;
              display: inline;
            }
            .sender-value {
              color: #1e3a8a;
              display: inline;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📦 Deal Library Selections</h1>
          </div>
          <div class="content">
            <div class="sender-info">
              <div class="sender-info-title">Sent By</div>
              <div class="sender-field">
                <span class="sender-label">Name:</span> <span class="sender-value">${senderInfo.name}</span>
              </div>
              <div class="sender-field">
                <span class="sender-label">Company:</span> <span class="sender-value">${senderInfo.company}</span>
              </div>
              <div class="sender-field">
                <span class="sender-label">Email:</span> <span class="sender-value"><a href="mailto:${senderInfo.email}">${senderInfo.email}</a></span>
              </div>
            </div>
            <div class="summary">
              Total: ${(deals?.length || 0) + (audiences?.length || 0)} item${(deals?.length || 0) + (audiences?.length || 0) !== 1 ? 's' : ''} selected
            </div>
            ${dealsHtml}
            ${audiencesHtml}
          </div>
          <div class="footer">
            <p>This email was sent from the Deal Library application</p>
            <p>Sent on ${new Date().toLocaleString('en-US', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</p>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    // Note: Using Resend free tier - can only send to verified email (cgeorge@sovrn.com)
    // To send to multiple recipients (e.g., exchangedemand@sovrn.com), verify a domain at resend.com/domains
    const { data, error } = await resend.emails.send({
      from: 'Deal Library <onboarding@resend.dev>',
      to: ['cgeorge@sovrn.com'],
      replyTo: senderInfo.email,
      subject: `Deal Library Selections from ${senderInfo.company} - ${(deals?.length || 0) + (audiences?.length || 0)} item${(deals?.length || 0) + (audiences?.length || 0) !== 1 ? 's' : ''}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json(
      { 
        success: true, 
        message: 'Selections sent successfully!',
        emailId: data?.id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in send-cart-email route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

