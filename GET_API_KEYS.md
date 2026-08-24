# 🔑 Get Your API Keys (30 minutes)

You need 3 API keys. Copy them when done — you'll paste them into `.env` file.

---

## 1️⃣ Stripe (10 min)

### Get Stripe Test Keys
1. Go to **https://dashboard.stripe.com/test/keys**
2. You'll see:
   - **Secret key** (starts with `sk_test_`)
   - **Publishable key** (starts with `pk_test_`)
3. Copy both

### Create Stripe Products
1. Go to **https://dashboard.stripe.com/test/products**
2. Click **+ Create product**
3. **First product:**
   - Name: `Pricing Optimizer`
   - Price: `99` (dollars)
   - Billing period: Monthly
   - **Copy the Price ID** (starts with `price_`)
4. **Second product:**
   - Name: `Premium`
   - Price: `299` (dollars)
   - Billing period: Monthly
   - **Copy the Price ID**

### Get Webhook Secret
1. Go to **https://dashboard.stripe.com/test/webhooks**
2. Click **Add endpoint**
3. URL: `https://your-backend.railway.app/api/webhooks/stripe` (we'll fill this in after deploying)
4. Events: Select `customer.subscription.updated`, `customer.subscription.deleted`, `charge.succeeded`, `charge.failed`
5. **Copy the Signing secret** (starts with `whsec_`)

**Stripe keys to save:**
```
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_PRICING_OPTIMIZER_PRICE_ID=price_xxx
STRIPE_PREMIUM_PRICE_ID=price_yyy
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 2️⃣ SendGrid (10 min)

### Create SendGrid Account
1. Go to **https://sendgrid.com/free**
2. Sign up (free tier is fine)
3. Verify your email

### Get API Key
1. Go to **https://app.sendgrid.com/settings/api_keys**
2. Click **Create API Key**
3. Name: `DECISIONS`
4. Permissions: Full Access
5. **Copy the key** (starts with `SG.`)

**SendGrid key to save:**
```
SENDGRID_API_KEY=SG.xxx
```

---

## 3️⃣ Sentry (10 min)

### Create Sentry Account
1. Go to **https://sentry.io/auth/login/**
2. Click **Sign Up** (free tier is fine)
3. Create team/project

### Create Node.js Project
1. New Project → Select **Node.js**
2. Name: `DECISIONS`
3. **Copy the DSN** (looks like `https://key@sentry.io/project_id`)

**Sentry key to save:**
```
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## ✅ You Now Have All Keys

Paste them into `decisions-backend/.env`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_PRICING_OPTIMIZER_PRICE_ID=price_xxx
STRIPE_PREMIUM_PRICE_ID=price_yyy
STRIPE_WEBHOOK_SECRET=whsec_xxx

# SendGrid
SENDGRID_API_KEY=SG.xxx

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
```

Then run:
```bash
cd decisions-backend
npm install
npm run dev
```

**Done!** Ready for local testing.
