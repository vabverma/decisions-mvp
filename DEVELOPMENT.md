# DECISIONS Development Guide

## Project Structure

```
decisions/
├── decisions-backend/          # Express API
│   ├── src/
│   │   ├── index.ts           # Server entry
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic (Claude, integrations)
│   │   ├── db/               # Database (schema, init)
│   │   └── middleware/       # Auth, error handling
│   ├── dist/                 # Compiled JS
│   └── package.json
│
├── decisions-frontend/         # React dashboard
│   ├── src/
│   │   ├── pages/            # Route components
│   │   ├── components/       # Reusable components
│   │   ├── App.tsx           # Router setup
│   │   └── index.css         # Styles
│   ├── dist/                 # Built SPA
│   └── package.json
│
├── DEPLOYMENT.md             # Production deployment
└── DEVELOPMENT.md            # This file
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 13+ (local or Docker)
- Anthropic API key
- Stripe test keys

### Quick Setup

```bash
# 1. Start PostgreSQL
# Option A: Using Docker
docker run -d \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=decisions \
  -p 5432:5432 \
  postgres:15

# Option B: Using Homebrew (Mac)
brew services start postgresql

# 2. Backend setup
cd decisions-backend
cp .env.example .env
npm install
# Edit .env with:
#   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/decisions
#   ANTHROPIC_API_KEY=sk-ant-...
#   STRIPE_SECRET_KEY=sk_test_...
npm run dev
# Runs on http://localhost:3000

# 3. Frontend setup (new terminal)
cd decisions-frontend
npm install
npm run dev
# Runs on http://localhost:3001
```

## Development Workflow

### Adding a new feature

1. **Create backend endpoint**
   ```typescript
   // decisions-backend/src/routes/myfeature.ts
   router.post('/myfeature', verifyToken, async (req, res) => {
     // Implementation
   });
   ```

2. **Add database tables/migrations** if needed
   ```sql
   -- decisions-backend/src/db/schema.sql
   ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
   ```

3. **Create frontend page**
   ```typescript
   // decisions-frontend/src/pages/MyFeature.tsx
   export default function MyFeature({ token }: Props) {
     // Implementation
   }
   ```

4. **Add route in App.tsx**
   ```typescript
   <Route path="/myfeature" element={<MyFeature token={token} />} />
   ```

### Code style

- Use TypeScript strict mode
- Keep functions under 50 lines
- Name exports clearly
- No console.logs in production code
- Error messages should be user-friendly

### Testing

```bash
# Backend tests
cd decisions-backend
npm run test

# Frontend
# No automated tests yet — manually test in browser
```

## Common Tasks

### Add a new subscription tier

1. **Database**: Add to `users.subscription_tier` enum
2. **Backend**: Update `decisions.ts` to check tier
3. **Frontend**: Show in dashboard (integrations.tsx)
4. **Stripe**: Create new product + price

### Connect a new integration

1. **Create integration route**: `decisions-backend/src/routes/integrations.ts`
2. **Test connection** with real API (Shopify, etc.)
3. **Store credentials securely** (encrypted in DB)
4. **Add UI** to `decisions-frontend/src/pages/Integrations.tsx`

### Update Claude prompt

Edit `decisions-backend/src/services/claude.service.ts`:
```typescript
const prompt = `Your new prompt here...`
```

Test with:
```bash
curl -X POST http://localhost:3000/api/decisions/pricing \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "Test Product",
    "currentPrice": 29.99,
    "cost": 10.00,
    ...
  }'
```

## API Development Tips

### Database queries
```typescript
// Use parameterized queries ALWAYS
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

### Error handling
```typescript
try {
  // Business logic
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({ error: 'User-friendly message' });
}
```

### Authentication
```typescript
// All protected routes need verifyToken middleware
router.post('/protected', verifyToken, async (req, res) => {
  const userId = (req as any).user?.id;
  // Now you have userId
});
```

## Environment Setup per Node.js Major Version

```bash
# Check Node version
node --version  # Should be v18+

# If using NVM (recommended)
nvm install 18
nvm use 18

# Verify npm
npm --version  # Should be 9+
```

## Debugging

### Backend
```bash
# Enable debug logging
DEBUG=* npm run dev

# Or VS Code debugger
# Add launch config to .vscode/launch.json
```

### Frontend
```bash
# React DevTools browser extension
# Redux DevTools (when added)
# Network tab to monitor API calls
```

## Performance Optimization

### Backend
- Add database indexes for frequently queried columns
- Cache Claude API responses
- Rate limit API endpoints

### Frontend
- Code split routes with React.lazy()
- Optimize images
- Minimize bundle size

## Security Checklist

- [ ] Passwords hashed with bcrypt
- [ ] JWT tokens properly signed
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React escapes by default)
- [ ] CORS configured correctly
- [ ] Secrets not in .env.example
- [ ] Rate limiting on public endpoints
- [ ] Input validation on all API endpoints

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes, test locally
3. Commit: `git commit -m "Add feature"`
4. Push: `git push origin feature/my-feature`
5. Create PR with description

## Resources

- [Express.js docs](https://expressjs.com/)
- [React docs](https://react.dev/)
- [Anthropic API docs](https://docs.anthropic.com/)
- [Stripe API docs](https://stripe.com/docs/api)
- [PostgreSQL docs](https://www.postgresql.org/docs/)
