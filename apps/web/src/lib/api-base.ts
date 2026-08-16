/**
 * Where the admin finds the API: on its own origin, under /api.
 *
 * It used to be NEXT_PUBLIC_API_URL, pointing at the NestJS service on
 * Render. That variable is deliberately not read any more — left set on
 * Vercel it would keep the admin talking to the old server. The new one only
 * exists to point a local admin at another API while developing.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_BASE || "/api";
