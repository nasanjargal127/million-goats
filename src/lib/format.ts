const TZ = "Asia/Ulaanbaatar";

export function formatMnt(amount: number) {
  return `${new Intl.NumberFormat("en-US").format(amount)}₮`;
}

export function formatEventDate(date: Date) {
  const d = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const t = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${d.replaceAll("-", ".")} · ${t}`;
}
