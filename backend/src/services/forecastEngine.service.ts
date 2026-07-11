import { TrendPoint } from "./kpiEngine.service.js";

export interface ForecastPoint {
  forecastDate: Date;
  predictedValue: number;
}

export const generateForecast = (
  trend: TrendPoint[],
  horizonMonths = 6,
): ForecastPoint[] => {
  if (trend.length === 0) {
    return [];
  }

  const lastMonth = parseMonthKey(trend[trend.length - 1].month);

  if (trend.length < 2) {
    const flatValue = trend[trend.length - 1].revenue;
    return buildHorizon(lastMonth, horizonMonths, () => flatValue);
  }

  const { slope, intercept } = fitLinearRegression(trend);
  const startIndex = trend.length;

  return buildHorizon(lastMonth, horizonMonths, (offset) => {
    const x = startIndex + offset;
    const predicted = slope * x + intercept;
    return Math.max(0, Math.round(predicted * 100) / 100);
  });
};

const fitLinearRegression = (
  trend: TrendPoint[],
): { slope: number; intercept: number } => {
  const n = trend.length;
  const xs = trend.map((_, i) => i);
  const ys = trend.map((point) => point.revenue);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((total, x, i) => total + x * ys[i], 0);
  const sumXX = xs.reduce((total, x) => total + x * x, 0);

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

const buildHorizon = (
  lastKnownMonth: Date,
  horizonMonths: number,
  predict: (offsetFromStart: number) => number,
): ForecastPoint[] => {
  const points: ForecastPoint[] = [];

  for (let i = 1; i <= horizonMonths; i++) {
    const forecastDate = new Date(lastKnownMonth);
    forecastDate.setMonth(forecastDate.getMonth() + i);

    points.push({ forecastDate, predictedValue: predict(i - 1) });
  }

  return points;
};

const parseMonthKey = (monthKey: string): Date => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
};
