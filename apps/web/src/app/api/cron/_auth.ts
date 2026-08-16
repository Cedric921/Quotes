import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { env } from "@/server/env";
import { unauthorized, unavailable } from "@/server/http/errors";

/**
 * Scheduled jobs (Vercel Cron, the GitHub Actions workflow) authenticate with
 * `Authorization: Bearer <CRON_SECRET>`. Without a secret configured the jobs
 * are switched off rather than left open.
 */
export function assertCronAuthorized(req: Request): void {
  const secret = env().CRON_SECRET;
  if (!secret) throw unavailable("CRON_SECRET is not configured");

  const header = req.headers.get("authorization") ?? "";
  // Hash both sides so the comparison is constant-time whatever the lengths.
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!timingSafeEqual(digest(header), digest(`Bearer ${secret}`))) throw unauthorized();
}
