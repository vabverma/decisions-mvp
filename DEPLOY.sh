#!/bin/bash

# DECISIONS MVP - Automated Deployment Script
# This script sets up your production environment on Render

set -e

echo "🚀 DECISIONS MVP - Render Deployment Automation"
echo "================================================="
echo ""

# Check if required tools are installed
check_tools() {
  echo "📋 Checking required tools..."

  if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
  fi

  if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
  fi

  echo "✅ Git and npm found"
}

# Build the backend
build_backend() {
  echo ""
  echo "🔨 Building backend..."
  cd decisions-backend
  npm install
  npm run build
  cd ..
  echo "✅ Backend built successfully"
}

# Build the frontend
build_frontend() {
  echo ""
  echo "🔨 Building frontend..."
  cd decisions-frontend
  npm install
  npm run build
  cd ..
  echo "✅ Frontend built successfully"
}

# Generate JWT secret
generate_jwt() {
  echo ""
  echo "🔐 Generating JWT secret..."
  JWT_SECRET=$(openssl rand -base64 32)
  echo "✅ JWT Secret: $JWT_SECRET"
  echo ""
  echo "💾 Save this JWT secret - you'll need it for Render environment variables!"
  echo ""
}

# Create environment file template
create_env_template() {
  echo ""
  echo "📝 Creating environment variable template..."

  cat > RENDER_ENV_TEMPLATE.txt << 'EOF'
# Production Environment Variables for Render
# Copy these to Render dashboard -> Environment

NODE_ENV=production
PORT=3000

# Database (provided by Render PostgreSQL)
DATABASE_URL=[Will be auto-filled by Render]

# Authentication
JWT_SECRET=USE_THE_GENERATED_SECRET_ABOVE

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51U7g1P5Dli3bzgh25Yp3kpBaDnCAkZcMMKMPeJp8gO6R0Y8AJMNHEX9LxwzgWjl9t7ssRy41OHs0zBI6YKlMp1ig00BnGR2dF2
STRIPE_PUBLISHABLE_KEY=pk_test_51U7g1P5Dli3bzgh2FWIRGIehQfxAbmnuJ58cDmMHMrFcY9cM9WltDF4KQcXybWjEz8C8KoSmzRUyP0IXpmY3AlOw00fLEJoOzi
STRIPE_WEBHOOK_SECRET=whsec_test_local
STRIPE_STARTER_PRICE_ID=price_1U7o4h5Dli3bzgh2V5XumvgX
STRIPE_PRO_PRICE_ID=price_1U7o4i5Dli3bzgh2FfKW3Oh1

# APIs
ANTHROPIC_API_KEY=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
SENDGRID_API_KEY=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
SENTRY_DSN=https://b4cdab1a3cf064303baf625e0f426402@o4511961647546368.ingest.us.sentry.io/4511961667403776

# App URLs (set by Render)
APP_URL=[Render backend URL]
DASHBOARD_URL=[Render frontend URL]

# Feature flags
USE_CLAUDE_API=false
EOF

  echo "✅ Environment template created: RENDER_ENV_TEMPLATE.txt"
}

# Commit changes
commit_changes() {
  echo ""
  echo "📦 Committing deployment files..."
  git add -A
  git commit -m "chore: production build and deployment automation" || true
  echo "✅ Changes committed"
}

# Main execution
main() {
  check_tools
  build_backend
  build_frontend
  generate_jwt
  create_env_template
  commit_changes

  echo ""
  echo "============================================="
  echo "✅ BUILD COMPLETE - READY FOR RENDER DEPLOYMENT"
  echo "============================================="
  echo ""
  echo "📋 NEXT STEPS:"
  echo ""
  echo "1️⃣  Sign up at https://render.com (use GitHub)"
  echo ""
  echo "2️⃣  Create Backend Service:"
  echo "    - Click 'New +' → 'Web Service'"
  echo "    - Connect this GitHub repo"
  echo "    - Root Dir: decisions-backend"
  echo "    - Build: npm install && npm run build"
  echo "    - Start: npm start"
  echo "    - Plan: Free"
  echo ""
  echo "3️⃣  Create PostgreSQL Database:"
  echo "    - Click 'New +' → 'PostgreSQL'"
  echo "    - Name: decisions-db"
  echo "    - Region: Oregon"
  echo "    - Plan: Free"
  echo ""
  echo "4️⃣  Add Environment Variables (to Backend):"
  echo "    - Copy from RENDER_ENV_TEMPLATE.txt"
  echo "    - Replace DATABASE_URL with PostgreSQL internal URL"
  echo "    - Replace APP_URL/DASHBOARD_URL with actual URLs"
  echo ""
  echo "5️⃣  Create Frontend Service:"
  echo "    - Click 'New +' → 'Web Service'"
  echo "    - Connect this GitHub repo"
  echo "    - Root Dir: decisions-frontend"
  echo "    - Build: npm install && npm run build"
  echo "    - Start: npm run preview"
  echo "    - Plan: Free"
  echo ""
  echo "6️⃣  Test Deployment:"
  echo "    - Visit frontend URL in browser"
  echo "    - Login, test pricing page"
  echo "    - Click Subscribe to test Stripe"
  echo ""
  echo "⏱️  Total deployment time: ~20-30 minutes"
  echo ""
}

main
