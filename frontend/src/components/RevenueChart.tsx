import { useRef } from 'react';
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
import { RevenueDataPoint, AnomalyData } from '../types';

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

interface RevenueChartProps {
  data: RevenueDataPoint[];
  anomalies?: AnomalyData[];
  onDateClick?: (date: string) => void;
}

export default function RevenueChart({ data, anomalies = [], onDateClick }: RevenueChartProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const labels = data.map(point => point.date);
  
  const anomalyData = labels.map((date) => {
    const anomaly = anomalies.find(a => a.date === date);
    return anomaly ? anomaly.value : null;
  });

  // Helper to get revenue data point by index
  const getRevenuePoint = (index: number) => data[index];

  // Vibrant color palette
  const revenueColor = '#6366f1'; // Indigo
  const revenueGradient = 'rgba(99, 102, 241, 0.2)'; // Indigo with opacity
  const anomalyColor = '#ef4444'; // Red

  const datasets: any[] = [
    {
      label: 'Revenue',
      data: data.map(point => point.revenue),
      borderColor: revenueColor,
      backgroundColor: revenueGradient,
      borderWidth: 3,
      tension: 0.4,
      fill: true,
      pointRadius: 0, // Hide default points
      pointHoverRadius: 10, // Show larger point on hover
      pointHoverBackgroundColor: revenueColor,
      pointHoverBorderColor: '#ffffff',
      pointBackgroundColor: revenueColor,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 3,
      pointHoverBorderWidth: 4,
    },
  ];

  if (anomalies.length > 0) {
    datasets.push({
      label: 'Anomalies',
      data: anomalyData,
      borderColor: anomalyColor,
      backgroundColor: anomalyColor,
      pointRadius: 10,
      pointHoverRadius: 12,
      pointBackgroundColor: anomalyColor,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 3,
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
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false, // Show tooltip when hovering anywhere along the line
    },
    onHover: (_event: any, activeElements: any[]) => {
      // Change cursor style when hovering over chart area
      const chart = chartRef.current;
      if (chart && chart.canvas) {
        chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'normal' as const,
          },
          color: 'hsl(var(--color-foreground))',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: {
          size: 15,
          weight: 'bold' as const,
        },
        bodyFont: {
          size: 13,
        },
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        enabled: true,
        intersect: false,
        callbacks: {
          title: function(context: any) {
            const index = context[0]?.dataIndex ?? 0;
            const date = labels[index];
            const dateObj = new Date(date);
            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            return `${date} (${dayOfWeek})`;
          },
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const index = context[0]?.dataIndex ?? context.dataIndex;
            
            if (label === 'Anomalies' && value !== null && value !== undefined) {
              const anomaly = anomalies.find(a => a.date === labels[index]);
              return [
                `${label}: $${value.toFixed(2)}`,
                `Anomaly Score: ${anomaly?.score.toFixed(3)}`,
                `⚠️ Unusual pattern detected`
              ];
            }
            
            // For revenue, show detailed stats
            if (label === 'Revenue' && value !== null && value !== undefined) {
              const currentValue = value;
              const prevIndex = index > 0 ? index - 1 : null;
              const prevPoint = prevIndex !== null ? getRevenuePoint(prevIndex) : null;
              const prevValue = prevPoint?.revenue || null;
              
              const lines = [
                `Revenue: $${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              ];
              
              if (prevValue !== null) {
                const change = currentValue - prevValue;
                const changePercent = prevValue > 0 ? ((change / prevValue) * 100) : 0;
                const changeSymbol = change >= 0 ? '↑' : '↓';
                lines.push(
                  `Change: ${changeSymbol} $${Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%)`
                );
              }
              
              return lines;
            }
            
            // Skip if value is null/undefined (for anomaly dataset when not an anomaly)
            if (value === null || value === undefined) {
              return [];
            }
            
            return `${label}: $${value.toFixed(2)}`;
          },
          afterBody: function(context: any) {
            const index = context[0]?.dataIndex ?? 0;
            const currentPoint = getRevenuePoint(index);
            const revenueValue = currentPoint.revenue;
            
            // Calculate some stats
            const allRevenues = data.map(d => d.revenue);
            const avgRevenue = allRevenues.reduce((a, b) => a + b, 0) / allRevenues.length;
            const isAboveAvg = revenueValue > avgRevenue;
            
            return [
              '',
              `Avg Daily: $${avgRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              isAboveAvg ? '📈 Above average' : '📉 Below average'
            ];
          },
        },
      },
    },
    onClick: (_event: any, elements: any[]) => {
      // Only trigger drawer if clicking directly on a point, not on the line
      // This prevents the blurry backdrop from opening when clicking anywhere on the chart
      if (elements.length > 0 && onDateClick) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const index = element.index;
        
        // Only open drawer if clicking on revenue dataset point (not anomaly or line area)
        // Check if we clicked on an actual point element, not just the line
        if (datasetIndex === 0 && index < labels.length && element.element && element.element.options.radius > 0) {
          const clickedDate = labels[index];
          onDateClick(clickedDate);
        }
      }
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
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
}
