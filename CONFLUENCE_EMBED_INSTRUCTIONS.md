# How to Embed the Sales Prospecting Tool in Confluence

## ✅ Step 1: Upload the HTML File

You have a Confluence-optimized version ready: **`sales-prospecting-tool-confluence.html`**

**Key Confluence optimizations made:**
- Transparent background (adapts to Confluence theme)
- Minimal padding (works well in iframes)
- Lighter borders (blends better)
- Responsive at 1200px breakpoint (better for Confluence sidebars)
- All 199 audience segments embedded (no external dependencies)

### Upload Options:

**Option A: Host on Your Web Server (Recommended)**
1. Upload `sales-prospecting-tool-confluence.html` to your web server
2. Note the URL (e.g., `https://yoursite.com/tools/sales-prospecting-tool-confluence.html`)
3. Go to Step 2

**Option B: Use Confluence's Built-In File Attachment**
1. In your Confluence page, click "+" → "Attachment"
2. Upload `sales-prospecting-tool-confluence.html`
3. After uploading, right-click the attachment → "Copy Link Address"
4. The URL will look like: `https://yourconfluence.atlassian.net/...`
5. Go to Step 2

---

## ✅ Step 2: Embed in Confluence Page

### Method 1: Using the HTML Macro (Best)

1. **Edit your Confluence page**
2. Type `/html` and select **"HTML"** macro
3. Paste this code (replace YOUR_URL with your actual URL):

```html
<iframe 
    src="YOUR_URL_HERE" 
    width="100%" 
    height="3100px" 
    frameborder="0" 
    scrolling="yes"
    style="border: none; background: transparent;">
</iframe>
```

**Note:** Height increased to 3100px to accommodate the new "Relevant Deal IDs" section.

**Example:**
```html
<iframe 
    src="https://yoursite.com/tools/sales-prospecting-tool-confluence.html" 
    width="100%" 
    height="2000px" 
    frameborder="0" 
    scrolling="yes"
    style="border: none; background: transparent;">
</iframe>
```

4. **Publish** the page

---

### Method 2: Using the Iframe Macro (Alternative)

1. **Edit your Confluence page**
2. Type `/iframe` and select **"Iframe"** macro
3. In the macro settings:
   - **URL**: Paste your tool URL
   - **Width**: `100%`
   - **Height**: `2000` (pixels)
   - **Scrolling**: `yes`
4. **Publish** the page

---

## ✅ Step 3: Test the Embedded Tool

1. **View the published page**
2. **Test functionality:**
   - Select a category (e.g., "Sports & Outdoors")
   - Select a segment (e.g., "Camping & Hiking")
   - Click an overlap product
   - Click "Generate Infographic & Email"
   - Download the JPG infographic
   - Copy email templates
   - View brand recommendations

---

## 📋 Quick Troubleshooting

### Issue: "This content can't be displayed"
**Solution:** Your Confluence admin needs to whitelist the URL
1. Admin → Settings → Security → Allowed Domains
2. Add your domain to the whitelist

### Issue: Tool appears too small
**Solution:** Adjust the height in the iframe code
```html
height="2500px"  <!-- Increase this number -->
```

### Issue: Scrolling issues
**Solution:** Ensure `scrolling="yes"` is set in the iframe

### Issue: Background doesn't match
**Solution:** The Confluence version has a transparent background, so it should adapt automatically. If not, you may need to edit the `body` background color in the HTML file to match your Confluence theme.

---

## 🎨 Customization Options

If you want to further customize the tool before embedding:

1. **Change Colors:** Edit the CSS gradient colors in the file
2. **Adjust Spacing:** Modify padding/margin values in the `<style>` section
3. **Modify Data:** Edit the `audienceData` object in the `<script>` section

---

## 🔗 Alternative: Direct Link

If embedding doesn't work for your Confluence setup, you can also just link to the tool:

1. Upload the file to your web server
2. In Confluence, create a button or link that opens it in a new tab:
   ```
   [Open Sales Prospecting Tool](https://yoursite.com/tools/sales-prospecting-tool-confluence.html)
   ```

---

## 📧 Questions?

If you encounter issues:
1. Check that your Confluence admin has enabled HTML/Iframe macros
2. Verify the tool URL is accessible (try opening it in a new browser tab)
3. Check browser console for any JavaScript errors (F12 → Console tab)

