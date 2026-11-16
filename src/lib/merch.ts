import "server-only";
import type { Fulfillment } from "@/generated/prisma/client";
import { assertPaymentAvailable, attachInvoice, BookingError, HOLD_MINUTES } from "./booking";
import { prisma } from "./db";

export const MERCH_SLUG = "traders-dept-tee";
export const MAX_MERCH_QUANTITY = 5;

/** The shop's product with its sizes, in display order; null if not set up or inactive. */
export async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  return product?.active ? product : null;
}

export type MerchCheckout = {
  userId: string;
  variantId: string;
  quantity: number;
  fulfillment: Fulfillment;
  phone: string;
  address: string | null;
};

/**
 * Creates a PENDING merch order and its QPay invoice. Tracked stock is reserved
 * with a conditional decrement, so a size can never be oversold; it is given
 * back if the order expires or the invoice can't be created.
 */
export async function createMerchOrder(input: MerchCheckout) {
  if (input.quantity < 1 || input.quantity > MAX_MERCH_QUANTITY) {
    throw new BookingError("INVALID", `1–${MAX_MERCH_QUANTITY} ширхэг сонгоно уу.`);
  }
  if (input.fulfillment === "DELIVERY" && !input.address) {
    throw new BookingError("INVALID", "Хүргэлтийн хаягаа оруулна уу.");
  }
  assertPaymentAvailable();

  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
    include: { product: true },
  });
  if (!variant?.product.active) throw new BookingError("INVALID", "Бараа олдсонгүй.");

  const itemLabel = `${variant.product.name} · ${variant.size} × ${input.quantity}`;
  const amount = variant.product.priceMnt * input.quantity;

  const order = await prisma.$transaction(async (tx) => {
    if (variant.stock !== null) {
      const reserved = await tx.productVariant.updateMany({
        where: { id: variant.id, stock: { gte: input.quantity } },
        data: { stock: { decrement: input.quantity } },
      });
      if (reserved.count !== 1) {
        throw new BookingError("TAKEN", `${variant.size} хэмжээ хүрэлцэхгүй байна.`);
      }
    }
    return tx.order.create({
      data: {
        kind: "MERCH",
        userId: input.userId,
        amountMnt: amount,
        seatLabels: [],
        itemLabel,
        variantId: variant.id,
        quantity: input.quantity,
        fulfillment: input.fulfillment,
        contactPhone: input.phone,
        deliveryAddress: input.fulfillment === "DELIVERY" ? input.address : null,
        expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000),
      },
    });
  });

  await attachInvoice({ orderId: order.id, userId: input.userId, description: itemLabel, amount });
  return order.id;
}
