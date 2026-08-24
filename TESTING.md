# DECISIONS Testing Guide

## Local Testing

### 1. Setup

```bash
# Run setup script
chmod +x setup.sh
./setup.sh

# Update .env with your API keys
# ANTHROPIC_API_KEY=sk-ant-...
# STRIPE_SECRET_KEY=sk_test_...

# Start backend (terminal 1)
cd decisions-backend
npm run dev

# Start frontend (terminal 2)
cd decisions-frontend
npm run dev
```

### 2. Test Registration Flow

1. Go to http://localhost:3001
2. Click "Sign up"
3. Enter:
   - Store Name: "Test Store"
   - Email: "test@example.com"
   - Password: "password123"
4. ✅ Should see dashboard
5. Check backend logs: "Welcome email sent"

### 3. Test Pricing Recommendation

1. From dashboard, click "Get Recommendation"
2. Fill form:
   - Product Name: "Blue Widget"
   - Current Price: $29.99
   - Cost: $10.00
   - Competitor Price: $34.99
   - Monthly Volume: 500
   - Demand: Stable
   - Feedback: "Customers want premium option"
3. Click "Get Recommendation"
4. ✅ Should see Claude recommendation in 2-3 seconds
5. Should show:
   - Recommended price
   - Strategy explanation
   - Projected margin, revenue, volume change
   - Annual impact ($$$)

### 4. Test Dashboard

1. Click "Dashboard"
2. ✅ Should show:
   - 1 total recommendation
   - 0 implemented
   - Annual impact ($)
   - Recent recommendations table

### 5. Test Freemium Limit

1. Get another recommendation
2. ✅ Should get error: "Free tier limited to 1 recommendation per month"
3. Should see upgrade CTA

### 6. Test Login/Logout

1. Click Logout
2. ✅ Redirected to login
3. Enter email/password
4. ✅ Back to dashboard

## API Testing (Curl/Postman)

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "storeName": "Test Store"
  }'

# Response:
# {"user": {"id": "...", "email": "...", "subscription_tier": "free"}, "token": "..."}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Pricing Recommendation

```bash
curl -X POST http://localhost:3000/api/decisions/pricing \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Blue Widget",
    "currentPrice": 29.99,
    "cost": 10.00,
    "competitorPrice": 34.99,
    "monthlyVolume": 500,
    "demandTrend": "stable",
    "customerFeedback": "Premium quality"
  }'

# Should return in 2-3 seconds:
# {
#   "id": "...",
#   "productId": "...",
#   "recommendedPrice": 32.99,
#   "reasoning": "...",
#   "projectedMargin": 45.2,
#   "projectedMonthlyRevenue": 16495,
#   "priceChange": 10.0,
#   "projectedVolumeChange": -5.0,
#   "annualImpact": 35940
# }
```

### Get Dashboard

```bash
curl http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return:
# {
#   "stats": {
#     "total_recommendations": 1,
#     "implemented": 0,
#     "avg_annual_impact": 35940,
#     "total_impact": 35940
#   },
#   "recentRecommendations": [...],
#   "subscriptionTier": "free"
# }
```

## Stripe Testing

### Get Stripe Test Keys

1. Go to https://dashboard.stripe.com/test/keys
2. Copy "Secret key" and "Publishable key"
3. Use test card: **4242 4242 4242 4242** (expires: any future date, CVC: any 3 digits)

### Test Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Listen for webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# In another terminal, trigger test event
stripe trigger customer.subscription.updated

# Check backend logs for webhook processing
```

## Edge Cases to Test

### 1. Invalid Input
```bash
# Missing required field
curl -X POST http://localhost:3000/api/decisions/pricing \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productName": ""}' 
# Should return 400 error
```

### 2. Unauthorized Access
```bash
# No token
curl http://localhost:3000/api/analytics/dashboard
# Should return 401
```

### 3. Database Errors
```bash
# Invalid UUID
curl http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer invalid-token"
# Should return 401
```

### 4. Claude API Failure
```bash
# Set ANTHROPIC_API_KEY to invalid key
# Try getting recommendation
# Should return user-friendly error message
```

## Performance Testing

### Load test (optional)

```bash
# Install Apache Bench
brew install httpd

# Test dashboard endpoint
ab -n 100 -c 10 -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/analytics/dashboard

# Should handle 100 requests with <500ms avg response time
```

## Database Inspection

### Connect to local PostgreSQL

```bash
psql postgresql://postgres:postgres@localhost:5432/decisions

# List tables
\dt

# Check users table
SELECT id, email, subscription_tier, created_at FROM users;

# Check recommendations
SELECT * FROM recommendations;

# Check usage tracking
SELECT * FROM usage_tracking;
```

## Browser DevTools Testing

### Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Should be no errors or warnings

### Network Requests
1. Go to Network tab
2. Trigger recommendation
3. Should see:
   - POST /api/decisions/pricing (200 OK)
   - Response time 2-3 seconds
   - Payload size ~1KB

### Local Storage
1. Application tab → Local Storage
2. Should contain JWT token
3. Token should be valid JWT (3 parts separated by dots)

## Success Criteria

- [x] Registration creates account and Stripe customer
- [x] Login returns valid JWT token
- [x] Pricing recommendation returns Claude response in <5 seconds
- [x] Dashboard shows accurate stats
- [x] Freemium limit enforced (1 rec/month)
- [x] Integrations page loads without errors
- [x] No console errors in browser
- [x] No 500 errors in backend
- [x] Database queries execute correctly

## Troubleshooting

### "Database connection refused"
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# If not, start it
docker run -d --name decisions-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=decisions \
  -p 5432:5432 \
  postgres:15
```

### "Claude API key invalid"
- Check .env has correct ANTHROPIC_API_KEY
- Get key from https://console.anthropic.com/account/keys

### "Stripe key invalid"
- Use test keys (sk_test_..., not sk_live_...)
- Get from https://dashboard.stripe.com/test/keys

### "CORS errors"
- Backend CORS is configured for localhost:3001
- Check vite.config.ts proxy is set correctly

### "Token invalid"
- Token expires after 7 days (configurable in code)
- Log out and back in to get new token

## Manual Regression Tests

### Before each deploy:

1. Register new account
2. Get pricing recommendation
3. See freemium limit
4. Upgrade to paid (test Stripe)
5. Get unlimited recommendations
6. Login/logout
7. Check dashboard metrics
8. Test each integration wizard

✅ If all pass, safe to deploy!
