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
  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: 'Predicted Revenue',
        data: data.predicted,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1,
        fill: false,
      },
      {
        label: 'Upper Bound (95% CI)',
        data: data.upper,
        borderColor: 'rgba(75, 192, 192, 0.3)',
        backgroundColor: 'rgba(75, 192, 192, 0.05)',
        borderDash: [5, 5],
        fill: '+1',
        tension: 0.1,
      },
      {
        label: 'Lower Bound (95% CI)',
        data: data.lower,
        borderColor: 'rgba(75, 192, 192, 0.3)',
        backgroundColor: 'rgba(75, 192, 192, 0.05)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenue Forecast with Confidence Intervals',
      },
      tooltip: {
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
        title: {
          display: true,
          text: 'Revenue ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <div style={{ 
      padding: '1rem', 
      background: 'var(--bg-secondary)', 
      borderRadius: '8px', 
      marginBottom: '2rem',
      border: `1px solid var(--border-color)`,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
    }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

