import {
  Metric,
  TrendPoint,
  countTrailingDecliningMonths,
  getTopProductShare,
  RevenueRecord,
} from "./kpiEngine.service.js";
import { ForecastPoint } from "./forecastEngine.service.js";

const PRODUCT_CONCENTRATION_THRESHOLD_PCT = 60;
const FORECAST_GROWTH_THRESHOLD_PCT = 20;
const DECLINE_STREAK_THRESHOLD_MONTHS = 3;

export const generateRecommendations = (
  records: RevenueRecord[],
  kpis: Metric[],
  trend: TrendPoint[],
  forecast: ForecastPoint[],
): string[] => {
  const messages: string[] = [];

  if (countTrailingDecliningMonths(trend) >= DECLINE_STREAK_THRESHOLD_MONTHS) {
    messages.push("Review pricing strategy and marketing efforts.");
  }

  const topProductShare = getTopProductShare(records);

  if (
    topProductShare &&
    topProductShare.share > PRODUCT_CONCENTRATION_THRESHOLD_PCT
  ) {
    messages.push("Reduce dependency on a single product line.");
  }

  if (trend.length > 0 && forecast.length > 0) {
    const lastActual = trend[trend.length - 1].revenue;
    const lastForecast = forecast[forecast.length - 1].predictedValue;

    if (lastActual > 0) {
      const growthPct = ((lastForecast - lastActual) / lastActual) * 100;

      if (growthPct > FORECAST_GROWTH_THRESHOLD_PCT) {
        messages.push("Prepare inventory and staffing for increased demand.");
      }
    }
  }

  if (trend.length >= 4) {
    const midpoint = Math.floor(trend.length / 2);
    const earlierAvg = average(trend.slice(0, midpoint).map((p) => p.revenue));
    const laterAvg = average(trend.slice(midpoint).map((p) => p.revenue));

    if (laterAvg < earlierAvg) {
      messages.push("Investigate customer acquisition and retention.");
    }
  }

  return messages;
};

const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;
