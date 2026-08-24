#!/bin/bash

# DECISIONS — Quick Local Setup Script
# Run this once to set up everything locally

set -e

echo "⚡ DECISIONS Setup"
echo "=================="

# Check prerequisites
echo "✓ Checking prerequisites..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org/"
  exit 1
fi
if ! command -v psql &> /dev/null; then
  echo "⚠️  PostgreSQL not found locally. Docker will be used."
  DOCKER_NEEDED=true
fi

# Create .env files
echo "✓ Creating environment files..."

cat > decisions-backend/.env << EOF
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/decisions

# Claude API
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE

# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# JWT
JWT_SECRET=$(openssl rand -base64 32)

# App
APP_URL=http://localhost:3000
DASHBOARD_URL=http://localhost:3001
EOF

echo "   Created decisions-backend/.env"
echo "   ⚠️  Add your ANTHROPIC_API_KEY and STRIPE keys to this file"

# Backend setup
echo ""
echo "✓ Setting up backend..."
cd decisions-backend
npm install > /dev/null 2>&1
echo "   Installed dependencies"
cd ..

# Frontend setup
echo "✓ Setting up frontend..."
cd decisions-frontend
npm install > /dev/null 2>&1
echo "   Installed dependencies"
cd ..

# Database setup
if [ "$DOCKER_NEEDED" = true ]; then
  echo ""
  echo "✓ Starting PostgreSQL with Docker..."
  docker run -d \
    --name decisions-postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=decisions \
    -p 5432:5432 \
    postgres:15 > /dev/null 2>&1
  echo "   PostgreSQL running on port 5432"
  sleep 3
fi

# Create database
echo "✓ Initializing database..."
cd decisions-backend
npm run migrate > /dev/null 2>&1
echo "   Database schema initialized"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit decisions-backend/.env and add:"
echo "   - ANTHROPIC_API_KEY (from https://console.anthropic.com)"
echo "   - STRIPE_SECRET_KEY & STRIPE_PUBLISHABLE_KEY (from https://dashboard.stripe.com)"
echo ""
echo "2. Start backend:"
echo "   cd decisions-backend && npm run dev"
echo ""
echo "3. Start frontend (new terminal):"
echo "   cd decisions-frontend && npm run dev"
echo ""
echo "4. Open http://localhost:3001"
echo ""
echo "To stop PostgreSQL: docker stop decisions-postgres"
