import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ForecastResponse } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastChartProps {
  data: ForecastResponse;
}

export default function ForecastChart({ data }: ForecastChartProps) {
  // Vibrant color palette for forecast
  const predictedColor = '#6366f1'; // Indigo
  const upperColor = '#8b5cf6'; // Purple
  const lowerColor = '#a855f7'; // Purple variant
  const confidenceFill = 'rgba(139, 92, 246, 0.1)'; // Light purple fill

  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: 'Lower Bound (95% CI)',
        data: data.lower,
        borderColor: lowerColor,
        backgroundColor: confidenceFill,
        borderWidth: 2,
        borderDash: [5, 5],
        fill: '+1',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
      {
        label: 'Upper Bound (95% CI)',
        data: data.upper,
        borderColor: upperColor,
        backgroundColor: confidenceFill,
        borderWidth: 2,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
      {
        label: 'Predicted Revenue',
        data: data.predicted,
        borderColor: predictedColor,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: predictedColor,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: '500' as const,
          },
          color: 'hsl(var(--color-foreground))',
          filter: function(item: any, chart: any) {
            // Only show predicted and upper bound in legend (lower is redundant)
            return item.datasetIndex === 1 || item.datasetIndex === 2;
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600' as const,
        },
        bodyFont: {
          size: 13,
        },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          color: 'hsl(var(--color-muted-foreground))',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(var(--color-muted-foreground))',
          font: {
            size: 11,
          },
        },
      },
    },
  };

  return (
    <div className="h-[360px] w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
