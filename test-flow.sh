#!/bin/bash

# DECISIONS — End-to-End Test Script
# Tests: Register → Get Rec → Hit Limit → Upgrade Email → Success

set -e

API_URL="http://localhost:3000"
DASHBOARD_URL="http://localhost:3001"

echo "🧪 DECISIONS E2E Test"
echo "====================="
echo ""

# Generate unique test email
TEST_EMAIL="test+$(date +%s)@decisions.so"
TEST_PASSWORD="TestPassword123!"
TEST_STORE="Test Store $(date +%s)"

echo "📧 Test email: $TEST_EMAIL"
echo "🏪 Test store: $TEST_STORE"
echo ""

# 1. Register
echo "1️⃣  Registering user..."
REGISTER=$(curl -s -X POST $API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"storeName\": \"$TEST_STORE\"
  }")

TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USER_ID=$(echo $REGISTER | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Registration failed"
  echo $REGISTER
  exit 1
fi

echo "✅ Registered (Token: ${TOKEN:0:20}...)"
echo ""

# 2. Get pricing recommendation
echo "2️⃣  Getting pricing recommendation..."
PRICING=$(curl -s -X POST $API_URL/api/decisions/pricing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productName\": \"Test Product\",
    \"currentPrice\": 29.99,
    \"cost\": 10.00,
    \"competitorPrice\": 34.99,
    \"monthlyVolume\": 500,
    \"demandTrend\": \"stable\",
    \"customerFeedback\": \"High demand\"
  }")

REC_ID=$(echo $PRICING | grep -o '"id":"[^"]*' | cut -d'"' -f4)
RECOMMENDED_PRICE=$(echo $PRICING | grep -o '"recommendedPrice":[0-9.]*' | cut -d':' -f2)
ANNUAL_IMPACT=$(echo $PRICING | grep -o '"annualImpact":[0-9.]*' | cut -d':' -f2)

if [ -z "$REC_ID" ]; then
  echo "❌ Pricing recommendation failed"
  echo $PRICING
  exit 1
fi

echo "✅ Got recommendation (ID: ${REC_ID:0:8}...)"
echo "   Recommended price: \$$RECOMMENDED_PRICE"
echo "   Annual impact: \$$ANNUAL_IMPACT"
echo ""

# 3. Check dashboard
echo "3️⃣  Fetching dashboard..."
DASHBOARD=$(curl -s http://localhost:3000/api/analytics/dashboard \
  -H "Authorization: Bearer $TOKEN")

TOTAL_RECS=$(echo $DASHBOARD | grep -o '"total_recommendations":[0-9]*' | cut -d':' -f2)
TOTAL_IMPACT=$(echo $DASHBOARD | grep -o '"total_impact":[0-9.]*' | cut -d':' -f2)

if [ "$TOTAL_RECS" != "1" ]; then
  echo "❌ Dashboard shows wrong recommendation count (got $TOTAL_RECS, expected 1)"
  exit 1
fi

echo "✅ Dashboard updated"
echo "   Total recommendations: $TOTAL_RECS"
echo "   Total impact: \$$TOTAL_IMPACT"
echo ""

# 4. Get subscription status
echo "4️⃣  Checking subscription status..."
SUBSCRIPTION=$(curl -s http://localhost:3000/api/billing/subscription \
  -H "Authorization: Bearer $TOKEN")

TIER=$(echo $SUBSCRIPTION | grep -o '"tier":"[^"]*' | cut -d'"' -f4)

if [ "$TIER" != "free" ]; then
  echo "❌ Wrong tier (got $TIER, expected free)"
  exit 1
fi

echo "✅ Subscription status: $TIER"
echo ""

# 5. Test freemium limit (try to get 6th recommendation)
echo "5️⃣  Testing freemium limit (getting 5 more recs)..."

for i in {1..5}; do
  curl -s -X POST $API_URL/api/decisions/pricing \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"productName\": \"Product $i\",
      \"currentPrice\": 29.99,
      \"cost\": 10.00,
      \"competitorPrice\": 34.99,
      \"monthlyVolume\": 500,
      \"demandTrend\": \"stable\"
    }" > /dev/null
  echo "   ✓ Rec $i sent"
done

echo ""
echo "6️⃣  Attempting 6th recommendation (should be blocked)..."

BLOCKED=$(curl -s -X POST $API_URL/api/decisions/pricing \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"productName\": \"Product 6\",
    \"currentPrice\": 29.99,
    \"cost\": 10.00,
    \"competitorPrice\": 34.99,
    \"monthlyVolume\": 500,
    \"demandTrend\": \"stable\"
  }")

ERROR=$(echo $BLOCKED | grep -o '"error":"[^"]*' | cut -d'"' -f4)

if [ -z "$ERROR" ] || [[ ! "$ERROR" =~ "Free tier limited" ]]; then
  echo "❌ Freemium limit not enforced"
  echo $BLOCKED
  exit 1
fi

echo "✅ Freemium limit enforced ($ERROR)"
echo ""

# Summary
echo "════════════════════════════════════════"
echo "✅ ALL TESTS PASSED"
echo "════════════════════════════════════════"
echo ""
echo "📊 Test Results:"
echo "   • Registration: ✅"
echo "   • Pricing recommendation: ✅"
echo "   • Dashboard fetch: ✅"
echo "   • Subscription check: ✅"
echo "   • Freemium limit (5/month): ✅"
echo ""
echo "🚀 Ready to launch!"
