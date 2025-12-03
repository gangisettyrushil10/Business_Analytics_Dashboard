import { useState, useEffect } from 'react';
import { CalendarDays, TrendingUp } from 'lucide-react';
import { getForecast } from '../api/client';
import { ForecastResponse } from '../types';
import ForecastChart from '../components/ForecastChart';
import { ChartSkeleton } from '../components/LoadingSkeleton';
import { useToast } from '../contexts/ToastContext';

export default function ForecastPage() {
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [forecastErrorShown, setForecastErrorShown] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setForecastErrorShown(false); // Reset error flag when period changes

      try {
        const data = await getForecast(period);
        setForecastData(data);
        setForecastErrorShown(false); // Reset on success
      } catch (err: any) {
        const errorMessage = err.response?.data?.detail || 'Failed to load forecast';
        // Only show error once per period change
        if (!forecastErrorShown) {
          showToast(errorMessage, 'error');
          setForecastErrorShown(true);
        }
        setForecastData(null); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const averagePrediction =
    forecastData && forecastData.predicted.length
      ? forecastData.predicted.reduce((a, b) => a + b, 0) / forecastData.predicted.length
      : 0;
  const totalPrediction =
    forecastData?.predicted.reduce((a, b) => a + b, 0) ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Predictive analytics</p>
          <h1 className="text-3xl font-semibold tracking-tight">Revenue forecast</h1>
          <p className="text-sm text-muted-foreground">
            Configure the forecasting window to simulate short, medium, or long-term projections.
          </p>
        </div>

        <label className="flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium shadow-sm">
          <span className="text-muted-foreground">Forecast period</span>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="rounded-md border border-input bg-background px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </label>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Prophet time-series model</h2>
            <p className="text-sm text-muted-foreground">
              The shaded area indicates the 95% confidence interval based on historical revenue patterns.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : forecastData ? (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <ForecastChart data={forecastData} />
          </div>

          <div className="grid gap-4 rounded-xl border bg-card p-6 shadow-sm sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Average predicted revenue</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-card-foreground">
                ${averagePrediction.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Total predicted revenue</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-card-foreground">
                ${totalPrediction.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-xs text-muted-foreground">Forecast window</p>
              <div className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-card-foreground">
                <TrendingUp className="h-6 w-6 text-primary" />
                {period} days
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          Upload revenue data to generate reliable forecasts.
        </div>
      )}
    </div>
  );
}
