type RateLimitAction = 'profile-update' | 'save' | 'unsave' | 'api';

const store = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const LIMITS: Record<RateLimitAction, number> = {
  'profile-update': 10,
  'save': 30,
  'unsave': 30,
  'api': 100,
};

export const RATE_LIMIT_MESSAGE = 'Too many requests. Please try again in a moment.';

/**
 * Check per-user rate limit for profile update or save/unsave (FR-013).
 * Returns { allowed, message? }. Message set only when allowed is false.
 */
export function checkRateLimit(
  userId: string,
  action: RateLimitAction
): { allowed: boolean; message?: string } {
  const key = `${userId}:${action}`;
  const limit = LIMITS[action];
  const now = Date.now();
  let ent = store.get(key);
  if (!ent || now - ent.windowStart >= WINDOW_MS) {
    ent = { count: 0, windowStart: now };
    store.set(key, ent);
  }
  ent.count += 1;
  if (ent.count > limit) {
    return { allowed: false, message: RATE_LIMIT_MESSAGE };
  }
  return { allowed: true };
}

/**
 * Rate limiter for API routes.
 * @param identifier - Unique identifier (e.g., IP address or user ID)
 * @returns Object with success boolean and optional error response
 */
export async function rateLimit(identifier: string): Promise<{ success: boolean }> {
  const result = checkRateLimit(identifier, 'api');
  return { success: result.allowed };
}
