import "server-only";
import { assertPaymentAvailable, attachInvoice, BookingError, HOLD_MINUTES } from "./booking";
import { prisma } from "./db";
import { designLabel, findDesign } from "./merch-shirt";

export const MERCH_SLUG = "traders-dept-tee";
export const MAX_MERCH_QUANTITY = 5;

/** The shop's product with its design × size variants, in display order; null if not set up or inactive. */
export async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  return product?.active ? product : null;
}

/** Creates a PENDING merch order and its QPay invoice; returns the order id. */
export async function createMerchOrder(input: {
  userId: string;
  variantId: string;
  quantity: number;
  phone: string;
}) {
  if (input.quantity < 1 || input.quantity > MAX_MERCH_QUANTITY) {
    throw new BookingError("INVALID", `1–${MAX_MERCH_QUANTITY} ширхэг сонгоно уу.`);
  }
  assertPaymentAvailable();

  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
    include: { product: true },
  });
  const design = variant && findDesign(variant.design);
  if (!variant?.product.active || !design) throw new BookingError("INVALID", "Бараа олдсонгүй.");

  const itemLabel = `${variant.product.name} · ${designLabel(design)} · ${variant.size} × ${input.quantity}`;
  const amount = variant.product.priceMnt * input.quantity;

  const order = await prisma.order.create({
    data: {
      kind: "MERCH",
      userId: input.userId,
      amountMnt: amount,
      seatLabels: [],
      itemLabel,
      variantId: variant.id,
      quantity: input.quantity,
      contactPhone: input.phone,
      expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000),
    },
  });

  await attachInvoice({ orderId: order.id, userId: input.userId, description: itemLabel, amount });
  return order.id;
}
