// Money maths for the admin sales page. Kept free of database code so it can be
// checked on its own.

/** QPay keeps 1% of every payment. */
export const QPAY_FEE_RATE = 0.01;

/** Orders that brought in money, fully or (installments) only the first part. */
export const MONEY_STATUSES = [
  "PAID",
  "REFUND_REQUIRED",
  "DEPOSIT_PAID",
  "BALANCE_UNPAID",
] as const;

type SaleInput = {
  status: string;
  kind: string;
  amountMnt: number;
  chargedMnt: number | null;
  depositMnt: number | null;
  depositChargedMnt: number | null;
  depositPaidAt: Date | null;
  installmentCount: number | null;
  partsPaid: number;
  partPayments: unknown;
  labPackage: string | null;
  quantity: number | null;
  qpayInvoiceId: string | null;
  depositInvoiceId: string | null;
};

type InstallmentInput = Pick<
  SaleInput,
  "amountMnt" | "depositMnt" | "depositPaidAt" | "installmentCount" | "partsPaid"
>;

type MoneyInput = InstallmentInput &
  Pick<
    SaleInput,
    | "status"
    | "chargedMnt"
    | "depositChargedMnt"
    | "partPayments"
    | "qpayInvoiceId"
    | "depositInvoiceId"
  >;

/** How many parts an installment order is paid in; null when it is paid in full. */
export function installmentCount(order: Pick<SaleInput, "depositMnt" | "installmentCount">) {
  if (order.depositMnt === null) return null;
  return order.installmentCount ?? 2; // rows from before 4 parts existed
}

/**
 * Parts paid before the last one. An order whose first part was paid just
 * before partsPaid existed only has depositPaidAt set.
 */
export function partsPaidBeforeLast(order: Pick<SaleInput, "partsPaid" | "depositPaidAt">) {
  return Math.max(order.partsPaid, order.depositPaidAt === null ? 0 : 1);
}

/** The price of part `part` (from 1) of an installment order; the total otherwise. */
export function partMnt(order: InstallmentInput, part: number) {
  const count = installmentCount(order);
  if (count === null || order.depositMnt === null) return order.amountMnt;
  return part < count ? order.depositMnt : order.amountMnt - order.depositMnt * (count - 1);
}

/** What QPay collected for the parts between the first and the last. */
function middlePartsChargedMnt(partPayments: unknown) {
  if (!Array.isArray(partPayments)) return 0;
  return partPayments.reduce<number>((sum, p) => {
    const charged = (p as { chargedMnt?: unknown } | null)?.chargedMnt;
    return sum + (typeof charged === "number" ? charged : 0);
  }, 0);
}

/**
 * Paid without QPay: an admin booked it by hand (bank transfer or cash), so it
 * never had an invoice. Every QPay order keeps its invoice id once paid.
 */
export function isManualOrder(
  order: Pick<SaleInput, "status" | "qpayInvoiceId" | "depositInvoiceId">,
) {
  return order.status === "PAID" && order.qpayInvoiceId === null && order.depositInvoiceId === null;
}

/**
 * The price of what the order's current QPay invoice is for: the next unpaid
 * part of an installment order (the last one once it is PAID); otherwise the total.
 */
export function invoicePartMnt(order: InstallmentInput) {
  return partMnt(order, partsPaidBeforeLast(order) + 1);
}

/** What QPay actually collected, its fee and what reaches the business. */
export function saleMoney(order: MoneyInput) {
  // Booked by hand at the full price, with no QPay fee.
  if (isManualOrder(order)) {
    return { received: order.amountMnt, fee: 0, net: order.amountMnt, test: false };
  }
  let received: number;
  let price: number;
  if (order.depositChargedMnt === null) {
    // One invoice so far: a normal order, or an installment order's first part.
    price = invoicePartMnt(order);
    received = order.chargedMnt ?? price;
  } else {
    // Installment order with parts already paid and moved aside.
    const paidBefore = order.depositChargedMnt + middlePartsChargedMnt(order.partPayments);
    const paidBeforePrice = (order.depositMnt ?? 0) * partsPaidBeforeLast(order);
    if (order.status === "PAID" || order.status === "REFUND_REQUIRED") {
      // The current invoice was paid too: the last part, or a part paid too late.
      price = paidBeforePrice + invoicePartMnt(order);
      received = paidBefore + (order.chargedMnt ?? invoicePartMnt(order));
    } else {
      price = paidBeforePrice;
      received = paidBefore;
    }
  }
  const fee = Math.round(received * QPAY_FEE_RATE);
  return {
    received,
    fee,
    net: received - fee,
    /** A test account paid less than the price (see QPAY_TEST_USER_IDS). */
    test: received < price,
  };
}

/** Totals over real (non-test) paid orders. */
export function summarizeSales(orders: SaleInput[]) {
  const totals = {
    received: 0,
    fee: 0,
    net: 0,
    orders: 0,
    pro: 0,
    premium: 0,
    merchItems: 0,
    testOrders: 0,
    refundRequired: 0,
    /** Installment orders with some parts paid and the rest still due. */
    balanceDue: 0,
    balanceUnpaid: 0,
  };
  for (const order of orders) {
    if (order.status === "REFUND_REQUIRED") totals.refundRequired += 1;
    if (order.status === "DEPOSIT_PAID") totals.balanceDue += 1;
    if (order.status === "BALANCE_UNPAID") totals.balanceUnpaid += 1;
    if (!["PAID", "DEPOSIT_PAID", "BALANCE_UNPAID"].includes(order.status)) continue;
    const money = saleMoney(order);
    if (money.test) {
      totals.testOrders += 1;
      continue;
    }
    totals.orders += 1;
    totals.received += money.received;
    totals.fee += money.fee;
    totals.net += money.net;
    // Packages count while the seat is theirs, so not after an unpaid balance.
    if (order.status === "BALANCE_UNPAID") continue;
    if (order.labPackage === "PRO") totals.pro += 1;
    if (order.labPackage === "PREMIUM" || order.labPackage === "PREMIUM_2M") totals.premium += 1;
    if (order.kind === "MERCH") totals.merchItems += order.quantity ?? 1;
  }
  return totals;
}
