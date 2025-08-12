# Deployment Checklist for shorajtomer.me

## Pre-Deployment Setup

### ✅ 1. Environment Variables
Set these environment variables in Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://shorajtomer.me
NEXTAUTH_URL=https://shorajtomer.me
NEXTAUTH_SECRET=your_secure_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Admin
ADMIN_EMAILS=shoraj@shorajtomer.me

# Production
NODE_ENV=production
```

### ✅ 2. Supabase Configuration

#### Database Schema
1. Go to Supabase SQL Editor
2. Run the complete schema from `DEPLOYMENT.md`
3. Verify all tables are created with proper RLS policies

#### Authentication Settings
1. Go to Authentication > Settings
2. Set Site URL: `https://shorajtomer.me`
3. Add Redirect URLs:
   - `https://shorajtomer.me/auth/callback`
   - `https://shorajtomer.me/**`

### ✅ 3. Stripe Configuration

#### Webhook Setup
1. Go to Stripe Dashboard > Webhooks
2. Create endpoint: `https://shorajtomer.me/api/webhooks/stripe`
3. Add events:
   - `checkout.session.completed`
   - `payment_intent.succeeded` 
   - `payment_intent.payment_failed`
4. Copy webhook secret to environment variables

#### Products Setup
Create your courses and workshops as products in Stripe dashboard.

### ✅ 4. Vercel Deployment

#### Initial Setup
1. Connect GitHub repository to Vercel
2. Import project: `shorajtomer/shorajtomer.me`
3. Set environment variables
4. Deploy!

#### Domain Configuration
1. Go to Vercel Dashboard > Domains
2. Add domain: `shorajtomer.me`
3. Configure DNS records at your domain registrar:

```
Type: A
Name: @
Value: 76.76.19.61 (check Vercel for current IP)

Type: CNAME
Name: www  
Value: cname.vercel-dns.com
```

4. Verify domain ownership
5. Wait for propagation (up to 48 hours)

## Post-Deployment Verification

### ✅ 1. Site Functionality
- [ ] Homepage loads at https://shorajtomer.me
- [ ] All public pages are accessible
- [ ] Authentication works (signin/signup)
- [ ] Admin panel accessible with admin email
- [ ] Stripe checkout flow works
- [ ] Webhooks receive events

### ✅ 2. Performance Checks
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals are good
- [ ] Images load properly
- [ ] No console errors

### ✅ 3. SEO & Meta Tags
- [ ] Proper meta descriptions
- [ ] Open Graph tags
- [ ] Twitter Card tags
- [ ] Sitemap accessible
- [ ] Robots.txt configured

### ✅ 4. Security Headers
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Security headers configured
- [ ] Content Security Policy
- [ ] No exposed secrets

## Ongoing Maintenance

### Weekly Tasks
- [ ] Monitor Vercel deployment logs
- [ ] Check Supabase usage metrics
- [ ] Review Stripe webhook logs
- [ ] Monitor site performance

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review security settings
- [ ] Backup database
- [ ] Analyze site metrics

## Troubleshooting

### Common Issues

**Domain not resolving:**
- Check DNS configuration
- Wait for propagation (up to 48 hours)
- Verify A and CNAME records

**Authentication errors:**
- Check Supabase redirect URLs
- Verify environment variables
- Check NEXTAUTH_URL setting

**Stripe webhook failures:**
- Verify webhook URL is correct
- Check webhook secret matches
- Review Stripe webhook logs

**Build failures:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs in Vercel

## Support Contacts

- **Vercel Support:** https://vercel.com/support
- **Supabase Support:** https://supabase.com/support  
- **Stripe Support:** https://support.stripe.com

## Production URLs

- **Main Site:** https://shorajtomer.me
- **Admin Panel:** https://shorajtomer.me/admin
- **API Endpoints:** https://shorajtomer.me/api/*
- **Stripe Webhook:** https://shorajtomer.me/api/webhooks/stripe

---

✅ **Deployment Complete!** Your portfolio is now live at https://shorajtomer.me