import * as Sentry from '@sentry/node';

export function initSentry(): void {
  if (!process.env.SENTRY_DSN) {
    console.log('⚠️  Sentry not configured (SENTRY_DSN missing)');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });

  console.log('✅ Sentry error tracking initialized');
}

export function captureException(error: unknown): void {
  Sentry.captureException(error);
}

export function captureMessage(message: string, level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'): void {
  Sentry.captureMessage(message, level);
}
