"use server";

import { refresh } from "next/cache";
import { isAdmin, isEnvAdmin } from "@/lib/admin";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type RoleState = { error: string | null; done: string | null };

/** Gives a user the ADMIN role or takes it away. */
export async function setUserRoleAction(
  userId: string,
  _prev: RoleState,
  role: unknown,
): Promise<RoleState> {
  const session = await getSession();
  if (!session || !(await isAdmin(session.user.id))) {
    return { error: "Зөвхөн админ эрх өөрчлөх боломжтой.", done: null };
  }
  if (userId === session.user.id) {
    return { error: "Өөрийнхөө эрхийг өөрчлөх боломжгүй.", done: null };
  }
  if (isEnvAdmin(userId)) {
    return {
      error: "Энэ админ ADMIN_USER_IDS-д бүртгэлтэй тул эрхийг нь хасах боломжгүй.",
      done: null,
    };
  }
  if (role !== "USER" && role !== "ADMIN") {
    return { error: "Эрхээ сонгоно уу.", done: null };
  }

  const { count } = await prisma.user.updateMany({ where: { id: userId }, data: { role } });
  if (count === 0) return { error: "Хэрэглэгч олдсонгүй.", done: null };
  refresh();
  return { error: null, done: "Хадгалагдлаа." };
}
