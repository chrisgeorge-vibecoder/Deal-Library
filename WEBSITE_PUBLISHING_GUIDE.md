# 🚀 Publishing the Sales Prospecting Tool to Your Website

## ✅ Done: File Copied to Next.js Public Folder

The tool is now at: `/deal-library-frontend/public/sales-prospecting-tool.html`

---

## 🌐 **How to Access It**

### **If Your Next.js App is Running Locally:**

**URL:** `http://localhost:3000/sales-prospecting-tool.html`

Just visit this URL in your browser!

---

### **If Your Next.js App is Deployed to Production:**

**URL:** `https://your-domain.com/sales-prospecting-tool.html`

Replace `your-domain.com` with your actual domain.

**Examples:**
- `https://sovrn.com/sales-prospecting-tool.html`
- `https://marketing.sovrn.com/sales-prospecting-tool.html`
- `https://tools.sovrn.com/sales-prospecting-tool.html`

---

## 📋 **Deployment Checklist**

### **Step 1: Test Locally**
```bash
cd deal-library-frontend
npm run dev
```

Then visit: `http://localhost:3000/sales-prospecting-tool.html`

✅ **Verify:**
- Tool loads properly
- All 199 segments appear
- Infographics generate correctly
- Email templates work
- Brand recommendations show
- JPG download works

---

### **Step 2: Build for Production**
```bash
cd deal-library-frontend
npm run build
```

This optimizes your Next.js app for production.

---

### **Step 3: Deploy to Your Hosting Provider**

Choose your deployment method:

#### **Option A: Vercel (Easiest for Next.js)**
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy from your frontend directory
cd deal-library-frontend
vercel
```

Follow the prompts. Your tool will be at:
`https://your-app.vercel.app/sales-prospecting-tool.html`

---

#### **Option B: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd deal-library-frontend
netlify deploy --prod
```

Your tool will be at:
`https://your-app.netlify.app/sales-prospecting-tool.html`

---

#### **Option C: Traditional Web Server (Apache/Nginx)**

**Upload via FTP/SFTP:**
1. Connect to your web server
2. Upload `/deal-library-frontend/public/sales-prospecting-tool.html`
3. Place it in your web root (usually `/var/www/html/` or `/public_html/`)

**URL:** `https://your-domain.com/sales-prospecting-tool.html`

---

#### **Option D: AWS S3 + CloudFront**
```bash
# Upload to S3
aws s3 cp deal-library-frontend/public/sales-prospecting-tool.html s3://your-bucket-name/

# Make it public (optional)
aws s3api put-object-acl --bucket your-bucket-name --key sales-prospecting-tool.html --acl public-read
```

**URL:** `https://your-bucket.s3.amazonaws.com/sales-prospecting-tool.html`

---

## 🔗 **Linking to the Tool from Your Website**

### **Add to Your Navigation**

Edit your Next.js navigation component (likely in `src/components/`):

```tsx
<Link href="/sales-prospecting-tool.html" target="_blank">
  Sales Prospecting Tool
</Link>
```

---

### **Create a Landing Page Button**

```tsx
<a 
  href="/sales-prospecting-tool.html" 
  className="btn btn-primary"
  target="_blank"
  rel="noopener noreferrer"
>
  🎯 Launch Sales Prospecting Tool
</a>
```

---

### **Embed It in a Page (Alternative)**

Instead of linking, you can embed it directly:

```tsx
// In your Next.js page component
export default function ProspectingToolPage() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe 
        src="/sales-prospecting-tool.html" 
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none' 
        }}
      />
    </div>
  );
}
```

---

## 🎨 **Customization Before Publishing**

If you want to brand it specifically for your public website (vs. Confluence), you can:

### **1. Update the Header Colors**

Edit the file and change line ~27-32:

```css
.header {
    background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
}
```

### **2. Add Your Logo**

Add this inside the `<header>` section (line ~338):

```html
<div class="header">
    <img src="/path-to-your-logo.svg" alt="Company Logo" style="height: 50px; margin-bottom: 15px;">
    <h1>🎯 Sovrn Sales Prospecting Tool</h1>
    ...
</div>
```

### **3. Add Analytics Tracking**

Add before `</body>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'YOUR_GA_ID');
</script>
```

---

## 🔒 **Security Considerations**

### **Public Access**
✅ **Safe** - The tool has no backend dependencies, no API calls, and no sensitive data
✅ **No Authentication Needed** - It's a self-contained tool using embedded data
✅ **No PII Collected** - Doesn't collect any user information

### **Optional: Add Password Protection**

If you want to restrict access, add this to your Next.js middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/sales-prospecting-tool.html') {
    const auth = request.headers.get('authorization');
    
    if (!auth || auth !== 'Basic YOUR_BASE64_ENCODED_CREDENTIALS') {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      });
    }
  }
  
  return NextResponse.next();
}
```

---

## 📊 **Monitoring & Analytics**

### **Track Usage**
- Add Google Analytics (see customization section above)
- Monitor page views to `/sales-prospecting-tool.html`
- Track button clicks (download, copy email)

### **Performance**
The tool is lightweight:
- **File size:** ~185KB (includes all 199 segments)
- **Load time:** <1 second on most connections
- **No external dependencies:** Works offline after initial load

---

## 🆘 **Troubleshooting**

### **Issue: 404 Not Found**
- Verify file is in `/deal-library-frontend/public/`
- Rebuild your Next.js app: `npm run build`
- Clear browser cache (Cmd/Ctrl + Shift + R)

### **Issue: Styling Looks Wrong**
- The file is self-contained with all CSS embedded
- Check browser console (F12) for any errors
- Try in an incognito/private window

### **Issue: Can't Download Infographics**
- This is a browser feature - ensure it's not blocked
- Check browser's download permissions
- Try a different browser (Chrome works best)

---

## 📦 **Alternative: Standalone Hosting**

If you want to host **only the tool** separately from your main website:

### **Option 1: GitHub Pages (Free)**
```bash
# Create a new repo
git init sales-tool
cd sales-tool
cp /Users/cgeorge/Deal-Library/sales-prospecting-tool-v2.html index.html
git add .
git commit -m "Add sales tool"
git push origin main

# Enable GitHub Pages in repo settings
```

**URL:** `https://your-username.github.io/sales-tool/`

---

### **Option 2: Netlify Drop (Super Easy)**
1. Go to: https://app.netlify.com/drop
2. Drag and drop `sales-prospecting-tool-v2.html`
3. Get instant URL: `https://random-name.netlify.app`
4. (Optional) Add custom domain

---

## 🎯 **Best Practice Recommendation**

**For Sovrn's Use Case:**

1. ✅ **Keep it in your Next.js app** (already done)
2. ✅ **Deploy via Vercel or your existing hosting**
3. ✅ **Link to it from your main navigation** or sales resources page
4. ✅ **Share the direct URL** with your sales team
5. ✅ **Keep Confluence version** for internal use

---

## 📞 **Support Contacts**

If you need help deploying:
- **Vercel:** https://vercel.com/docs
- **Netlify:** https://docs.netlify.com
- **Next.js:** https://nextjs.org/docs/deployment

---

## ✅ **Quick Test**

Once deployed, test these features:
- [ ] Select "Sports & Outdoors" → "Camping & Hiking"
- [ ] Pick an overlap product
- [ ] Click "Generate Infographic & Email"
- [ ] Download the JPG
- [ ] Copy email template
- [ ] View brand recommendations

**Everything working?** ✅ You're live!


