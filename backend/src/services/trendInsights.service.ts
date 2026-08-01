import { TrendPoint, countTrailingDecliningMonths } from "./kpiEngine.service.js";

const DECLINE_STREAK_THRESHOLD_MONTHS = 3;

export const generateTrendInsights = (trend: TrendPoint[]): string[] => {
  const insights: string[] = [];

  if (trend.length < 2) return insights;

  const first = trend[0].revenue;
  const last = trend[trend.length - 1].revenue;

  if (first > 0) {
    const overallChangePct = round1(((last - first) / first) * 100);

    insights.push(
      overallChangePct >= 0
        ? `Revenue grew ${overallChangePct}% from ${trend[0].month} to ${
            trend[trend.length - 1].month
          }.`
        : `Revenue fell ${Math.abs(overallChangePct)}% from ${
            trend[0].month
          } to ${trend[trend.length - 1].month}.`
    );
  }

  const biggestSwing = findBiggestMonthOverMonthSwing(trend);

  if (biggestSwing) {
    insights.push(
      `The largest month-over-month change was ${biggestSwing.direction} ${biggestSwing.pct}% in ${biggestSwing.month}.`
    );
  }

  const decliningStreak = countTrailingDecliningMonths(trend);

  if (decliningStreak >= DECLINE_STREAK_THRESHOLD_MONTHS) {
    insights.push(
      `Revenue has declined for ${decliningStreak} consecutive months.`
    );
  }

  return insights;
};

const findBiggestMonthOverMonthSwing = (
  trend: TrendPoint[]
): { month: string; pct: number; direction: "up" | "down" } | null => {
  let biggest: {
    month: string;
    pct: number;
    direction: "up" | "down";
  } | null = null;

  for (let i = 1; i < trend.length; i++) {
    const prev = trend[i - 1].revenue;

    if (prev === 0) continue;

    const pct = round1(
      Math.abs(((trend[i].revenue - prev) / prev) * 100)
    );

    if (!biggest || pct > biggest.pct) {
      biggest = {
        month: trend[i].month,
        pct,
        direction: trend[i].revenue >= prev ? "up" : "down",
      };
    }
  }

  return biggest;
};

const round1 = (value: number): number => {
  return Math.round(value * 10) / 10;
};