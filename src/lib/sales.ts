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
  labPackage: string | null;
  quantity: number | null;
};

type MoneyInput = Pick<
  SaleInput,
  "status" | "amountMnt" | "chargedMnt" | "depositMnt" | "depositChargedMnt"
>;

/**
 * The price of what the order's current QPay invoice is for: the first part of
 * an installment order until it is paid, then the balance; otherwise the total.
 */
export function invoicePartMnt(
  order: Pick<SaleInput, "amountMnt" | "depositMnt" | "depositChargedMnt">,
) {
  if (order.depositMnt === null) return order.amountMnt;
  return order.depositChargedMnt === null ? order.depositMnt : order.amountMnt - order.depositMnt;
}

/** What QPay actually collected, its fee and what reaches the business. */
export function saleMoney(order: MoneyInput) {
  let received: number;
  let price: number;
  if (order.depositChargedMnt === null) {
    // One invoice so far: a normal order, or an installment order's first part.
    price = invoicePartMnt(order);
    received = order.chargedMnt ?? price;
  } else if (order.status === "PAID" || order.status === "REFUND_REQUIRED") {
    // Both parts of an installment order are paid.
    price = order.amountMnt;
    received = order.depositChargedMnt + (order.chargedMnt ?? invoicePartMnt(order));
  } else {
    // Only the first part is paid.
    price = order.depositMnt ?? order.amountMnt;
    received = order.depositChargedMnt;
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
    /** Installment orders with only the first part paid, balance still due. */
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
    if (order.labPackage === "PREMIUM") totals.premium += 1;
    if (order.kind === "MERCH") totals.merchItems += order.quantity ?? 1;
  }
  return totals;
}
