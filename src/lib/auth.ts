import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { prisma } from "./db";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/** Google sign-in is offered only when its OAuth credentials are configured. */
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

/**
 * Hosts Better Auth may serve. BETTER_AUTH_URL (set locally) pins a single origin;
 * on Vercel it is left unset so each request's host is used if it is listed here —
 * production domains plus this project's own preview deployments.
 */
const ALLOWED_HOSTS = [
  // milliongoats.mn redirects (308) to www; kept in case the redirect changes.
  "milliongoats.mn",
  "www.milliongoats.mn",
  // Production alias Vercel assigns to the project.
  "million-goats-seven.vercel.app",
  // Preview deployments and branch URLs of this project.
  "million-goats-*-nasaavercels-projects.vercel.app",
];

function createAuth() {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? { allowedHosts: ALLOWED_HOSTS, protocol: "https" },
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },
    socialProviders:
      googleClientId && googleClientSecret
        ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
        : {},
    // Must stay last: lets server actions set auth cookies.
    plugins: [nextCookies()],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;

/**
 * Better Auth instance, created on first use. Creating it touches the database
 * adapter, so doing it at import time would make `next build` need DATABASE_URL.
 */
export function getAuth() {
  instance ??= createAuth();
  return instance;
}

/** Current session from the request cookies, or null. Call inside <Suspense>. */
export async function getSession() {
  // Read the request first: during prerendering this defers the work to request
  // time, so the auth instance (and database) is never touched at build.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}
