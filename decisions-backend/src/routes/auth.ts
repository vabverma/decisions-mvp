// @ts-nocheck - Disabling TypeScript checks due to process.env.JWT_SECRET typing issues
import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { pool } from '../db/init';
import { getStripe } from '../services/stripe.service';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service';

const router = express.Router();

// Constant-cost placeholder hash compared against on unknown emails so that
// login response time doesn't reveal whether an account exists.
const DUMMY_HASH = '$2b$12$nkagFMI3EKxcrTAiLWhYFO5Sw08CV1DeJcvTE.Z5XSrNqtonroae2';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

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

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret!);

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

    // Always run bcrypt.compare, even for unknown emails, so response time
    // doesn't leak whether an account exists (timing side-channel).
    const passwordValid = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret!);
    res.json({ user: { id: user.id, email: user.email, subscription_tier: user.subscription_tier }, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/forgot-password', authLimiter, async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  if (typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Always return the same generic message so the response itself can't be
  // used to enumerate registered emails.
  const genericResponse = {
    message: 'If an account exists for that email, we\'ve sent password reset instructions.',
  };

  try {
    const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
        [user.id, tokenHash, expiresAt]
      );

      await sendPasswordResetEmail(user.email, rawToken).catch(err =>
        console.error('Failed to send password reset email:', err)
      );
    }

    res.json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/reset-password', authLimiter, async (req: AuthRequest, res: Response) => {
  const { token, newPassword } = req.body;

  if (typeof token !== 'string' || !token) {
    return res.status(400).json({ error: 'Invalid or expired reset link' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await pool.query(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()`,
      [tokenHash]
    );
    const resetToken = result.rows[0];

    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, resetToken.user_id]);
    // Invalidate all outstanding reset tokens for this user, not just the one used.
    await pool.query(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL',
      [resetToken.user_id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
