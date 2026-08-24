import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/init';
import { getStripe } from '../services/stripe.service';
import { sendWelcomeEmail } from '../services/email.service';

const router = express.Router();

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

router.post('/register', async (req: AuthRequest, res: Response) => {
  const { email, password, storeName } = req.body;

  try {
    // Validate input
    if (!email || !password || !storeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

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

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret');

    res.json({ user, token });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already registered' });
    }
    res.status(400).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
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

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret');
    res.json({ user: { id: user.id, email: user.email, subscription_tier: user.subscription_tier }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Login failed' });
  }
});

export default router;
