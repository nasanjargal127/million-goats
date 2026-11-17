import "server-only";
import { notFound, redirect } from "next/navigation";
import { getSession } from "./auth";

/**
 * Comma-separated user ids from an env var. Ids, not emails: sign-up does not
 * verify email addresses, so anyone could register an allowlisted email that
 * its owner has not used yet.
 */
export function userIdsFromEnv(name: string) {
  return new Set(
    (process.env[name] ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

const adminIds = userIdsFromEnv("ADMIN_USER_IDS");

export function isAdmin(userId: string) {
  return adminIds.has(userId);
}

/** Session of an admin; sends others to sign in, and hides the page from non-admins. */
export async function requireAdmin(next: string) {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  if (!isAdmin(session.user.id)) notFound();
  return session;
}
