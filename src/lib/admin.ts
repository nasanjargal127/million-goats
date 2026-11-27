import "server-only";
import { notFound, redirect } from "next/navigation";
import { getSession } from "./auth";
import { prisma } from "./db";

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

/**
 * Admins listed in ADMIN_USER_IDS. They stay admins whatever their role says,
 * so a mistake on /admin/users can never lock everyone out.
 * Read on every check, so an env change applies without restarting the server.
 */
export function isEnvAdmin(userId: string) {
  return userIdsFromEnv("ADMIN_USER_IDS").has(userId);
}

/** An env admin, or a user given the ADMIN role on /admin/users. */
export async function isAdmin(userId: string) {
  if (isEnvAdmin(userId)) return true;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === "ADMIN";
}

/** Session of an admin; sends others to sign in, and hides the page from non-admins. */
export async function requireAdmin(next: string) {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  if (!(await isAdmin(session.user.id))) notFound();
  return session;
}
