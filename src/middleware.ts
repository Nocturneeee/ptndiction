import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitInfo>();
const WINDOW_SIZE_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS = 60; // 60 requests per window
const MAX_MAP_SIZE = 5000; // Prevent memory leak

export function middleware(request: NextRequest) {
  // Cleanup map if it exceeds size
  if (ipRequestMap.size > MAX_MAP_SIZE) {
    const now = Date.now();
    for (const [ip, info] of ipRequestMap.entries()) {
      if (now > info.resetTime) {
        ipRequestMap.delete(ip);
      }
    }
    // If still too large, clear half
    if (ipRequestMap.size > MAX_MAP_SIZE) {
      let deleted = 0;
      for (const ip of ipRequestMap.keys()) {
        ipRequestMap.delete(ip);
        if (++deleted > MAX_MAP_SIZE / 2) break;
      }
    }
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const now = Date.now();

  let record = ipRequestMap.get(ip);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + WINDOW_SIZE_MS,
    };
    ipRequestMap.set(ip, record);
  } else {
    record.count++;
  }

  if (record.count > MAX_REQUESTS) {
    return NextResponse.json(
      { error: 'Too Many Requests' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': String(MAX_REQUESTS),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000)),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - record.count)));
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
