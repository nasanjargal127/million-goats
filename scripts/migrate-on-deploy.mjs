// Applies pending Prisma migrations during Vercel *production* builds only.
//
// - Production (VERCEL_ENV=production): runs `prisma migrate deploy` against
//   DIRECT_URL. If it fails, the build fails and the old deployment stays live.
// - Preview and local builds: skipped. Previews share the production database,
//   so migrations from unmerged branches must never run there.
//
// The migration runs before the new code goes live, while the previous
// deployment is still serving traffic — keep migrations backward-compatible
// (add columns/tables first; remove old ones in a later release).

import { spawnSync } from "node:child_process";

const env = process.env.VERCEL_ENV;

if (env !== "production") {
  console.log(`[migrate] Skipping prisma migrate deploy (VERCEL_ENV=${env ?? "unset"}).`);
  process.exit(0);
}

if (!process.env.DIRECT_URL) {
  console.error("[migrate] DIRECT_URL is not set for production; refusing to migrate.");
  process.exit(1);
}

console.log("[migrate] Applying pending migrations (production)…");
const result = spawnSync("prisma", ["migrate", "deploy"], { stdio: "inherit", shell: false });
if (result.error) {
  console.error("[migrate] Could not run prisma:", result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
