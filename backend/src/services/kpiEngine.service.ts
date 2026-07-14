export interface RevenueRecord {
  date: Date;
  product?: string;
  revenue: number;
}

export interface Metric {
  metricName: string;
  metricValue: number;
}

export interface TrendPoint {
  month: string; // "2025-01"
  revenue: number;
}

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const sumBy = <T>(items: T[], getValue: (item: T) => number): number =>
  items.reduce((total, item) => total + getValue(item), 0);

const groupByProduct = (records: RevenueRecord[]): Map<string, number> => {
  const totals = new Map<string, number>();

  for (const record of records) {
    const product = record.product ?? "All Products";
    totals.set(product, (totals.get(product) ?? 0) + record.revenue);
  }

  return totals;
};

export const computeKPIs = (records: RevenueRecord[]): Metric[] => {
  if (records.length === 0) {
    return [];
  }

  const totalRevenue = sumBy(records, (r) => r.revenue);
  const totalTransactions = records.length;
  const averageRevenue = totalRevenue / totalTransactions;

  const productTotals = groupByProduct(records);
  const sortedProducts = [...productTotals.entries()].sort(
    (a, b) => b[1] - a[1],
  );
  const highestProduct = sortedProducts[0] ?? ["All Products", 0];
  const lowestProduct = sortedProducts[sortedProducts.length - 1] ?? [
    "All Products",
    0,
  ];

  const trend = computeRevenueTrend(records).trend;
  let revenueGrowthPct = 0;

  if (trend.length >= 2) {
    const previous = trend[trend.length - 2].revenue;
    const current = trend[trend.length - 1].revenue;
    revenueGrowthPct =
      previous === 0 ? 0 : ((current - previous) / previous) * 100;
  }

  return [
    { metricName: "Total Revenue", metricValue: round2(totalRevenue) },
    { metricName: "Average Revenue", metricValue: round2(averageRevenue) },
    {
      metricName: "Highest Revenue Product",
      metricValue: round2(highestProduct[1]),
    },
    {
      metricName: "Lowest Revenue Product",
      metricValue: round2(lowestProduct[1]),
    },
    { metricName: "Total Transactions", metricValue: totalTransactions },
    { metricName: "Revenue Growth %", metricValue: round2(revenueGrowthPct) },
  ];
};
export const computeRevenueTrend = (
  records: RevenueRecord[],
): { trend: TrendPoint[]; insights: string[] } => {
  const totalsByMonth = new Map<string, number>();

  for (const record of records) {
    const key = monthKey(record.date);
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + record.revenue);
  }

  const trend = [...totalsByMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, revenue]) => ({ month, revenue: round2(revenue) }));

  const insights: string[] = [];

  for (let i = 1; i < trend.length; i++) {
    const prev = trend[i - 1].revenue;
    const curr = trend[i].revenue;

    if (prev === 0) continue;

    const changePct = ((curr - prev) / prev) * 100;

    if (Math.abs(changePct) >= 1) {
      insights.push(
        `Revenue ${changePct >= 0 ? "increased" : "decreased"} ${Math.abs(
          round2(changePct),
        )}% from ${trend[i - 1].month} to ${trend[i].month}.`,
      );
    }
  }

  const decliningStreak = countTrailingDecliningMonths(trend);
  if (decliningStreak >= 3) {
    insights.push(
      `Revenue has declined for ${decliningStreak} consecutive months.`,
    );
  }

  return { trend, insights };
};

export const countTrailingDecliningMonths = (trend: TrendPoint[]): number => {
  let streak = 0;

  for (let i = trend.length - 1; i > 0; i--) {
    if (trend[i].revenue < trend[i - 1].revenue) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

const round2 = (value: number): number => Math.round(value * 100) / 100;
