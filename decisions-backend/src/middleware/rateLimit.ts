import rateLimit from 'express-rate-limit';

// Applies to endpoints that call paid third-party APIs (Anthropic, Stripe) or
// make outbound requests on the user's behalf (integrations) — tighter than
// general traffic, looser than auth, since these are used by logged-in users
// during normal operation.
export const costlyEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
