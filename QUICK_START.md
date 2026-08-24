# ⚡ DECISIONS Quick Start (5 minutes)

## 1. Prerequisites

- Node.js 18+ ([install](https://nodejs.org/))
- Docker ([install](https://docker.com/)) — for PostgreSQL
- Anthropic API key ([get one](https://console.anthropic.com/account/keys))
- Stripe test keys ([get them](https://dashboard.stripe.com/test/keys))

## 2. Automated Setup (2 min)

```bash
# Make script executable
chmod +x setup.sh

# Run setup
./setup.sh

# Edit environment file with your API keys
nano decisions-backend/.env

# Add:
# ANTHROPIC_API_KEY=sk-ant-YOUR_KEY
# STRIPE_SECRET_KEY=sk_test_YOUR_KEY
```

## 3. Start Backend (1 min)

```bash
cd decisions-backend
npm run dev
```

You'll see:
```
🚀 DECISIONS API running on port 3000
✅ Database initialized
```

## 4. Start Frontend (new terminal, 1 min)

```bash
cd decisions-frontend
npm run dev
```

You'll see:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://localhost:3001/
```

## 5. Test It (1 min)

1. Open http://localhost:3001
2. Click "Sign up"
3. Enter any email/password
4. Click "Get Recommendation"
5. Fill in product data:
   - Product Name: "Test"
   - Current Price: $29.99
   - Cost: $10
   - Competitor Price: $34.99
   - Volume: 500
6. Click "✨ Get Recommendation"
7. Wait 2-3 seconds → See Claude recommendation!

## 6. Test Freemium Limit

Try getting another recommendation → Error: "Free tier limited to 1 recommendation per month"

Perfect! It's working. 🎉

## Next Steps

- **Deploy**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Develop**: See [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Test**: See [TESTING.md](./TESTING.md)
- **Launch**: See [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)

## Troubleshooting

### PostgreSQL connection error
```bash
# Check Docker
docker ps | grep postgres

# If not running:
docker run -d --name decisions-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=decisions \
  -p 5432:5432 \
  postgres:15
```

### Claude API error
- Check ANTHROPIC_API_KEY is valid
- Get key from https://console.anthropic.com/account/keys

### Port already in use
```bash
# Change port in backend .env: PORT=3001
# Change port in frontend vite.config.ts: port: 3002
```

## What's Running

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3001 | 3001 |
| Backend API | http://localhost:3000 | 3000 |
| PostgreSQL | postgresql://localhost:5432 | 5432 |

## Stop Services

```bash
# Stop backend: Ctrl+C
# Stop frontend: Ctrl+C
# Stop PostgreSQL: docker stop decisions-postgres
```

---

**You're all set!** The MVP is running. Now go build something amazing. 🚀
