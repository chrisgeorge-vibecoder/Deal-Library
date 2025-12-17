# Resend Email Setup Instructions

This document explains how to set up Resend for sending custom deal request emails.

## Quick Setup

1. **Sign up for Resend**
   - Go to [https://resend.com](https://resend.com)
   - Sign up for a free account (100 emails/day free tier)

2. **Get Your API Key**
   - After signing in, go to [API Keys](https://resend.com/api-keys)
   - Click "Create API Key"
   - Give it a name (e.g., "Deal Library")
   - Copy the API key (starts with `re_`)

3. **Add API Key to Environment Variables**
   - Open `.env.local` in the `deal-library-frontend` directory
   - Replace `your_resend_api_key_here` with your actual API key:
     ```
     RESEND_API_KEY=re_your_actual_key_here
     ```

4. **Restart the Development Server**
   - Stop your Next.js dev server (Ctrl+C)
   - Start it again: `npm run dev`

## Verify Email Domain (Optional but Recommended)

By default, Resend uses `onboarding@resend.dev` as the sender address. This is fine for testing but you may want to use your own domain:

1. **Add Your Domain**
   - Go to [Domains](https://resend.com/domains) in Resend dashboard
   - Click "Add Domain"
   - Enter your domain (e.g., `sovrn.com`)

2. **Add DNS Records**
   - Follow the instructions to add DNS records
   - Wait for verification (usually takes a few minutes)

3. **Update the API Route**
   - Open `src/app/api/send-custom-deal-request/route.ts`
   - Update the `from` field:
     ```typescript
     from: 'Deal Library <deals@yourdomain.com>',
     ```

## Configuration

The email is currently configured to send to: **cgeorge@sovrn.com**

To change the recipient:
- Edit `src/app/api/send-custom-deal-request/route.ts`
- Update the `to` array in the `resend.emails.send()` call

## Testing

1. Open the Deal Library application
2. Click "Request Custom Deal" button
3. Fill out the form
4. Submit
5. Check your inbox at cgeorge@sovrn.com

## Email Template

The email includes:
- Company Name
- Contact Email (with reply-to functionality)
- Campaign Objectives
- Target Audience
- Budget Range (optional)
- Timeline (optional)
- Additional Notes (optional)
- Timestamp of submission

The email is styled with Sovrn branding colors (gold and orange gradient).

## Troubleshooting

### Email not sending?
- Check that `RESEND_API_KEY` is set in `.env.local`
- Verify the API key is correct (should start with `re_`)
- Check the browser console for errors
- Check the terminal/server logs for error messages

### API Key Invalid?
- Make sure you copied the entire key
- Don't include quotes around the key in `.env.local`
- Regenerate the key if needed

### Rate Limits
- Free tier: 100 emails/day, 3,000/month
- Upgrade to paid plan if you need more

## Support

- Resend Documentation: [https://resend.com/docs](https://resend.com/docs)
- Resend Support: support@resend.com

