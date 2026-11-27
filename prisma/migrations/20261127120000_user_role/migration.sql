-- Admins can be promoted from /admin/users instead of only through ADMIN_USER_IDS.
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

ALTER TABLE "user" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';
