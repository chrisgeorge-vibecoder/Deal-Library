import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyName,
      contactEmail,
      campaignObjectives,
      targetAudience,
      budget,
      timeline,
      additionalNotes
    } = body;

    // Validate required fields
    if (!companyName || !contactEmail || !campaignObjectives || !targetAudience) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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
              border-radius: 0 0 8px 8px;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: 600;
              color: #2C2C2C;
              margin-bottom: 5px;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .field-value {
              background: #f9fafb;
              padding: 12px;
              border-radius: 6px;
              border-left: 3px solid #D4AF37;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎯 New Custom Deal Request</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="field-label">Company Name</div>
              <div class="field-value">${companyName}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Contact Email</div>
              <div class="field-value"><a href="mailto:${contactEmail}">${contactEmail}</a></div>
            </div>
            
            <div class="field">
              <div class="field-label">Campaign Objectives</div>
              <div class="field-value">${campaignObjectives}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Target Audience</div>
              <div class="field-value">${targetAudience}</div>
            </div>
            
            ${budget ? `
            <div class="field">
              <div class="field-label">Budget Range</div>
              <div class="field-value">${budget}</div>
            </div>
            ` : ''}
            
            ${timeline ? `
            <div class="field">
              <div class="field-label">Timeline</div>
              <div class="field-value">${timeline}</div>
            </div>
            ` : ''}
            
            ${additionalNotes ? `
            <div class="field">
              <div class="field-label">Additional Notes</div>
              <div class="field-value">${additionalNotes}</div>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>This request was submitted through the Deal Library Custom Deal Request Form</p>
            <p>Submitted on ${new Date().toLocaleString('en-US', { 
              dateStyle: 'full', 
              timeStyle: 'short' 
            })}</p>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Deal Library <onboarding@resend.dev>', // You'll need to update this with your verified domain
      to: ['cgeorge@sovrn.com'],
      replyTo: contactEmail,
      subject: `New Custom Deal Request from ${companyName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Custom deal request sent successfully',
        emailId: data?.id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in send-custom-deal-request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

