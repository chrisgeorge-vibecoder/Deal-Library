# 📜 Scroll Viewport Compatibility Guide

## ✅ **Current Status: Mostly Compatible**

The sales prospecting tool is **naturally scrollable** but needs adjustments for **iframe embedding** (like Confluence).

---

## 🔍 **Analysis of Current Design**

### **✅ What Works Well:**

1. **Natural Flow Layout**
   - Uses `min-height` instead of fixed `height`
   - No `overflow: hidden` cutting off content
   - Content expands naturally as it loads

2. **Responsive Grid**
   - 2-column layout on desktop
   - Collapses to 1 column on tablets/mobile (`@media max-width: 1200px`)

3. **No Fixed Positioning**
   - All elements scroll naturally with the page
   - No sticky headers or floating elements that could cause issues

### **⚠️ Potential Issues:**

1. **Dynamic Height in Iframes**
   - Tool starts at ~1200px tall
   - Expands to ~2200-2500px when results are generated
   - Fixed iframe height (like `2000px`) will cut off content

2. **Confluence Embedding**
   - Your current embed code: `height="2000px"`
   - **Problem:** Bottom content (brands, full email) gets hidden

---

## 🛠️ **Solutions**

### **Option 1: Increase Iframe Height (Quick Fix)**

Update your Confluence iframe embed code:

**Current (cuts off content):**
```html
<iframe 
    src="YOUR_URL" 
    width="100%" 
    height="2000px" 
    frameborder="0" 
    scrolling="yes">
</iframe>
```

**Improved (shows all content):**
```html
<iframe 
    src="YOUR_URL" 
    width="100%" 
    height="2800px" 
    frameborder="0" 
    scrolling="yes"
    style="border: none; background: transparent;">
</iframe>
```

**Height Breakdown:**
- Header: ~150px
- Form panels: ~600px
- Infographic preview: ~500px
- Email templates: ~400px
- Brand list: ~400px
- Margins/padding: ~250px
- **Total:** ~2300px
- **Recommended:** `2800px` (buffer for safety)

---

### **Option 2: Auto-Resize Iframe (Best Solution)**

Add this JavaScript to your Confluence page to auto-resize the iframe:

```html
<iframe 
    id="prospecting-tool" 
    src="YOUR_URL" 
    width="100%" 
    height="1200px" 
    frameborder="0" 
    scrolling="yes">
</iframe>

<script>
  // Auto-resize iframe based on content
  const iframe = document.getElementById('prospecting-tool');
  
  window.addEventListener('message', function(e) {
    if (e.data.type === 'resize') {
      iframe.style.height = e.data.height + 'px';
    }
  });
  
  // Initial resize after load
  iframe.onload = function() {
    setTimeout(() => {
      iframe.style.height = '2800px';
    }, 100);
  };
</script>
```

---

### **Option 3: Add postMessage to the Tool (Advanced)**

If you want the iframe to communicate its height to the parent, add this to the tool before `</body>`:

```html
<script>
  // Send height updates to parent frame
  function notifyParent() {
    const height = document.documentElement.scrollHeight;
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'resize',
        height: height
      }, '*');
    }
  }
  
  // Notify on load and when content changes
  window.addEventListener('load', notifyParent);
  
  // Watch for content changes
  const observer = new MutationObserver(notifyParent);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
</script>
```

---

### **Option 4: Use Confluence's Dynamic Height Feature**

Some Confluence versions support dynamic iframe height. Try:

```html
<iframe 
    src="YOUR_URL" 
    width="100%" 
    height="auto" 
    frameborder="0" 
    scrolling="yes"
    data-auto-height="true">
</iframe>
```

---

## 📏 **Recommended Settings by Context**

### **For Confluence Embedding:**
```html
<iframe 
    src="YOUR_URL" 
    width="100%" 
    height="2800px"     <!-- ✅ Increased from 2000px -->
    frameborder="0" 
    scrolling="yes"
    style="border: none;">
</iframe>
```

### **For Website Embedding:**
```html
<iframe 
    src="YOUR_URL" 
    width="100%" 
    style="height: 100vh; border: none;"   <!-- ✅ Full viewport height -->
    frameborder="0" 
    scrolling="yes">
</iframe>
```

### **For Full-Page Display:**
Just link directly:
```html
<a href="YOUR_URL" target="_blank">
  Launch Sales Prospecting Tool
</a>
```

---

## 🧪 **Testing Checklist**

Test these scenarios to ensure scroll compatibility:

### **1. Desktop (Wide Screen)**
- [ ] All form fields visible
- [ ] Generate button appears when selections made
- [ ] Infographic displays fully
- [ ] Email templates show completely
- [ ] All 10 brand recommendations visible
- [ ] No horizontal scrollbar
- [ ] Vertical scroll works smoothly

### **2. Tablet (768-1200px)**
- [ ] Grid collapses to 1 column
- [ ] All content still accessible
- [ ] Touch scrolling works

### **3. Mobile (<768px)**
- [ ] Single column layout
- [ ] Form inputs are tappable
- [ ] Text is readable without zoom
- [ ] Scrolling is smooth

### **4. In Confluence iframe**
- [ ] Tool loads completely
- [ ] No content cut off at bottom
- [ ] Scrolling works within iframe
- [ ] Generate button clickable
- [ ] Download button works

---

## 🔧 **Quick Fixes Applied**

I've updated the Confluence version (`sales-prospecting-tool-confluence.html`) with:

```css
body {
    overflow-y: auto; /* ✅ Added - ensures scrolling always works */
}
```

This ensures:
- ✅ Vertical scrolling is always enabled
- ✅ Content never gets hidden
- ✅ Works in all iframe contexts

---

## 📊 **Height Requirements**

| State | Approximate Height |
|-------|-------------------|
| Initial load (form only) | ~1,200px |
| After generating infographic | ~1,800px |
| With email templates visible | ~2,200px |
| With all content (brands + deals) | ~2,800-3,000px |
| **Recommended iframe height** | **3,100px** |

**Note:** Height increased to account for new "Relevant Deal IDs" section.

---

## 💡 **Best Practices**

### **For Standalone Pages:**
✅ Let content flow naturally (current setup is perfect)

### **For Confluence:**
✅ Use `height="2800px"` in your iframe
✅ Set `scrolling="yes"`
✅ Don't use `overflow: hidden` on parent containers

### **For Website Embeds:**
✅ Use viewport-relative heights (`100vh`)
✅ Or let users open in new tab for full experience

---

## 🚀 **Recommended Update**

**Update your Confluence embed code from:**
```html
height="2000px"  ❌ Cuts off content
```

**To:**
```html
height="2800px"  ✅ Shows all content
```

---

## 🆘 **Troubleshooting**

### **Issue: Bottom content is cut off**
**Solution:** Increase iframe `height` to `2800px`

### **Issue: Scrollbar appears but doesn't work**
**Solution:** Ensure `scrolling="yes"` on iframe

### **Issue: Double scrollbars (page + iframe)**
**Solution:** 
```html
<iframe 
    height="2800px"     <!-- Tall enough to show all content -->
    scrolling="no"      <!-- Disable iframe scroll -->
</iframe>
```
This makes the page scroll, not the iframe.

### **Issue: Content still hidden on mobile**
**Solution:** Tool is responsive, but ensure Confluence page itself is responsive

---

## ✅ **Summary**

**Current Tool Status:**
- ✅ Naturally scrollable
- ✅ Responsive layout
- ✅ No fixed positioning issues
- ⚠️ Needs taller iframe in Confluence (2800px recommended)

**Action Required:**
Update your Confluence iframe height from `2000px` → `2800px`

