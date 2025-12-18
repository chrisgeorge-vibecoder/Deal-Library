# How to Access CloudWatch Logs for AWS Amplify

CloudWatch logs are where your application's console.log and console.error output goes when running on AWS Amplify.

## Option 1: AWS Amplify Console → Hosting Compute Logs (Recommended)

1. **Go to AWS Amplify Console**
   - Visit https://console.aws.amazon.com/amplify/
   - Sign in if needed

2. **Select Your App**
   - Click on your app name in the list

3. **Open Hosting Compute Logs**
   - In the left sidebar, look for **"Hosting"** or **"Monitoring"**
   - Click **"Hosting"** → **"Compute logs"** (or just **"Logs"**)
   - This shows logs from your Next.js API routes running on the compute resource
   - Select a compute resource (usually "default")
   - Select a time range (e.g., "Last 1 hour")

4. **View Logs**
   - Logs will appear showing all console.log and console.error output from your API routes
   - Search for terms like "deals", "API Route", "env var", or "/api/deals" to filter
   - Look for entries with timestamps matching when you made the API call

## Option 2: AWS CloudWatch Console (Direct Access)

1. **Go to AWS CloudWatch Console**
   - Visit https://console.aws.amazon.com/cloudwatch/
   - Sign in if needed

2. **Navigate to Logs**
   - In the left sidebar, click **"Logs"** → **"Log groups"**

3. **Find Your App's Log Group**
   - Look for log groups like:
     - `/aws/amplify/{app-id}/{branch}/compute/default`
     - Or search for your app name

4. **Open a Log Stream**
   - Click on a log group
   - Click on a recent log stream (these are individual execution instances)
   - View the logs

## What to Look For

When debugging the `/api/deals` route issue, look for:

- `🔍 /api/deals GET - Env var check:` - Shows if env vars are accessible
- `❌ /api/deals GET - GOOGLE_APPS_SCRIPT_URL not available:` - Error logs
- Compare with `/api/deals/test-env` logs to see the difference

## Quick Alternative: Check the API Response

Since logs can be hard to access, the updated code now includes debug info in the API response itself. When you call `/api/deals` and it fails, check the `debug` field in the JSON response - it will show what env vars are available at runtime.

