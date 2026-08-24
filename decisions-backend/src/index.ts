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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
