// Money maths for the admin sales page. Kept free of database code so it can be
// checked on its own.

/** QPay keeps 1% of every payment. */
export const QPAY_FEE_RATE = 0.01;

type SaleInput = {
  status: string;
  kind: string;
  amountMnt: number;
  chargedMnt: number | null;
  labPackage: string | null;
  quantity: number | null;
};

/** What QPay actually collected, its fee and what reaches the business. */
export function saleMoney(order: Pick<SaleInput, "amountMnt" | "chargedMnt">) {
  const received = order.chargedMnt ?? order.amountMnt;
  const fee = Math.round(received * QPAY_FEE_RATE);
  return {
    received,
    fee,
    net: received - fee,
    /** A test account paid less than the price (see QPAY_TEST_USER_IDS). */
    test: order.chargedMnt !== null && order.chargedMnt < order.amountMnt,
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
  };
  for (const order of orders) {
    if (order.status === "REFUND_REQUIRED") totals.refundRequired += 1;
    if (order.status !== "PAID") continue;
    const money = saleMoney(order);
    if (money.test) {
      totals.testOrders += 1;
      continue;
    }
    totals.orders += 1;
    totals.received += money.received;
    totals.fee += money.fee;
    totals.net += money.net;
    if (order.labPackage === "PRO") totals.pro += 1;
    if (order.labPackage === "PREMIUM") totals.premium += 1;
    if (order.kind === "MERCH") totals.merchItems += order.quantity ?? 1;
  }
  return totals;
}
