# DECISIONS Deployment Guide

## Architecture

```
┌─────────────────┐
│   Frontend      │ (React SPA on Vercel/Netlify)
│ localhost:3001  │
└────────┬────────┘
         │
         │ /api → proxy
         ↓
┌─────────────────────┐
│  Backend (Express)  │ (Node.js on Railway/Render)
│  localhost:3000     │
└────────┬────────────┘
         │
         ├─→ PostgreSQL (Railway/Render)
         ├─→ Claude API
         ├─→ Stripe
         └─→ n8n webhooks
```

## Step 1: Deploy Backend

### Option A: Railway (Recommended)

1. **Create Railway account** at railway.app
2. **Connect GitHub**
3. **Create new project** → Select `decisions-backend` directory
4. **Add PostgreSQL plugin**
5. **Set environment variables** in Railway:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   STRIPE_SECRET_KEY=sk_test_...
   JWT_SECRET=random-secret-here
   DATABASE_URL=<auto-set by Railway>
   PORT=3000
   ```
6. **Deploy** — Railway auto-deploys on git push

### Option B: Render

1. **Create Render account** at render.com
2. **Create new Web Service**
3. **Select GitHub repo** (decisions-backend)
4. **Build command**: `npm install && npm run build`
5. **Start command**: `npm start`
6. **Add PostgreSQL database**
7. **Set environment variables**
8. **Deploy**

### Option C: Self-hosted (DigitalOcean, AWS, etc.)

```bash
# SSH into server
ssh root@your-server.com

# Install Node, PostgreSQL
curl -sL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs postgresql

# Clone repo
git clone https://github.com/yourusername/decisions.git
cd decisions/decisions-backend

# Install & build
npm install
npm run build

# Set environment variables
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npm run migrate

# Start with PM2
npm install -g pm2
pm2 start dist/index.js --name decisions
pm2 startup
pm2 save
```

## Step 2: Deploy Frontend

### Option A: Vercel (Recommended)

1. **Create Vercel account** at vercel.com
2. **Import GitHub project** (decisions-frontend)
3. **Set build settings**:
   - Build command: `npm run build`
   - Output directory: `dist`
4. **Environment variables**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
5. **Deploy**

### Option B: Netlify

1. **Connect GitHub** at netlify.com
2. **Configure build**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Set environment variable**: `VITE_API_URL=https://your-backend.railway.app`
4. **Deploy**

### Option C: Static hosting (AWS S3, Cloudflare Pages)

```bash
# Build
npm run build

# Upload dist/ folder to S3/CloudFlare
# Configure redirect rules: all paths → index.html
```

## Step 3: Setup Stripe

1. **Get Stripe API keys** at dashboard.stripe.com
2. **Add webhook endpoint**:
   - URL: `https://your-backend.railway.app/api/webhooks/stripe`
   - Events: `customer.subscription.*`, `charge.succeeded`
3. **Test with Stripe CLI**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   stripe trigger customer.subscription.updated
   ```

## Step 4: Setup Email (Optional but Recommended)

1. **SendGrid** or **Resend** for transactional emails
2. **Add API key** to backend environment
3. **Send welcome email** on registration
4. **Send upgrade prompts** when free tier limit reached

## Step 5: Setup Analytics

1. **Plausible.io** or **PostHog** for product analytics
2. **Add tracking script** to frontend
3. **Monitor**:
   - New signups
   - Recommendation conversion rate
   - Upgrade rate (free → paid)
   - Retention

## Environment Variables Checklist

### Backend
- [ ] `DATABASE_URL` — PostgreSQL connection
- [ ] `ANTHROPIC_API_KEY` — Claude API key
- [ ] `STRIPE_SECRET_KEY` — Stripe secret
- [ ] `JWT_SECRET` — Random 32+ char string
- [ ] `NODE_ENV` — "production"
- [ ] `PORT` — 3000 (or auto-assigned)

### Frontend
- [ ] `VITE_API_URL` — Backend URL (production)

## Monitoring

1. **Error tracking**: Sentry
   ```bash
   npm install --save @sentry/react
   # Add Sentry token to .env
   ```

2. **Performance**: 
   - Railway/Render built-in metrics
   - Vercel Analytics for frontend

3. **Database**:
   - Railway/Render postgres monitoring
   - Set up automatic backups

## Testing Production

1. **Test registration**: Create account with test email
2. **Get recommendation**: Submit product data, verify Claude API call
3. **Test Stripe**: Use Stripe test card `4242 4242 4242 4242`
4. **Test integrations**: Connect Shopify (sandbox store), n8n, Plausible

## Post-Launch Checklist

- [ ] SSL certificate (auto-configured on Vercel/Railway)
- [ ] Domain name pointed to frontend
- [ ] Email verification working
- [ ] Stripe webhooks receiving events
- [ ] Database backups configured
- [ ] Error tracking (Sentry) configured
- [ ] Analytics (Plausible) configured
- [ ] Rate limiting on API
- [ ] CORS properly configured for production domain

## Scaling

### When usage increases:

1. **Database**: Upgrade PostgreSQL tier
2. **Backend**: Increase dyno/container size or add horizontal scaling
3. **Frontend**: Already globally distributed via Vercel/Netlify
4. **Claude API**: Ensure rate limits sufficient (add queue if needed)
5. **Stripe**: No changes needed

## Cost Estimate (Year 1)

- **Railway PostgreSQL**: $15/month
- **Railway Node backend**: $7/month
- **Vercel frontend**: Free (or $20/month pro)
- **Stripe**: 2.9% + $0.30 per transaction
- **Claude API**: ~$0.01-0.10 per recommendation
- **SendGrid email**: Free tier (or ~$20/month)
- **Sentry monitoring**: Free tier (or ~$29/month pro)

**Total**: ~$60-150/month infrastructure
