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
} from 'chart.js';
import { RevenueDataPoint, AnomalyData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueChartProps {
  data: RevenueDataPoint[];
  anomalies?: AnomalyData[];
  onDateClick?: (date: string) => void;
}

export default function RevenueChart({ data, anomalies = [], onDateClick }: RevenueChartProps) {
  const labels = data.map(point => point.date);
  
  // create anomaly data points - need to match indices with revenue data
  const anomalyData = labels.map((date) => {
    const anomaly = anomalies.find(a => a.date === date);
    return anomaly ? anomaly.value : null;
  });

  const datasets: any[] = [
    {
      label: 'Revenue',
      data: data.map(point => point.revenue),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1,
    },
  ];

  // add anomalies dataset if anomalies exist
  if (anomalies.length > 0) {
    datasets.push({
      label: 'Anomalies',
      data: anomalyData,
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgb(255, 99, 132)',
      pointRadius: 8,
      pointHoverRadius: 10,
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      showLine: false,
      pointStyle: 'circle',
    });
  }

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0 && onDateClick) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const index = element.index;
        
        // only handle clicks on revenue line (not anomalies)
        if (datasetIndex === 0 && index < labels.length) {
          const clickedDate = labels[index];
          onDateClick(clickedDate);
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenue Trends (Click a point to view transactions)',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label === 'Anomalies' && value !== null) {
              const anomaly = anomalies.find(a => a.date === labels[context.dataIndex]);
              return `${label}: $${value.toFixed(2)} (score: ${anomaly?.score.toFixed(3)})`;
            }
            return `${label}: $${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
