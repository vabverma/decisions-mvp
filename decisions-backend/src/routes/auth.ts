import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/init';
import { getStripe } from '../services/stripe.service';
import { sendWelcomeEmail } from '../services/email.service';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

interface AuthRequest extends Request {
  user?: { id: string; email: string };
  body: {
    email?: string;
    password?: string;
    storeName?: string;
  };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }
  return secret;
}

router.post('/register', authLimiter, async (req: AuthRequest, res: Response) => {
  const { email, password, storeName } = req.body;

  try {
    // Validate input
    if (!email || !password || !storeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash password with stronger rounds
    const passwordHash = await bcrypt.hash(password, 12);

    // Create Stripe customer
    const stripeCustomer = await getStripe().customers.create({
      email,
      metadata: { storeName },
    });

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, stripe_customer_id, store_name, subscription_tier)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, subscription_tier`,
      [email, passwordHash, stripeCustomer.id, storeName, 'free']
    );

    // Create usage tracking record
    const user = result.rows[0];
    await pool.query(
      `INSERT INTO usage_tracking (user_id) VALUES ($1)`,
      [user.id]
    );

    // Send welcome email
    await sendWelcomeEmail(email, storeName).catch(err =>
      console.error('Failed to send welcome email:', err)
    );

    const token = jwt.sign({ id: user.id, email: user.email }, getJwtSecret());

    res.json({ user, token });
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', authLimiter, async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, getJwtSecret());
    res.json({ user: { id: user.id, email: user.email, subscription_tier: user.subscription_tier }, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
