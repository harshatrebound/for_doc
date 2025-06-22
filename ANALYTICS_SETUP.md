# Analytics Setup Guide

This project supports multiple approaches for adding tracking scripts like Google Analytics, Facebook Pixel, etc.

## 🎯 Approach 1: Environment Variables (Recommended)

### Setup Steps:

1. **Create your `.env` file** (copy from `.env.example`):
```bash
# Analytics Configuration
VITE_ENABLE_ANALYTICS=true

# Google Analytics 4
VITE_GA4_ID=G-XXXXXXXXXX

# Google Tag Manager
VITE_GTM_ID=GTM-XXXXXXX

# Facebook Pixel
VITE_FACEBOOK_PIXEL_ID=1234567890123456

# Google Search Console
VITE_GOOGLE_SITE_VERIFICATION=your-verification-code

# Microsoft Clarity
VITE_CLARITY_ID=xxxxxxxxx

# Hotjar
VITE_HOTJAR_ID=1234567

# LinkedIn Insight Tag
VITE_LINKEDIN_PARTNER_ID=12345
```

2. **The `Analytics` component is already included** in `src/App.tsx` and will automatically load these services when environment variables are provided.

### Supported Services:
- ✅ Google Analytics 4 (GA4)
- ✅ Google Tag Manager (GTM)
- ✅ Facebook Pixel
- ✅ Google Search Console verification
- ✅ Microsoft Clarity
- ✅ Hotjar
- ✅ LinkedIn Insight Tag

### Environment Control:
- **Production**: Analytics loads automatically when `NODE_ENV=production`
- **Development**: Set `VITE_ENABLE_ANALYTICS=true` to test analytics in dev mode

---

## 🔧 Approach 2: Custom HTML File (For Flexibility)

For additional scripts or easy modifications without code changes:

1. **Edit `/public/custom-analytics.html`**:
```html
<!-- Add any custom tracking scripts -->
<script>
  // Your custom analytics code here
  console.log('Custom analytics loaded');
</script>

<!-- Additional Facebook events -->
<script>
  fbq('track', 'ViewContent', {
    content_name: 'Team Building Services',
    content_category: 'Corporate Services'
  });
</script>
```

2. **Enable custom analytics**:
```bash
# In your .env file
VITE_ENABLE_CUSTOM_ANALYTICS=true
```

3. **The `CustomAnalytics` component** will automatically load and execute scripts from this file.

---

## 🚀 Quick Start Examples

### Google Analytics 4 Setup:
1. Get your GA4 Measurement ID from Google Analytics
2. Add to `.env`: `VITE_GA4_ID=G-XXXXXXXXXX`
3. Deploy! Analytics will automatically start tracking.

### Facebook Pixel Setup:
1. Get your Pixel ID from Facebook Business Manager
2. Add to `.env`: `VITE_FACEBOOK_PIXEL_ID=1234567890123456`
3. Deploy! Pixel will track PageView and can track custom events.

### Google Search Console:
1. Get verification code from Search Console
2. Add to `.env`: `VITE_GOOGLE_SITE_VERIFICATION=your-code`
3. The meta tag will be automatically added to all pages.

---

## 🛠 Advanced Configuration

### Adding New Tracking Services:
1. Edit `src/components/Analytics/index.tsx`
2. Add your service to `ANALYTICS_CONFIG`
3. Add the script template in the Helmet component

### Custom Event Tracking:
```typescript
// In any component
declare global {
  interface Window {
    gtag: any;
    fbq: any;
  }
}

// Track custom events
const trackConversion = () => {
  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
      value: 1.0,
      currency: 'USD'
    });
  }
  
  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'Lead');
  }
};
```

---

## 🔒 Privacy & Compliance

### GDPR Compliance:
- Analytics only loads when explicitly enabled
- Consider adding a cookie consent banner
- Scripts load asynchronously to not block page rendering

### Development vs Production:
- **Development**: Analytics disabled by default
- **Production**: Analytics enabled when environment variables are set
- Use `VITE_ENABLE_ANALYTICS=true` to test in development

---

## 📊 Monitoring & Debugging

### Check if Analytics is Working:
1. Open browser DevTools → Network tab
2. Look for requests to `google-analytics.com`, `facebook.com/tr`, etc.
3. Check browser console for any script loading errors

### Debug Mode:
```bash
# Enable debugging in development
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_ANALYTICS=true
```

---

## 🎨 Which Approach to Choose?

### Use **Environment Variables** when:
- ✅ You want type-safe, maintainable code
- ✅ You need different configs for staging/production
- ✅ You're using standard tracking services
- ✅ You want version control over analytics changes

### Use **Custom HTML File** when:
- ✅ You need to add scripts quickly without deployment
- ✅ You're testing multiple tracking services
- ✅ You need to add chat widgets, A/B testing tools, etc.
- ✅ Non-developers need to modify tracking codes

### Use **Both** for:
- 🚀 Maximum flexibility
- 🚀 Core analytics via environment variables
- 🚀 Additional/experimental scripts via HTML file

---

## 📝 Environment Variables Reference

Create a `.env` file in your project root:

```bash
# Required for Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Analytics Control
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CUSTOM_ANALYTICS=true

# Tracking IDs
VITE_GA4_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX
VITE_FACEBOOK_PIXEL_ID=1234567890123456
VITE_GOOGLE_SITE_VERIFICATION=verification-code
VITE_CLARITY_ID=clarity-id
VITE_HOTJAR_ID=hotjar-id
VITE_LINKEDIN_PARTNER_ID=linkedin-id
```

That's it! Your analytics tracking is now set up and ready to go! 🎉 