// Simple in-memory rate limiter (resets on server cold start, but effective for a demo)
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  // If no entry exists or the time window has expired, reset the count
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  // If the user has exceeded the limit, block the request
  if (entry.count >= maxRequests) {
    return false;
  }

  // Otherwise, increment the count and allow the request
  entry.count += 1;
  return true;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  return req.headers.get("x-real-ip") || "unknown";
}