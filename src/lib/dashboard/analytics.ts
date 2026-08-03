export type RevenuePoint = { date: string; revenue: number; bookings: number };
export type RangeKey = "7d" | "30d" | "3m" | "custom";

export function sliceRange(
  history: RevenuePoint[],
  range: RangeKey,
  custom?: { from: string; to: string },
): RevenuePoint[] {
  if (range === "custom" && custom?.from && custom?.to) {
    return history.filter((p) => p.date >= custom.from && p.date <= custom.to);
  }
  const n = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return history.slice(-n);
}

export function previousSlice(
  history: RevenuePoint[],
  range: RangeKey,
  custom?: { from: string; to: string },
): RevenuePoint[] {
  const current = sliceRange(history, range, custom);
  const n = current.length;
  const startIdx = history.findIndex((p) => p.date === current[0]?.date);
  if (startIdx <= 0) return [];
  return history.slice(Math.max(0, startIdx - n), startIdx);
}

export function aggregate(points: RevenuePoint[]) {
  const totalRevenue = points.reduce((s, p) => s + p.revenue, 0);
  const totalBookings = points.reduce((s, p) => s + p.bookings, 0);
  const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
  return { totalRevenue, totalBookings, avgBookingValue };
}

export function pctChange(curr: number, prev: number): number | null {
  if (prev === 0) return null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}
