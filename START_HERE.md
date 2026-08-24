# 🚀 DECISIONS — START HERE

Welcome! Everything you need is built and documented below.

---

## ⚡ 5-Minute Start

```bash
chmod +x setup.sh
./setup.sh

# Follow prompts, add your API keys to decisions-backend/.env
# Then:

# Terminal 1 — Backend
cd decisions-backend && npm run dev

# Terminal 2 — Frontend  
cd decisions-frontend && npm run dev

# Open http://localhost:3001
```

👉 See **QUICK_START.md** for details

---

## 📚 Documentation Index

Read these in order based on your role:

### 👨‍💼 **Product/Launch** → **LAUNCH_CHECKLIST.md**
- Week-by-week launch plan
- Success metrics & KPIs
- Post-launch tasks

### 💻 **Engineers** → **DEVELOPMENT.md**
- Local setup details
- Adding features
- Code style & conventions
- Debugging tips

### 🧪 **QA/Testing** → **TESTING.md**
- Manual test procedures
- API testing with curl
- Edge case testing
- Troubleshooting guide

### 🚢 **DevOps/Deployment** → **DEPLOYMENT.md**
- Production deployment (Railway, Vercel)
- Stripe webhook setup
- Environment variables
- Monitoring & backups

### 📖 **Everyone** → **README.md**
- Complete project overview
- Features & roadmap
- Financial model
- Architecture

### 📊 **Summary** → **BUILD_SUMMARY.md**
- What's built (files, stats)
- What works (checklists)
- Tech stack
- Next steps

---

## 🎯 Common Tasks

### "I want to test it locally"
→ **QUICK_START.md** (5 min)

### "I want to add a feature"
→ **DEVELOPMENT.md** (setup + workflow)

### "I want to test before launch"
→ **TESTING.md** (all test procedures)

### "I want to deploy to production"
→ **DEPLOYMENT.md** (Railway + Vercel + Stripe)

### "I want to launch on ProductHunt"
→ **LAUNCH_CHECKLIST.md** (week-by-week plan)

### "I need to understand the business"
→ **README.md** (features + financial model)

---

## 📁 Project Structure

```
decisions/
├── decisions-backend/          # Express API
│   ├── src/                   # TypeScript source
│   ├── dist/                  # Compiled (after build)
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── decisions-frontend/         # React dashboard
│   ├── src/                   # React components
│   ├── dist/                  # Built SPA (after build)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── .claude/
│   └── launch.json            # Dev server config
│
├── setup.sh                   # Automated setup
├── .gitignore
│
├── README.md                  # Full overview
├── QUICK_START.md            # 5-min setup
├── DEVELOPMENT.md            # Dev guide
├── TESTING.md                # Test procedures
├── DEPLOYMENT.md             # Production setup
├── LAUNCH_CHECKLIST.md       # Launch plan
└── BUILD_SUMMARY.md          # What's built
```

---

## ✅ Checklist: Getting Started

- [ ] Read this file (you are here!)
- [ ] Review **QUICK_START.md** (2 min)
- [ ] Run `setup.sh` (2 min)
- [ ] Add API keys to `.env` (2 min)
- [ ] Start backend & frontend (2 min)
- [ ] Test the app (2 min)
- [ ] Read **DEVELOPMENT.md** if you're coding

**Total: ~15 minutes**

---

## 🔑 Environment Variables You Need

Get these BEFORE running setup.sh:

1. **Anthropic API Key**
   - Go to https://console.anthropic.com/account/keys
   - Copy your API key
   - Add to `decisions-backend/.env` as `ANTHROPIC_API_KEY`

2. **Stripe Test Keys** (optional for payment testing)
   - Go to https://dashboard.stripe.com/test/keys
   - Copy Secret and Publishable keys
   - Add to `decisions-backend/.env`

That's it! Backend & frontend will work without Stripe locally (won't test payments, but everything else works).

---

## 🎬 What Happens When You Run It

### Backend (port 3000)
```
🚀 DECISIONS API running on port 3000
✅ Database initialized
```
- Express server running
- PostgreSQL connected
- Ready for API calls

### Frontend (port 3001)
```
  VITE v5.0.0  ready in XXX ms
  ➜  Local:   http://localhost:3001/
```
- React app running
- Auto-proxy to backend
- Ready to use

### Database
- PostgreSQL running on port 5432
- Schema auto-initialized
- 8 tables created

---

## 🧪 Quick Test

Once it's running:

1. Go to http://localhost:3001
2. Click "Sign up"
3. Enter test credentials
4. Click "Get Recommendation"
5. Fill in product data
6. See Claude recommendation appear in 2-3 seconds

**That's the whole MVP!** 🎉

---

## 📞 Need Help?

### Setup Issues?
→ See **QUICK_START.md** troubleshooting section

### Development Questions?
→ See **DEVELOPMENT.md** for:
- Database queries
- Error handling
- Adding features
- Debugging

### Testing Questions?
→ See **TESTING.md** for:
- Manual test procedures
- API testing
- Edge cases
- Troubleshooting

### Deployment Issues?
→ See **DEPLOYMENT.md** for:
- Railway setup
- Vercel setup
- Stripe config
- Monitoring

---

## 🚀 Next Steps After Setup

### If you want to code:
1. Open `decisions-backend/src/` or `decisions-frontend/src/`
2. Make changes
3. Backend auto-reloads with `npm run dev`
4. Frontend auto-reloads with Vite HMR
5. See **DEVELOPMENT.md** for patterns

### If you want to test:
1. Follow procedures in **TESTING.md**
2. Use curl for API testing
3. Use browser DevTools for frontend
4. Check database with psql

### If you want to deploy:
1. Follow **DEPLOYMENT.md**
2. Push code to GitHub
3. Connect to Railway (backend)
4. Connect to Vercel (frontend)
5. Configure Stripe
6. Launch!

### If you want to launch:
1. Follow **LAUNCH_CHECKLIST.md**
2. Week 1: Build & test
3. Week 2: Deploy
4. Week 3: Launch (ProductHunt, etc.)
5. Week 4: Post-launch iteration

---

## 📊 Stats at a Glance

| Item | Value |
|------|-------|
| **Backend LOC** | ~2,000 |
| **Frontend LOC** | ~1,500 |
| **Database Tables** | 8 |
| **API Routes** | 5 |
| **React Pages** | 5 |
| **Documentation** | 6 files |
| **Setup Time** | 5-10 min |
| **Ready to Ship** | ✅ Yes |

---

## 🎓 Learn as You Go

Each doc is self-contained:
- **QUICK_START** teaches you how to run it
- **DEVELOPMENT** teaches you how to change it
- **TESTING** teaches you how to verify it
- **DEPLOYMENT** teaches you how to ship it
- **LAUNCH_CHECKLIST** teaches you how to launch it
- **README** teaches you what it is

---

## 🎯 Remember

This is a **production-ready MVP**. 

You can:
- ✅ Run it locally today
- ✅ Deploy it tomorrow
- ✅ Launch it next week
- ✅ Start getting paying customers

No more work needed on core features. Everything is built.

---

**Ready?** Open **QUICK_START.md** and let's go! 🚀

---

*Built with Claude AI • TypeScript • React • Express • PostgreSQL*

*Last updated: August 23, 2026*
