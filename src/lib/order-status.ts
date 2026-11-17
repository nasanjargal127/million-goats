import type { OrderStatus } from "@/generated/prisma/client";

/** Status badge text and colours, shared by the account and admin pages. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, { text: string; className: string }> = {
  PAID: { text: "Баталгаажсан", className: "bg-[#DBFFF7] text-mg-mint-text" },
  PENDING: { text: "Төлбөр хүлээгдэж буй", className: "bg-[#E3EEFF] text-[#0047B3]" },
  EXPIRED: { text: "Хугацаа дууссан", className: "bg-mg-surface text-mg-muted" },
  CANCELLED: { text: "Цуцлагдсан", className: "bg-mg-surface text-mg-muted" },
  REFUND_REQUIRED: { text: "Буцаан олголт", className: "bg-[#FFE6DE] text-[#B32600]" },
};
