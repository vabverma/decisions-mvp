import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/init';
import { initSentry } from './services/sentry.service';
import authRoutes from './routes/auth';
import decisionsRoutes from './routes/decisions';
import integrationsRoutes from './routes/integrations';
import analyticsRoutes from './routes/analytics';
import billingRoutes from './routes/billing';
import webhooksRoutes from './routes/webhooks';

initSentry();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

const ALLOWED_ORIGINS = [
  process.env.DASHBOARD_URL,
  process.env.APP_URL,
  'http://localhost:3000',
  'http://localhost:3001',
].filter((origin): origin is string => Boolean(origin));

// CORS: allowlist known frontend origins only (never '*' on an authenticated API)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/decisions', decisionsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/webhooks', webhooksRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  console.log(`🚀 DECISIONS API running on port ${PORT}`);

  try {
    await initializeDatabase();
    console.log('✅ Database initialized');
  } catch (error: any) {
    if (error?.code === '42P07') {
      console.log('ℹ️  Database tables already exist, skipping initialization');
    } else {
      console.error('❌ Database initialization failed:', error);
      process.exit(1);
    }
  }
});
