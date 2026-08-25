import axios from 'axios';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  name?: string;
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'automatellc23@gmail.com';
const FROM_NAME = 'DECISIONS';

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!SENDGRID_API_KEY) {
    console.log(`📧 [DEV] Email to ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    return;
  }

  try {
    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{ to: [{ email: options.to, name: options.name }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: options.subject,
        content: [{ type: 'text/html', value: options.html }],
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Email sent to ${options.to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.to}:`, error);
  }
}

export async function sendWelcomeEmail(email: string, storeName: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: '🚀 Welcome to DECISIONS',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to DECISIONS, ${storeName}! 🎉</h2>
        <p>Get your first AI pricing recommendation in 2 minutes.</p>
        <p>Upload product data → Claude analyzes → See revenue impact</p>
        <p><a href="${process.env.DASHBOARD_URL}/pricing" style="background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Get Your First Recommendation</a></p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
        <p style="font-size: 12px; color: #999;">Questions? Reply to this email or visit our <a href="${process.env.DASHBOARD_URL}">help center</a>.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.DASHBOARD_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: email,
    subject: '🔑 Reset your DECISIONS password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your DECISIONS password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Reset Password</a></p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
        <p style="font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
      </div>
    `,
  });
}

export async function sendFreeTierLimitEmail(email: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: '📊 Unlimited recommendations await',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You've discovered the power of AI pricing 💪</h2>
        <p>Great job getting your first recommendation! You've hit your free monthly limit.</p>
        <p><strong>Here's what paid customers get:</strong></p>
        <ul>
          <li>Unlimited pricing recommendations</li>
          <li>Inventory forecasting (coming soon)</li>
          <li>Revenue tracking dashboard</li>
          <li>Weekly strategy insights</li>
        </ul>
        <p>Most customers see +$30k-$100k annual revenue from pricing optimization alone.</p>
        <p><a href="${process.env.DASHBOARD_URL}/pricing" style="background: #28a745; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Upgrade to $99/mo</a></p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">
        <p style="font-size: 12px; color: #999;">Or <a href="${process.env.DASHBOARD_URL}">get back to your dashboard</a> to implement your recommendation.</p>
      </div>
    `,
  });
}

export async function sendUpgradeNudgeEmail(email: string, recommendationCount: number): Promise<void> {
  await sendEmail({
    to: email,
    subject: `🚀 You're on fire (${recommendationCount} recs this month!)`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're getting serious about pricing 🎯</h2>
        <p>You've already generated ${recommendationCount} recommendations this month. Your free tier limit is coming up.</p>
        <p><strong>Upgrade now to:</strong></p>
        <ul>
          <li>✅ Get unlimited recommendations</li>
          <li>✅ See real revenue tracking</li>
          <li>✅ Never hit limits again</li>
          <li>✅ Join 100+ stores optimizing prices</li>
        </ul>
        <p><a href="${process.env.DASHBOARD_URL}/pricing" style="background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">Upgrade to Premium (just $99/mo)</a></p>
      </div>
    `,
  });
}

export async function sendSuccessStoryEmail(email: string, productName: string, revenue: number): Promise<void> {
  await sendEmail({
    to: email,
    subject: `💰 Your ${productName} price change is working!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Revenue is up! 📈</h2>
        <p>Your ${productName} price change is showing results.</p>
        <p style="font-size: 24px; color: #28a745; font-weight: bold;">+$${revenue.toLocaleString()}</p>
        <p style="color: #666;">monthly revenue impact detected</p>
        <p>This is exactly the kind of data that makes pricing optimization work. Keep implementing recommendations and watch your revenue grow.</p>
        <p><a href="${process.env.DASHBOARD_URL}/dashboard" style="background: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">View Your Dashboard</a></p>
      </div>
    `,
  });
}
